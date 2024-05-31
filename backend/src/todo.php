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
        $date = sanitize($_POST['date']);
        $time = sanitize($_POST['time']);
        $type = sanitize($_POST['type']);
        $projectId = validateAndSanitizeInt($_POST['projectId']);
        $sectionId = validateAndSanitizeInt($_POST['sectionId']);
        $sort = validateAndSanitizeInt($_POST['sort']);
        $content = sanitize($_POST['content']);
        $estimated = sanitize($_POST['estimated']);
        $memo = sanitize($_POST['memo']);
        $completed = validateAndSanitizeInt($_POST['completed']);

        if ($userId === null || !$date || !isset($time) || !$type  || !isset($estimated) || !$content || $completed === null || $projectId === null || $sectionId === null || $sort === null || !isset($memo)) {
            throw new Exception('Invalid input data');
        }

        // テーブル名を作成
        $tableName = "todo_$userId";
        $tableName2 = "timeTaken_$userId";

        // テーブル名のホワイトリスト検証
        if (!preg_match('/^todo_\d+$/', $tableName) || !preg_match('/^timeTaken_\d+$/', $tableName2)) {
            throw new Exception('Invalid table name');
        }

        // MySQLデータベースに接続
        $pdo = new PDO($db_dsn, $db_user, $db_password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // トランザクション開始
        $pdo->beginTransaction();

        if ($_POST['action'] === 'save') {
            // todoテーブルへの挿入
            $stmt = $pdo->prepare("INSERT INTO $tableName (date, time, type, projectId, sectionId, sort, content, estimated, memo, completed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $date,
                $time,
                $type,
                $projectId,
                $sectionId,
                $sort,
                $content,
                $estimated,
                $memo,
                $completed
            ]);
            $todoId = $pdo->lastInsertId();
            // timeTakenテーブルへの挿入
            $timeTakenIds = [];
            if (!empty($_POST['timeTaken'])) {
                foreach ($_POST['timeTaken'] as $timeData) {
                    $start = $date . ' ' . sanitize($timeData['start']);
                    $end = $date . ' ' . sanitize($timeData['end']);
                    $stmt2 = $pdo->prepare("INSERT INTO $tableName2 (todoId, start, end) VALUES (?, ?, ?)");
                    $stmt2->execute([$todoId, $start, $end]);
                    $timeTakenIds[] = $pdo->lastInsertId(); // 挿入されたデータのIDを配列に追加
                }
            }
            // コミット
            $pdo->commit();
            echo json_encode(['success' => true, 'id' => $todoId, 'timeTakenIds' => $timeTakenIds]);

        } elseif ($_POST['action'] === 'update') {
            $id = validateAndSanitizeInt($_POST['id']);
            if ($id === null) {
                throw new Exception('Invalid input data');
            }
            // 既存のtodoデータを更新
            $stmt = $pdo->prepare("UPDATE $tableName SET date=?, time=?, type=?, projectId=?, sectionId=?, sort=?, content=?, estimated=?, memo=?, completed=? WHERE id=?");
            $stmt->execute([
                $date,
                $time,
                $type,
                $projectId,
                $sectionId,
                $sort,
                $content,
                $estimated,
                $memo,
                $completed,
                $id,
            ]);
            // 既存のtimeTakenからデータを削除
            $stmt2 = $pdo->prepare("DELETE FROM $tableName2 WHERE todoId = ?");
            $stmt2->execute([$id]);
            // timetakenテーブルへ新しいデータの挿入
            $timeTakenIds = []; // 各timeTakenのIDを格納する配列
            if (!empty($_POST['timeTaken'])) {
                foreach ($_POST['timeTaken'] as $timeData) {
                    $start = $date . ' ' . sanitize($timeData['start']);
                    $end = $date . ' ' . sanitize($timeData['end']);
                    $stmt3 = $pdo->prepare("INSERT INTO $tableName2 (todoId, start, end) VALUES (?, ?, ?)");
                    $stmt3->execute([$id, $start, $end]);
                    $timeTakenIds[] = $pdo->lastInsertId(); // 挿入されたデータのIDを配列に追加
                }
            }
            // コミット
            $pdo->commit();
            echo json_encode(['success' => true, 'timeTakenIds' => $timeTakenIds]);
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
