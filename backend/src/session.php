<?php
// セッションの有効期限を12時間に設定（43200秒）
ini_set('session.gc_maxlifetime', 43200);

session_start();

// ユーザーがログインしたときに、セッションのタイムスタンプを設定
if (!isset($_SESSION['LAST_ACTIVITY'])) {
    $_SESSION['LAST_ACTIVITY'] = time();
}

// セッションの有効期限をチェック
if (isset($_SESSION['LAST_ACTIVITY']) && (time() - $_SESSION['LAST_ACTIVITY'] > 43200)) {
    // 最後の活動時間が設定されていて、有効期限が切れている場合
    session_unset();     // セッション変数をクリア
    session_destroy();   // セッションを破棄
    session_start();     // 新しいセッションを開始
}

// 最後の活動時間を更新
$_SESSION['LAST_ACTIVITY'] = time();
?>
