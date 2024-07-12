<?php
declare(strict_types=1);

header('Access-Control-Allow-Credentials: true');

require_once('./functions.php');

require_once('../vendor/autoload.php');
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

$db_host = $_ENV['DB_HOST'];
$db_name = $_ENV['DB_NAME'];
$db_user = $_ENV['DB_USER'];
$db_password = $_ENV['DB_PASSWORD'];
$db_dsn = "mysql:host=$db_host;dbname=$db_name;charset=utf8mb4";

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST)) {
    try {
        // CSRFトークンの検証
        validateCsrfToken($_POST['csrfToken']);

        // 入力データのバリデーション
        $userId = validateAndSanitizeInt($_POST['userId']);
        if ($userId === null) {
            throw new Exception('Invalid input data');
        }

        // テーブル名を作成
        $tableName = "memo_$userId";

        // テーブル名のホワイトリスト検証
        if (!preg_match('/^memo_\d+$/', $tableName)) {
            throw new Exception('Invalid table name');
        }

        // MySQLデータベースに接続
        $pdo = new PDO($db_dsn, $db_user, $db_password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // トランザクション開始
        $pdo->beginTransaction();

        if ($_POST['action'] === 'save') {
            // データを挿入
            $name = sanitize($_POST['name']);
            $memo = sanitize($_POST['memo']);
            if (!$name || !isset($memo)) {
                throw new Exception('Invalid input data');
            }
            $stmt = $pdo->prepare("INSERT INTO $tableName (name, memo) VALUES (?, ?)");
            $stmt->execute([$name, $memo]);
            $memoId = $pdo->lastInsertId(); // 挿入されたデータのIDを取得
            // コミット
            $pdo->commit();
            echo json_encode(['success' => true, 'id' => $memoId]);

        } elseif ($_POST['action'] === 'update') {
            $id = validateAndSanitizeInt($_POST['id']);
            $type = sanitize($_POST['type']);
            if ($id === null || !$type) {
                throw new Exception('Invalid input data');
            }

            // 既存データを更新
            if($type === 'name') {
            $name = sanitize($_POST['name']);
            if (!$name) {throw new Exception('Invalid input data');}
            $stmt = $pdo->prepare("UPDATE $tableName SET name=? WHERE id=?");
            $stmt->execute([$name, $id]);
            }

            if($type === 'memo') {
            $memo = sanitize($_POST['memo']);
            if (!isset($memo)) {throw new Exception('Invalid input data');}
            $stmt = $pdo->prepare("UPDATE $tableName SET memo=? WHERE id=?");
            $stmt->execute([$memo, $id]);
            }

            // コミット
            $pdo->commit();
            echo json_encode(['success' => true]);
        }
    } catch (PDOException $e) {
        // ロールバック
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        // エラーログに記録
        error_log($e->getMessage());
        echo json_encode(['success' => false, 'error' => 'Database error']);
    } catch (Exception $e) {
        // エラーログに記録
        error_log($e->getMessage());
        echo json_encode(['success' => false, 'error' => 'An error occurred']);
    } finally {
        // データベース接続を閉じる
        if (isset($pdo)) {
            $pdo = null;
        }
    }
} else {
    // データが送信されていない場合
    echo json_encode(['success' => false, 'error' => 'No data sent']);
}
?>
