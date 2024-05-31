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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($_POST !== null) {
        try {
            // CSRFトークンの検証
            validateCsrfToken($_POST['csrfToken']);

            // userIdが整数であることを確認
            $userId = validateAndSanitizeInt($_POST['userId']);
            if ($userId === null) {
                throw new Exception('Invalid userId');
            }

            // tableTypeが有効な値であることを確認
            if (!isset($_POST['tableType']) || !in_array($_POST['tableType'], ['todo', 'money', 'health', 'monthlyMemo', 'project', 'section', 'timeTaken'])) {
                throw new Exception('Invalid tableType');
            }

            // MySQLデータベースに接続
            $pdo = new PDO($db_dsn, $db_user, $db_password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            // userIdとtableTypeを使用してテーブル名を作成
            $tableType = (string)$_POST['tableType'];
            $tableName = $tableType . '_' . $userId;

            // テーブル名のホワイトリスト検証
            if (!preg_match('/^(todo|money|health|monthlyMemo|project|section|timeTaken)_\d+$/', $tableName)) {
                throw new Exception('Invalid table name');
            }

            // クエリを準備して実行
            $stmt = $pdo->prepare("SELECT * FROM `$tableName`");
            $stmt->execute();

            // クエリの結果を全て取得
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // memoに対して、htmlspecialchars_decode() を適用
            if (in_array($tableType, ['todo', 'health', 'project', 'section', 'monthlyMemo'])) {
                foreach ($result as &$row) {
                    if (isset($row['memo'])) {
                        $row['memo'] = htmlspecialchars_decode($row['memo'], ENT_QUOTES);
                    }
                }
            }

            echo json_encode(['success' => true, 'data' => $result]);

        } catch (PDOException $e) {
            error_log($e->getMessage());  // エラーログに詳細を記録
            echo json_encode(['success' => false, 'error' => 'データベースへの接続に失敗しました']);

        } catch (Exception $e) {
            error_log($e->getMessage());  // エラーログに詳細を記録
            echo json_encode(['success' => false, 'error' => '不正なリクエストです']);

        } finally {
            $pdo = null;
        }
    }
}
?>
