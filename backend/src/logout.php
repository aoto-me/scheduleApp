<?php
declare(strict_types=1);

header('Access-Control-Allow-Credentials: true');

require_once('../vendor/autoload.php');
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // クライアントのCookieからトークンを削除
        setcookie('token', '', time() - 3600, '/', 'scheduler.1coffee9milk.com', true, true);

        // セッションデータを全て削除
        $_SESSION = [];

        // セッションのクッキーも削除
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }

        // セッションを破棄
        session_destroy();

        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        error_log($e->getMessage());  // エラーログに詳細を記録
        echo json_encode(['success' => false, 'error' => 'セッションの破棄に失敗しました']);
    }
}
?>
