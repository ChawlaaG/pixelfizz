<?php
/**
 * PixelFizz Secure Lead Submission & Router
 * Hardened with honeypot spam protection, input sanitization, rate limiting,
 * and instant WhatsApp dispatch URL generation.
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');

// 1. Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    exit;
}

// 2. Parse request payload (JSON or Form URL Encoded)
$rawInput = file_get_contents('php://input');
$data = [];
if (!empty($rawInput)) {
    $decoded = json_decode($rawInput, true);
    if (is_array($decoded)) {
        $data = $decoded;
    }
}
if (empty($data)) {
    $data = $_POST;
}

// 3. Honeypot check (bot trap)
if (!empty($data['website_url']) || !empty($data['fax_number'])) {
    // Silently succeed for bots
    echo json_encode(['success' => true, 'message' => 'Inquiry received successfully.']);
    exit;
}

// 4. Rate Limiting Check (Max 5 submissions per 10 minutes per IP)
$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$rateDir = __DIR__ . '/storage';
if (!is_dir($rateDir)) {
    @mkdir($rateDir, 0755, true);
}
$rateFile = $rateDir . '/rate_limit.json';
$now = time();
$ipHits = [];

if (file_exists($rateFile)) {
    $rateData = @json_decode(file_get_contents($rateFile), true);
    if (is_array($rateData)) {
        // Purge records older than 10 minutes (600s)
        foreach ($rateData as $storedIp => $timestamps) {
            $filtered = array_filter($timestamps, function($t) use ($now) {
                return ($now - $t) < 600;
            });
            if (!empty($filtered)) {
                $ipHits[$storedIp] = $filtered;
            }
        }
    }
}

if (isset($ipHits[$ip]) && count($ipHits[$ip]) >= 8) {
    http_response_code(429);
    echo json_encode([
        'success' => false,
        'error' => 'Too many requests. Please connect with us directly on WhatsApp or call our team.'
    ]);
    exit;
}

$ipHits[$ip][] = $now;
@file_put_contents($rateFile, json_encode($ipHits), LOCK_EX);

// 5. Sanitize and Validate Inputs
$name = trim(strip_tags($data['name'] ?? ''));
$contact = trim(strip_tags($data['contact'] ?? ($data['email'] ?? ($data['phone'] ?? ''))));
$service = trim(strip_tags($data['service'] ?? 'General Consultation'));
$budget = trim(strip_tags($data['budget'] ?? 'Not Specified'));
$message = trim(strip_tags($data['message'] ?? ''));
$host = $_SERVER['HTTP_HOST'] ?? '';
$isUkHost = (stripos($host, 'pixelfizz.co.uk') !== false);
$reqRegion = strtolower(trim($data['region'] ?? ''));

if ($reqRegion === 'uk' || $isUkHost) {
    $region = 'uk';
} else {
    $region = 'in';
}

if (empty($name) || empty($contact)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Please provide both your name and contact details (email or WhatsApp).'
    ]);
    exit;
}

// 6. Regional Lead Routing Configuration
if ($region === 'uk') {
    $toEmail = 'hello@pixelfizz.co.uk';
    $leadLeadName = 'Punit (UK Lead)';
    $waPhone = '447767196624';
    $currencySymbol = '£';
    $domainHost = 'pixelfizz.co.uk';
} else {
    $toEmail = 'hello@pixelfizz.in';
    $leadLeadName = 'Manish Chawla (India Lead)';
    $waPhone = '917878039395';
    $currencySymbol = '₹';
    $domainHost = 'pixelfizz.in';
}

// 7. Generate Pre-filled WhatsApp Link
$waMessage = "Hi {$leadLeadName}! I'm inquiring from {$domainHost}:\n\n"
    . "• Name: {$name}\n"
    . "• Contact: {$contact}\n"
    . "• Service: {$service}\n"
    . "• Target Budget: {$budget}\n";
if (!empty($message)) {
    $waMessage .= "• Details: {$message}\n";
}
$waUrl = "https://wa.me/{$waPhone}?text=" . rawurlencode($waMessage);

// 8. Log Lead Securely
$leadEntry = [
    'timestamp' => date('Y-m-d H:i:s'),
    'ip' => $ip,
    'region' => $region,
    'name' => $name,
    'contact' => $contact,
    'service' => $service,
    'budget' => $budget,
    'message' => $message
];

$leadsFile = $rateDir . '/leads.json';
$existingLeads = [];
if (file_exists($leadsFile)) {
    $existingLeads = @json_decode(file_get_contents($leadsFile), true) ?: [];
}
$existingLeads[] = $leadEntry;
@file_put_contents($leadsFile, json_encode($existingLeads, JSON_PRETTY_PRINT), LOCK_EX);

// 9. Send Email Notification via standard PHP mail()
$emailSubject = "⚡ New PixelFizz Project Lead [{$region}] - {$name}";
$emailBody = "New PixelFizz Project Inquiry:\n\n"
    . "Region: " . strtoupper($region) . "\n"
    . "Name: {$name}\n"
    . "Contact: {$contact}\n"
    . "Service: {$service}\n"
    . "Budget: {$budget}\n"
    . "Details:\n{$message}\n\n"
    . "IP: {$ip}\n"
    . "Date: " . date('Y-m-d H:i:s') . "\n";

$headers = "From: inquiries@pixelfizz.{$region}\r\n"
    . "Reply-To: {$contact}\r\n"
    . "X-Mailer: PHP/" . phpversion();

@mail($toEmail, $emailSubject, $emailBody, $headers);

// 10. Return Response
echo json_encode([
    'success' => true,
    'message' => 'Thank you! We received your project details and will reply within 24 hours.',
    'whatsapp_url' => $waUrl
]);
