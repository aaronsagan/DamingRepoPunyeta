<?php

echo "DIRECT ENDPOINT TEST\n";
echo "====================\n\n";

function testEndpoint($url) {
    echo "Testing: $url\n";
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, false);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "Status: $httpCode\n";
    
    if ($httpCode == 200) {
        echo "✅ SUCCESS\n";
        echo "Response: " . substr($response, 0, 200) . "...\n";
        return true;
    } else {
        echo "❌ FAILED\n";
        // Try to extract error message from HTML
        if (preg_match('/<title>(.*?)<\/title>/', $response, $matches)) {
            echo "Error: " . $matches[1] . "\n";
        }
        return false;
    }
    echo "\n";
}

// Test 1: Ping (should work)
testEndpoint('http://127.0.0.1:8000/api/ping');
echo "\n";

// Test 2: Test route (should work)
testEndpoint('http://127.0.0.1:8000/api/test-campaigns-route');
echo "\n";

// Test 3: Filter options (the problematic one)
testEndpoint('http://127.0.0.1:8000/api/campaigns/filter-options');
echo "\n";

// Test 4: Filter (the problematic one)
testEndpoint('http://127.0.0.1:8000/api/campaigns/filter?status=published&per_page=3');
echo "\n";
