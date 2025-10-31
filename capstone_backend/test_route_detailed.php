<?php

echo "Detailed Route Test\n";
echo "==================\n\n";

$url = 'http://127.0.0.1:8000/api/campaigns/filter-options';

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "URL: $url\n";
echo "HTTP Status: $httpCode\n";
echo "Response Length: " . strlen($response) . " bytes\n\n";
echo "Full Response:\n";
echo "================\n";
echo $response;
echo "\n================\n";
