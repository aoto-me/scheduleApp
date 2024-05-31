<?php
declare(strict_types=1);

header('Access-Control-Allow-Credentials: true');

require_once('./session.php');
require_once('./functions.php');

require_once('../vendor/autoload.php');
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

use Firebase\JWT\JWT;

$db_host = $_ENV['DB_HOST'];
$db_name = $_ENV['DB_NAME'];
$db_user = $_ENV['DB_USER'];
$db_password = $_ENV['DB_PASSWORD'];
$db_dsn = "mysql:host={$db_host};dbname={$db_name};charset=utf8mb4";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $userName = isset($_POST['userName']) ? sanitizeAndTrim($_POST['userName']) : null;
    $password = isset($_POST['password']) ? sanitizeAndTrim($_POST['password']) : null;

    if ($userName && $password) {
        try {
            // MySQLデータベースに接続
            $pdo = new PDO($db_dsn, $db_user, $db_password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            // userNameを使用してデータベースからユーザー情報を取得する
            $stmt = $pdo->prepare('SELECT id, password FROM users WHERE userName = :userName');
            $stmt->bindParam(':userName', $userName, PDO::PARAM_STR);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            // パスワードが一致した場合
            if ($user && password_verify($password, $user['password'])) {
                $secretKey = $_ENV['JWT_SECRET_KEY'];
                // payloadにuserNameとユーザーIDを追加
                $payload = [
                    'userName' => $userName,
                    'userId' => $user['id'],
                    'exp' => time() + (60 * 60 * 12)  // 有効期限12時間
                ];
                $token = JWT::encode($payload, $secretKey, 'HS256');

                // セッションを開始してCSRFトークンを生成
                session_start();
                $_SESSION['csrfToken'] = bin2hex(random_bytes(32));

                // クッキーにトークンを保存
                setcookie('token', $token, [
                    'expires' => time() + (60 * 60 * 12),  // クッキーの有効期限
                    'path' => '/',  // クッキーのパス
                    'domain' => 'scheduler.1coffee9milk.com',  // クッキーのドメイン
                    'secure' => true,  // HTTPSを使用する場合はtrue
                    'httponly' => true,  // JavaScriptからアクセスできないようにする
                    'samesite' => 'Strict'  // クロスサイトリクエストフォージェリ (CSRF) 攻撃を防ぐ
                ]);

                // ユーザーIDとCSRFトークンを返す
                echo json_encode(['success' => true, 'userId' => $user['id'], 'csrfToken' => $_SESSION['csrfToken']]);
            } else {
                // パスワードが一致しない場合
                echo json_encode(['success' => false, 'error' => 'ユーザー名またはパスワードが不正です']);
            }
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'error' => 'データベースへの接続に失敗しました']);
        } finally {
            $pdo = null;
        }
    } else {
        echo json_encode(['success' => false, 'error' => '入力データが不完全です']);
    }
}
?>
