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

        // tableTypeが有効な値であることを確認
        if (!isset($_POST['tableType']) || !in_array($_POST['tableType'], ['todo', 'money', 'health', 'project','section','memo'])) {
            throw new Exception('Invalid tableType');
        }

        // 入力データのバリデーション
        $userId = validateAndSanitizeInt($_POST['userId']);
        if ($userId === null) {
            throw new Exception('Invalid userId');
        }

        // IDの処理
        $ids = $_POST['id'] ?? [];
        if (!is_array($ids)) {
            $ids = [$ids]; // 単一のIDを配列に変換
        }

        // MySQLデータベースに接続
        $pdo = new PDO($db_dsn, $db_user, $db_password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // userIdとtableTypeを使用してテーブル名を作成
        $tableType = (string)$_POST['tableType'];
        $tableName = $tableType . '_' . $userId;

        // テーブル名のホワイトリスト検証
        if (!preg_match('/^(todo|money|health|project|section|memo)_\d+$/', $tableName)) {
            throw new Exception('Invalid table name');
        }

        // トランザクション開始
        $pdo->beginTransaction();

        if($tableType === 'money' || $tableType === 'health' || $tableType === 'section' || $tableType === 'memo'){
            $stmt = $pdo->prepare("DELETE FROM $tableName WHERE id = ?");
            foreach ($ids as $id) {
                $stmt->execute([$id]);
            }
            // コミット
            $pdo->commit();
            echo json_encode(['success' => true]);

        } elseif($tableType === 'todo'){
            $tableName2 = "timeTaken_$userId";
            $stmt = $pdo->prepare("DELETE FROM $tableName WHERE id = ?");
            $stmt2 = $pdo->prepare("DELETE FROM $tableName2 WHERE todoId = ?");
            foreach ($ids as $id) {
                $stmt->execute([$id]);
                $stmt2->execute([$id]);
            }
            // コミット
            $pdo->commit();
            echo json_encode(['success' => true]);

        } elseif($tableType === 'project'){
            $tableName2 = "section_$userId";
            $tableName3 = "todo_$userId";
            // 既存データを削除
            $stmt = $pdo->prepare("DELETE FROM $tableName WHERE id = ?");
            // 既存のsectionからデータを削除
            $stmt2 = $pdo->prepare("DELETE FROM $tableName2 WHERE projectId = ?");
            // 既存のtodoを書き換え
            $stmt3 = $pdo->prepare("UPDATE $tableName3 SET projectId = 0, sectionId = 0, sort = 0 WHERE projectId = ?");
            foreach ($ids as $id) {
                $stmt->execute([$id]);
                $stmt2->execute([$id]);
                $stmt3->execute([$id]);
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
