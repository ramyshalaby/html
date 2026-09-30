<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

// Answers the AJAX call from contact.html with a plain HTTP status (no redirects).
function respond(int $code): void
{
    http_response_code($code);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405);
}

// Honeypot: real visitors never fill this hidden field; bots do.
if (!empty($_POST['website'] ?? '')) {
    respond(200);
}

$name    = trim(strip_tags($_POST['name'] ?? ''));
$phone   = trim(strip_tags($_POST['phone'] ?? ''));
$email   = trim($_POST['email'] ?? '');
$subject = trim(strip_tags($_POST['subject'] ?? ''));
$message = trim(strip_tags($_POST['message'] ?? ''));

if ($name === '' || $subject === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(400);
}

// Strip CR/LF so nothing can inject extra mail headers.
$name    = str_replace(["\r", "\n"], ' ', $name);
$subject = str_replace(["\r", "\n"], ' ', $subject);

// SMTP settings live OUTSIDE the web root and the git repo: /etc/captiva-mail.php
// must `return ['host'=>..., 'port'=>587, 'user'=>..., 'pass'=>..., 'secure'=>'tls'];`
$cfg = @include '/etc/captiva-mail.php';
if (!is_array($cfg)) {
    error_log('contact form: /etc/captiva-mail.php missing or invalid');
    respond(500);
}

$body = 'Name: ' . htmlspecialchars($name) . '<br>'
      . 'Phone: ' . htmlspecialchars($phone) . '<br>'
      . 'E-mail: ' . htmlspecialchars($email) . '<br>'
      . 'Subject: ' . htmlspecialchars($subject) . '<br>'
      . 'Message: ' . nl2br(htmlspecialchars($message));

function make_mailer(array $cfg): PHPMailer
{
    $m = new PHPMailer(true);
    $m->isSMTP();
    $m->Host       = $cfg['host'];
    $m->Port       = (int) $cfg['port'];
    $m->SMTPAuth   = true;
    $m->Username   = $cfg['user'];
    $m->Password   = $cfg['pass'];
    $m->SMTPSecure = $cfg['secure'] ?? 'tls';
    $m->CharSet    = 'UTF-8';
    $m->isHTML(true);
    return $m;
}

try {
    // Notification to us. Sent FROM our own address (SPF/DMARC) with the visitor as Reply-To.
    $mail = make_mailer($cfg);
    $mail->setFrom('contact@captiva-ai.com', 'Captiva AI Website');
    $mail->addAddress('contact@captiva-ai.com');
    $mail->addReplyTo($email, $name);
    $mail->Subject = $subject;
    $mail->Body    = $body;
    $mail->AltBody = strip_tags(str_replace('<br>', "\n", $body));
    $mail->send();
} catch (Exception $e) {
    error_log('contact form mailer error: ' . $e->getMessage());
    respond(500);
}

// Confirmation to the visitor is best-effort: failing here must not fail the whole request.
try {
    $mail2 = make_mailer($cfg);
    $mail2->setFrom('contact@captiva-ai.com', 'Captiva AI');
    $mail2->addAddress($email, $name);
    $mail2->Subject = 'Captiva AI - We received your message';
    $mail2->Body    = 'Thanks for your time, we received your message and will contact you ASAP!';
    $mail2->AltBody = 'Thanks for your time, we received your message and will contact you ASAP!';
    $mail2->send();
} catch (Exception $e) {
    error_log('contact form confirmation error: ' . $e->getMessage());
}

respond(200);
