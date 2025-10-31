<?php

echo "\n========================================\n";
echo "TESTING CAMPAIGN FILTER ENDPOINTS\n";
echo "========================================\n\n";

$base = 'http://127.0.0.1:8000/api';

// Test 1: Filter Options
echo "1. Testing /api/campaigns/filter-options\n";
echo "   URL: $base/campaigns/filter-options\n";

$ch = curl_init("$base/campaigns/filter-options");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode == 200) {
    echo "   ✅ SUCCESS - Status: $httpCode\n";
    
    // Extract JSON from response
    $parts = explode("\r\n\r\n", $response, 2);
    $json = json_decode($parts[1], true);
    
    if ($json && isset($json['types'])) {
        echo "   ✅ Valid JSON returned\n";
        echo "   ✅ Found " . count($json['types']) . " campaign types\n";
        echo "   ✅ Found " . count($json['regions']) . " regions\n";
    } else {
        echo "   ❌ Invalid JSON structure\n";
    }
} else {
    echo "   ❌ FAILED - Status: $httpCode\n";
    echo "   Response preview: " . substr($response, 0, 200) . "...\n";
}

echo "\n";

// Test 2: Filter Campaigns
echo "2. Testing /api/campaigns/filter\n";
echo "   URL: $base/campaigns/filter?status=published&per_page=3\n";

$ch = curl_init("$base/campaigns/filter?status=published&per_page=3");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode == 200) {
    echo "   ✅ SUCCESS - Status: $httpCode\n";
    
    // Extract JSON from response
    $parts = explode("\r\n\r\n", $response, 2);
    $json = json_decode($parts[1], true);
    
    if ($json && isset($json['data'])) {
        echo "   ✅ Valid JSON returned\n";
        echo "   ✅ Found " . count($json['data']) . " campaigns\n";
        echo "   ✅ Total campaigns: " . ($json['total'] ?? 0) . "\n";
        
        if (count($json['data']) > 0) {
            $first = $json['data'][0];
            echo "   ✅ First campaign: " . ($first['title'] ?? 'N/A') . "\n";
        }
    } else {
        echo "   ❌ Invalid JSON structure\n";
    }
} else {
    echo "   ❌ FAILED - Status: $httpCode\n";
    echo "   Response preview: " . substr($response, 0, 200) . "...\n";
}

echo "\n========================================\n";

if ($httpCode == 200) {
    echo "✅ ALL TESTS PASSED!\n";
    echo "The campaigns page should now work!\n";
} else {
    echo "❌ TESTS FAILED\n";
    echo "Backend server may not be restarted yet.\n";
    echo "Press Ctrl+C in backend terminal, then run: php artisan serve\n";
}

echo "========================================\n\n";
