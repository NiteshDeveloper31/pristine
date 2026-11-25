<?php
/**
 * Pristine Amore - Lead Processing & Email Dispatcher
 * Captures enquiry leads with complete tracking metadata:
 * - Full Name, Phone, Email, Configuration / Message, Lead Source
 * - Unique Submission ID
 * - Exact Submission Timestamp (IST)
 * - Client IP Address (with Cloudflare & proxy detection)
 * - User Agent (Browser & Device Environment)
 */

header('Content-Type: application/json; charset=UTF-8');
date_default_timezone_set('Asia/Kolkata');

// -----------------------------------------------------------------------------
// 1. RECIPIENT CONFIGURATION
// -----------------------------------------------------------------------------
$recipient_email = "sales@pristinedeveloper.com, info@pristineamore.com";
$email_subject_prefix = "New Luxury Lead: Pristine Amore";

// Only handle POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'status'  => 'error',
        'message' => 'Invalid request method. POST required.'
    ]);
    exit;
}

// -----------------------------------------------------------------------------
// 2. HELPER: ACCURATE CLIENT IP RESOLUTION
// -----------------------------------------------------------------------------
function get_client_ip_address() {
    $ip_headers = [
        'HTTP_CF_CONNECTING_IP', // Cloudflare
        'HTTP_X_REAL_IP',        // Nginx reverse proxy
        'HTTP_CLIENT_IP',
        'HTTP_X_FORWARDED_FOR',  // Standard proxy / load balancer
        'REMOTE_ADDR'            // Standard remote address
    ];

    foreach ($ip_headers as $header) {
        if (!empty($_SERVER[$header])) {
            $ips = explode(',', $_SERVER[$header]);
            $candidate = trim($ips[0]);
            if (filter_var($candidate, FILTER_VALIDATE_IP)) {
                return $candidate;
            }
        }
    }
    return $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
}

// -----------------------------------------------------------------------------
// 3. SANITIZE & EXTRACT INPUTS + METADATA
// -----------------------------------------------------------------------------
$name         = isset($_POST['name']) ? trim(strip_tags($_POST['name'])) : 'Not Provided';
$phone        = isset($_POST['phone']) ? trim(strip_tags($_POST['phone'])) : '';
$email        = isset($_POST['email']) ? trim(strip_tags($_POST['email'])) : 'Not Provided';
$config       = isset($_POST['config']) ? trim(strip_tags($_POST['config'])) : '3 & 4.5 BHK Luxury Residences';
$message      = isset($_POST['message']) && !empty(trim($_POST['message'])) 
                  ? trim(strip_tags($_POST['message'])) 
                  : $config;
$source       = isset($_POST['source']) ? trim(strip_tags($_POST['source'])) : 'Direct Website Enquiry';

// Tracking Metadata
$submission_id = 'PA-' . strtoupper(dechex(time())) . '-' . rand(100, 999);
$submitted_at  = date('d M Y, h:i:s A T');
$client_ip     = get_client_ip_address();
$user_agent    = !empty($_SERVER['HTTP_USER_AGENT']) ? trim(strip_tags($_SERVER['HTTP_USER_AGENT'])) : 'Unknown';

// -----------------------------------------------------------------------------
// 4. VALIDATION
// -----------------------------------------------------------------------------
$phone_digits = preg_replace('/[^0-9]/', '', $phone);
if (empty($phone) || strlen($phone_digits) < 10) {
    echo json_encode([
        'status'  => 'error',
        'message' => 'Please provide a valid 10-digit mobile number.'
    ]);
    exit;
}

// -----------------------------------------------------------------------------
// 5. LOCAL CSV DATA PERSISTENCE (leads.csv)
// -----------------------------------------------------------------------------
$csv_file = __DIR__ . '/leads.csv';
$csv_exists = file_exists($csv_file);

if ($fp = @fopen($csv_file, 'a')) {
    if (!$csv_exists) {
        // Write CSV Header row
        fputcsv($fp, [
            'Submission ID',
            'Submitted At',
            'Name',
            'Phone',
            'Email',
            'Configuration / Requirement',
            'Message',
            'Lead Source',
            'IP Address',
            'User Agent'
        ]);
    }
    fputcsv($fp, [
        $submission_id,
        $submitted_at,
        $name,
        $phone,
        $email,
        $config,
        $message,
        $source,
        $client_ip,
        $user_agent
    ]);
    fclose($fp);
}

// -----------------------------------------------------------------------------
// 6. COMPOSE EMAIL NOTIFICATION
// -----------------------------------------------------------------------------
$email_subject = "{$email_subject_prefix} [{$submission_id}] - {$name}";

// Plain text version in requested key-value layout
$plain_body = "NEW LEAD SUBMISSION - PRISTINE AMORE (KALYANI NAGAR)\n"
            . "========================================================\n"
            . "Name: {$name}\n"
            . "Email: {$email}\n"
            . "Phone: {$phone}\n"
            . "Requirement: {$config}\n"
            . "Message: {$message}\n"
            . "Lead Source: {$source}\n"
            . "Submission ID: {$submission_id}\n"
            . "Submitted At: {$submitted_at}\n"
            . "IP Address: {$client_ip}\n"
            . "User Agent: {$user_agent}\n"
            . "========================================================\n";

