<?php
declare(strict_types=1);

// トリムを行わずサニタイズする関数
function sanitize(string $data): string {
    return htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
}

// トリムを行いサニタイズする関数
function sanitizeAndTrim(string $data): string {
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

// 整数のバリデーションとサニタイズ
function validateAndSanitizeInt($value): ?int {
    if (is_numeric($value)) {
        return (int)$value; // 整数に変換して返す
    } else {
        return null; // 数値でない場合はnullを返す
    }
}

// CSRFトークンの検証
function validateCsrfToken(string $token): void {
    if (!isset($_SESSION['csrfToken']) || $token !== $_SESSION['csrfToken']) {
        throw new Exception('CSRF token mismatch');
    }
    return;
}
?>
