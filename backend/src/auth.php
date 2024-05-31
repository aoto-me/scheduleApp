<?php
declare(strict_types=1);

header('Access-Control-Allow-Credentials: true');

require_once('../vendor/autoload.php');
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // クッキーからトークンを取得
    $token = $_COOKIE['token'] ?? null;
    if (!$token) {
        echo json_encode(['success' => false, 'error' => 'token not found']);
        exit;
    }

    $secretKey = $_ENV['JWT_SECRET_KEY'];

    try {
        // JWTトークンのデコードと検証
        $decoded = JWT::decode($token, new Key($secretKey, 'HS256'));

        // JWTトークンのペイロードを取得
        $userId = $decoded->userId;
        $userName = $decoded->userName;

        // userIdとuserNameがデータベースに存在するか確認
        $db_host = $_ENV['DB_HOST'];
        $db_name = $_ENV['DB_NAME'];
        $db_user = $_ENV['DB_USER'];
        $db_password = $_ENV['DB_PASSWORD'];
        $db_dsn = "mysql:host={$db_host};dbname={$db_name};charset=utf8mb4";

        // MySQLデータベースに接続
        $pdo = new PDO($db_dsn, $db_user, $db_password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // クエリを実行してuserIdとuserNameが一致するユーザーを調べる
        $stmt = $pdo->prepare('SELECT * FROM users WHERE id = :userId AND userName = :userName');
        $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
        $stmt->bindParam(':userName', $userName, PDO::PARAM_STR);
        $stmt->execute();

        // ユーザーがデータベースに存在するか確認
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            // セッション管理ファイルをインクルード
            require_once('./session.php');

            // 古いセッションを破棄し、新しいセッションを開始
            session_unset();
            session_destroy();
            session_start();
            session_regenerate_id(true);

            // 新しいCSRFトークンを生成
            $_SESSION['csrfToken'] = bin2hex(random_bytes(32));

            // 一致するユーザーが存在する場合
            echo json_encode(['success' => true, 'userId' => $userId, 'csrfToken' => $_SESSION['csrfToken']]);
        } else {
            // 一致するユーザーが存在しない場合
            echo json_encode(['success' => false, 'error' => 'User not found']);
        }

        // データベース接続を閉じる
        $pdo = null;
    } catch (\Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}
?>