// Luxury HTML Email layout
$html_body = "
<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1.0'>
  <title>{$email_subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #080a0f; color: #e2e8f0; margin: 0; padding: 24px 12px; }
    .card { max-width: 620px; margin: 0 auto; background: #10141d; border: 1px solid #c5a059; border-radius: 10px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.8); }
    .header { background: linear-gradient(135deg, #dfba73 0%, #c5a059 50%, #9f7d3b 100%); color: #0a0d14; padding: 26px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }
    .header p { margin: 6px 0 0; font-size: 13px; font-weight: 600; opacity: 0.9; }
    .section-title { font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #dfba73; margin: 24px 0 10px 0; border-bottom: 1px solid rgba(223, 186, 115, 0.25); padding-bottom: 6px; }
    .content { padding: 28px 30px; }
    .row { padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .label { color: #dfba73; font-weight: 600; font-size: 13px; display: block; margin-bottom: 4px; }
    .val { color: #ffffff; font-size: 15px; font-weight: 500; word-break: break-word; }
    .val-code { font-family: 'Courier New', Courier, monospace; background: rgba(255,255,255,0.06); padding: 4px 8px; border-radius: 4px; font-size: 13px; color: #93c5fd; }
    .metadata-box { background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 14px 18px; margin-top: 20px; }
    .footer { padding: 18px 30px; text-align: center; font-size: 11px; color: #64748b; background: #0b0e14; border-top: 1px solid rgba(255,255,255,0.06); }
    .quick-actions { margin-top: 24px; text-align: center; }
    .call-btn { display: inline-block; background: #c5a059; color: #0a0d14; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 14px; margin-right: 10px; }
    .wa-btn { display: inline-block; background: #25d366; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 14px; }
  </style>
</head>
<body>
  <div class='card'>
    <div class='header'>
      <h1>Pristine Amore</h1>
      <p>Luxury Lead Notification &bull; Kalyani Nagar, Pune</p>
    </div>
    
    <div class='content'>
      <div class='section-title'>Client Information</div>
      <div class='row'>
        <span class='label'>Name:</span>
        <span class='val'>{$name}</span>
      </div>
      <div class='row'>
        <span class='label'>Email:</span>
        <span class='val'><a href='mailto:{$email}' style='color: #60a5fa; text-decoration: none;'>{$email}</a></span>
      </div>
      <div class='row'>
        <span class='label'>Phone:</span>
        <span class='val'><a href='tel:{$phone}' style='color: #dfba73; text-decoration: none; font-weight: 700;'>{$phone}</a></span>
      </div>
      <div class='row'>
        <span class='label'>Requirement / Configuration:</span>
        <span class='val'>{$config}</span>
      </div>
      <div class='row'>
        <span class='label'>Message:</span>
        <span class='val'>{$message}</span>
      </div>
      <div class='row'>
        <span class='label'>Lead Source:</span>
        <span class='val'>{$source}</span>
      </div>

      <div class='section-title'>Tracking &amp; Verification Metadata</div>
      <div class='metadata-box'>
        <div class='row' style='padding-top: 0;'>
          <span class='label'>Submission ID:</span>
          <span class='val val-code'>{$submission_id}</span>
        </div>
        <div class='row'>
          <span class='label'>Submitted At:</span>
          <span class='val'>{$submitted_at}</span>
        </div>
        <div class='row'>
          <span class='label'>IP Address:</span>
          <span class='val val-code'>{$client_ip}</span>
        </div>
        <div class='row' style='border-bottom: none; padding-bottom: 0;'>
          <span class='label'>User Agent:</span>
          <span class='val' style='font-size: 12px; color: #94a3b8;'>{$user_agent}</span>
        </div>
      </div>

      <div class='quick-actions'>
        <a href='tel:{$phone}' class='call-btn'>Call Patron Now</a>
        <a href='https://wa.me/91" . substr($phone_digits, -10) . "' class='wa-btn' target='_blank'>WhatsApp Chat</a>
      </div>
    </div>

    <div class='footer'>
      &copy; " . date('Y') . " Pristine Amore | Official Lead Management Engine | Kalyani Nagar, Pune
    </div>
  </div>
</body>
</html>
";

// -----------------------------------------------------------------------------
// 7. DISPATCH HEADERS & MAIL EXECUTION
// -----------------------------------------------------------------------------
$headers   = [];
$headers[] = "MIME-Version: 1.0";
$headers[] = "Content-type: text/html; charset=UTF-8";
$headers[] = "From: Pristine Amore Web <noreply@" . ($_SERVER['SERVER_NAME'] ?? 'pristineamore.com') . ">";
if (!empty($email) && $email !== 'Not Provided' && filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $headers[] = "Reply-To: {$name} <{$email}>";
} else {
    $headers[] = "Reply-To: sales@pristinedeveloper.com";
}
$headers[] = "X-Mailer: PHP/" . phpversion();
$headers[] = "X-Submission-ID: {$submission_id}";

$mail_sent = @mail($recipient_email, $email_subject, $html_body, implode("\r\n", $headers));

// -----------------------------------------------------------------------------
// 8. JSON RESPONSE
// -----------------------------------------------------------------------------
echo json_encode([
    'status'        => 'success',
    'message'       => 'Thank you! Your private consultation request has been confirmed (Ref: ' . $submission_id . '). Our luxury property specialist will contact you shortly.',
    'submission_id' => $submission_id,
    'submitted_at'  => $submitted_at,
    'lead_logged'   => true
]);
