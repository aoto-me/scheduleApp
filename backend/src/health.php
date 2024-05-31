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
        $upTime = sanitize($_POST['upTime']);
        $bedTime = sanitize($_POST['bedTime']);
        $body = sanitize($_POST['body']);
        $headache = ($_POST['headache'] === 'false') ? 0 : 1;
        $stomach = ($_POST['stomach'] === 'false') ? 0 : 1;
        $period = ($_POST['period'] === 'false') ? 0 : 1;
        $sleepless = ($_POST['sleepless'] === 'false') ? 0 : 1;
        $cold = ($_POST['cold'] === 'false') ? 0 : 1;
        $nausea = ($_POST['nausea'] === 'false') ? 0 : 1;
        $hayfever = ($_POST['hayfever'] === 'false') ? 0 : 1;
        $depression = ($_POST['depression'] === 'false') ? 0 : 1;
        $tired = ($_POST['tired'] === 'false') ? 0 : 1;
        $other = ($_POST['other'] === 'false') ? 0 : 1;
        $memo = sanitize($_POST['memo']);

        if ($userId === null || !$date || !isset($upTime) || !isset($bedTime) || !isset($body) || !isset($headache) || !isset($stomach) || !isset($period) || !isset($sleepless) || !isset($cold) || !isset($nausea) || !isset($hayfever) || !isset($depression) || !isset($tired) || !isset($other) || !isset($memo)){
            throw new Exception('Invalid input data');
        }

        // テーブル名を作成
        $tableName = "health_$userId";

        // テーブル名のホワイトリスト検証
        if (!preg_match('/^health_\d+$/', $tableName)) {
            throw new Exception('Invalid table name');
        }

        // MySQLデータベースに接続
        $pdo = new PDO($db_dsn, $db_user, $db_password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // トランザクション開始
        $pdo->beginTransaction();

        if ($_POST['action'] === 'save') {
            // データを挿入
            $stmt = $pdo->prepare("INSERT INTO $tableName (date, upTime, bedTime, body, headache, stomach, period, sleepless, cold, nausea, hayfever, depression, tired, other, memo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $date,
                $upTime,
                $bedTime,
                $body,
                $headache,
                $stomach,
                $period,
                $sleepless,
                $cold,
                $nausea,
                $hayfever,
                $depression,
                $tired,
                $other,
                $memo,
            ]);
            $healthId = $pdo->lastInsertId(); // 挿入されたデータのIDを取得
            // コミット
            $pdo->commit();
            echo json_encode(['success' => true, 'id' => $healthId]);

        } elseif ($_POST['action'] === 'update') {
            $id = validateAndSanitizeInt($_POST['id']);
            if ($id === null) {
                throw new Exception('Invalid input data');
            }
            // 既存データを更新
            $stmt = $pdo->prepare("UPDATE $tableName SET date=?, upTime=?, bedTime=?, body=?, headache=?, stomach=?, period=?, sleepless=?, cold=?, nausea=?, hayfever=?, depression=?, tired=?, other=?, memo=? WHERE id=?");
            $stmt->execute([
                $date,
                $upTime,
                $bedTime,
                $body,
                $headache,
                $stomach,
                $period,
                $sleepless,
                $cold,
                $nausea,
                $hayfever,
                $depression,
                $tired,
                $other,
                $memo,
                $id,
            ]);
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
