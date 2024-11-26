<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Load Composer's autoloader
require 'vendor/autoload.php';

if (count($_POST) > 0) {
    $name = htmlentities($_POST['name'] ?? '');
    $email = htmlentities($_POST['email'] ?? '');
    $subject = htmlentities($_POST['subject'] ?? '');
    $message = htmlentities($_POST['message'] ?? '');

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        header('location:error.html');
        exit;
    }

    $msg = "
    Name: $name<br>
    E-mail: $email<br>
    Subject: $subject<br>
    Message: $message
    ";

    $mail = new PHPMailer(true);
    $mail2 = new PHPMailer(true);

    try {
        // Send Email to Admin
        $mail->setFrom($email, $name);
        $mail->addAddress('contact@captiva-ai.com');
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $msg;
        $mail->AltBody = strip_tags($msg);
        $mail->send();

        // Send Confirmation Email to Sender
        $mail2->setFrom('contact@captiva-ai.com', 'Captiva AI');
        $mail2->addAddress($email, $name);
        $mail2->isHTML(true);
        $mail2->Subject = 'Captiva AI - Odoo ERP, Web & Mobile Apps Development, and AI Solutions';
        $mail2->Body = 'Thanks for your time, We received your message and will contact you ASAP!';
        $mail2->AltBody = 'Thanks for your time, We received your message and will contact you ASAP!';
        $mail2->send();

        header('location:success.html');
    } catch (Exception $e) {
        error_log("Mailer Error: " . $mail->ErrorInfo);
        header('location:error.html');
    }
}
?>
