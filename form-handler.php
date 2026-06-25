<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');

$config = require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed.',
    ]);
    exit;
}

$rawBody = file_get_contents('php://input');
$payload = json_decode($rawBody ?: '', true);

if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request payload.',
    ]);
    exit;
}

$formType = trim((string) ($payload['form_type'] ?? ''));

$formDefinitions = [
    'hero' => [
        'subject' => 'New Hero Form Enquiry',
        'required' => ['first_name', 'last_name', 'email', 'phone'],
        'labels' => [
            'first_name' => 'First Name',
            'last_name' => 'Last Name',
            'email' => 'Email',
            'phone' => 'Phone',
        ],
    ],
    'contact' => [
        'subject' => 'New Contact Form Enquiry',
        'required' => ['name', 'phone', 'email', 'project_type'],
        'labels' => [
            'name' => 'Name',
            'phone' => 'Phone',
            'email' => 'Email',
            'project_type' => 'Project Type',
            'company' => 'Company',
            'city' => 'City',
        ],
    ],
    'career' => [
        'subject' => 'New Career Application',
        'required' => ['name', 'phone', 'email', 'role', 'experience'],
        'labels' => [
            'name' => 'Full Name',
            'phone' => 'Phone',
            'email' => 'Email',
            'role' => 'Preferred Role',
            'experience' => 'Experience',
            'city' => 'Current City',
            'message' => 'Cover Note',
        ],
    ],
];

if (!isset($formDefinitions[$formType])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Unsupported form type.',
    ]);
    exit;
}

$definition = $formDefinitions[$formType];
$cleanData = [];

foreach ($definition['labels'] as $field => $label) {
    $value = trim((string) ($payload[$field] ?? ''));
    $cleanData[$field] = preg_replace("/[\r\n]+/", ' ', $value) ?? '';
}

foreach ($definition['required'] as $requiredField) {
    if ($cleanData[$requiredField] === '') {
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'message' => sprintf('%s is required.', $definition['labels'][$requiredField]),
        ]);
        exit;
    }
}

if (!filter_var($cleanData['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'Please enter a valid email address.',
    ]);
    exit;
}

$bodyLines = [
    'A new submission was received from the website.',
    '',
    'Form Type: ' . ucfirst($formType),
    '',
];

foreach ($definition['labels'] as $field => $label) {
    if ($cleanData[$field] === '') {
        continue;
    }

    $bodyLines[] = $label . ': ' . $cleanData[$field];
}

$emailBody = implode("\r\n", $bodyLines) . "\r\n";
$replyToName = $cleanData['name'] ?? trim(($cleanData['first_name'] ?? '') . ' ' . ($cleanData['last_name'] ?? ''));

try {
    sendSmtpMail(
        $config['smtp'],
        [
            'to_email' => (string) $config['site']['recipient_email'],
            'to_name' => (string) $config['site']['recipient_name'],
            'reply_to_email' => $cleanData['email'],
            'reply_to_name' => trim($replyToName) !== '' ? trim($replyToName) : $cleanData['email'],
            'subject' => $definition['subject'],
            'body' => $emailBody,
        ]
    );

    echo json_encode([
        'success' => true,
        'message' => 'Thanks. Your form has been submitted successfully.',
    ]);
} catch (RuntimeException $exception) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $exception->getMessage(),
    ]);
}

function sendSmtpMail(array $smtpConfig, array $message): void
{
    $host = (string) ($smtpConfig['host'] ?? '');
    $port = (int) ($smtpConfig['port'] ?? 0);
    $encryption = strtolower((string) ($smtpConfig['encryption'] ?? 'tls'));
    $username = (string) ($smtpConfig['username'] ?? '');
    $password = (string) ($smtpConfig['password'] ?? '');
    $fromEmail = (string) ($smtpConfig['from_email'] ?? '');
    $fromName = (string) ($smtpConfig['from_name'] ?? '');
    $timeout = (int) ($smtpConfig['timeout'] ?? 20);

    if ($host === '' || $port <= 0 || $username === '' || $password === '' || $fromEmail === '') {
        throw new RuntimeException('SMTP is not configured yet. Update config.php with valid mail credentials.');
    }

    $transportHost = $encryption === 'ssl' ? 'ssl://' . $host : $host;
    $socket = @stream_socket_client(
        $transportHost . ':' . $port,
        $errorNumber,
        $errorMessage,
        $timeout,
        STREAM_CLIENT_CONNECT
    );

    if (!$socket) {
        throw new RuntimeException('Unable to connect to the SMTP server.');
    }

    stream_set_timeout($socket, $timeout);

    try {
        smtpRead($socket, [220]);
        smtpCommand($socket, 'EHLO localhost', [250]);

        if ($encryption === 'tls') {
            smtpCommand($socket, 'STARTTLS', [220]);

            if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                throw new RuntimeException('Unable to start TLS encryption with the SMTP server.');
            }

            smtpCommand($socket, 'EHLO localhost', [250]);
        }

        smtpCommand($socket, 'AUTH LOGIN', [334]);
        smtpCommand($socket, base64_encode($username), [334]);
        smtpCommand($socket, base64_encode($password), [235]);
        smtpCommand($socket, 'MAIL FROM:<' . $fromEmail . '>', [250]);
        smtpCommand($socket, 'RCPT TO:<' . $message['to_email'] . '>', [250, 251]);
        smtpCommand($socket, 'DATA', [354]);

        $headers = [
            'Date: ' . date('r'),
            'From: ' . formatAddress($fromEmail, $fromName),
            'To: ' . formatAddress((string) $message['to_email'], (string) $message['to_name']),
            'Reply-To: ' . formatAddress((string) $message['reply_to_email'], (string) $message['reply_to_name']),
            'Subject: ' . encodeHeader((string) $message['subject']),
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            'Content-Transfer-Encoding: 8bit',
        ];

        $body = normalizeSmtpBody((string) $message['body']);
        $data = implode("\r\n", $headers) . "\r\n\r\n" . $body . "\r\n.";
        fwrite($socket, $data . "\r\n");
        smtpRead($socket, [250]);
        smtpCommand($socket, 'QUIT', [221]);
    } finally {
        fclose($socket);
    }
}

function smtpCommand($socket, string $command, array $expectedCodes): string
{
    fwrite($socket, $command . "\r\n");
    return smtpRead($socket, $expectedCodes);
}

function smtpRead($socket, array $expectedCodes): string
{
    $response = '';

    while (($line = fgets($socket, 515)) !== false) {
        $response .= $line;

        if (isset($line[3]) && $line[3] === ' ') {
            break;
        }
    }

    if ($response === '') {
        throw new RuntimeException('The SMTP server returned an empty response.');
    }

    $statusCode = (int) substr($response, 0, 3);

    if (!in_array($statusCode, $expectedCodes, true)) {
        throw new RuntimeException('SMTP error: ' . trim($response));
    }

    return $response;
}

function formatAddress(string $email, string $name = ''): string
{
    $safeEmail = str_replace(["\r", "\n"], '', $email);
    $safeName = trim(str_replace(["\r", "\n"], '', $name));

    if ($safeName === '') {
        return '<' . $safeEmail . '>';
    }

    return encodeHeader($safeName) . ' <' . $safeEmail . '>';
}

function encodeHeader(string $value): string
{
    return '=?UTF-8?B?' . base64_encode($value) . '?=';
}

function normalizeSmtpBody(string $body): string
{
    $normalized = str_replace(["\r\n", "\r"], "\n", $body);
    $normalized = preg_replace('/^\./m', '..', $normalized) ?? $normalized;
    return str_replace("\n", "\r\n", $normalized);
}
