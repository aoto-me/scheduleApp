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
$db_dsn = "mysql:host={$db_host};dbname={$db_name};charset=utf8mb4";

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST)) {
        try {
            // CSRFトークンの検証
            validateCsrfToken($_POST['csrfToken']);

            // userIdが整数であることを確認
            $userId = validateAndSanitizeInt($_POST['userId']);
            if ($userId === null) {
                throw new Exception('Invalid userId');
            }

            // idとsortが配列であることを確認
            if (!isset($_POST['id']) || !isset($_POST['sort']) || !is_array($_POST['id']) || !is_array($_POST['sort']) || count($_POST['id']) !== count($_POST['sort'])){
            throw new Exception('Invalid input data');
            }

            // tableTypeが有効な値であることを確認
            if (!isset($_POST['tableType']) || !in_array($_POST['tableType'], ['todo', 'section'])) {
                throw new Exception('Invalid tableType');
            }

            // userIdとtableTypeを使用してテーブル名を作成
            $tableType = (string)$_POST['tableType'];
            $tableName = $tableType . '_' . $userId;

            // テーブル名のホワイトリスト検証
            if (!preg_match('/^(todo|section)_\d+$/', $tableName)) {
                throw new Exception('Invalid table name');
            }

            // MySQLデータベースに接続
            $pdo = new PDO($db_dsn, $db_user, $db_password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            // トランザクション開始
            $pdo->beginTransaction();

            if( $tableType === 'section') {
                // 既存のsectionデータを更新
                foreach ($_POST['id'] as $index => $id) {
                    $sanitizedId = validateAndSanitizeInt($id);
                    $sanitizedSort = validateAndSanitizeInt($_POST['sort'][$index]);
                    if ($sanitizedId === null || $sanitizedSort === null) {
                        throw new Exception('Invalid input data');
                    }
                    $stmt = $pdo->prepare("UPDATE $tableName SET sort=? WHERE id=?");
                    $stmt->execute([$sanitizedSort, $sanitizedId]);
                }
                // コミット
                $pdo->commit();
                echo json_encode(['success' => true]);

            } elseif ( $tableType === 'todo') {
                if (!isset($_POST['sectionId'])){
                    throw new Exception('Invalid input data');
                }
                foreach ($_POST['id'] as $index => $id) {
                    $sanitizedId = validateAndSanitizeInt($id);
                    $sanitizedSort = validateAndSanitizeInt($_POST['sort'][$index]);
                    $sanitizedSectionId = validateAndSanitizeInt($_POST['sectionId'][$index]);
                    $stmt = $pdo->prepare("UPDATE $tableName SET sectionId=?, sort=? WHERE id=?");
                    $stmt->execute([$sanitizedSectionId, $sanitizedSort, $sanitizedId]);
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
