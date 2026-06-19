<?php
require_once('config.php');
// //Server settings
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

require './PHPMailer/src/Exception.php';
require './PHPMailer/src/PHPMailer.php';
require './PHPMailer/src/SMTP.php';

//Create an instance; passing `true` enables exceptions

// Create a new PHPMailer instance with exceptions enabled
$mail = new PHPMailer(true);

// Enable (0 = off) SMTP debug output for troubleshooting (can be 0, 1, 2, or 3)
$mail->SMTPDebug = 0; // Set to 2 or 3 for detailed output during development

// Tell PHPMailer to use SMTP for sending
$mail->isSMTP();

// Enable HTML content in the email body
$mail->isHTML(true);

// Set the sender's email and display name (must be in correct order)
$mail->setFrom(EMAIL_FROM, NAME_FROM);

// Enable SMTP authentication (required for most SMTP servers like Gmail)
$mail->SMTPAuth = true;

// Set the hostname of the mail server (e.g., smtp.gmail.com)
$mail->Host = SMTP_HOST_NAME;

// Set the SMTP username (usually the same as the sender's email)
$mail->Username = EMAIL_FROM;

// Set the SMTP password (use app password if 2FA is enabled)
$mail->Password = SMTP_PASSWORD;

// Set the encryption type for the SMTP connection ('tls' or 'ssl')
$mail->SMTPSecure = ENCRYPTION_TYPE; // Example: 'tls' for port 587, 'ssl' for port 465

// Set the TCP port to connect to the mail server
$mail->Port = SMTP_PORT;

// (Optional, redundant line) Reaffirm SMTP authentication is enabled
$mail->SMTPAuth = true;
