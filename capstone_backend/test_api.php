<?php

// Quick API test script
$base_url = 'http://127.0.0.1:8000/api';

echo "Testing API Endpoints:\n\n";

// Test 1: Ping
echo "1. Testing /api/ping...\n";
$response = file_get_contents("$base_url/ping");
echo "Response: $response\n\n";

// Test 2: Filter Options
echo "2. Testing /api/campaigns/filter-options...\n";
try {
    $response = @file_get_contents("$base_url/campaigns/filter-options");
    if ($response === false) {
        echo "ERROR: 404 or connection failed\n";
        $error = error_get_last();
        echo "Details: " . print_r($error, true) . "\n\n";
    } else {
        echo "Response: $response\n\n";
    }
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n\n";
}

// Test 3: Filter
echo "3. Testing /api/campaigns/filter?status=published&per_page=3...\n";
try {
    $response = @file_get_contents("$base_url/campaigns/filter?status=published&per_page=3");
    if ($response === false) {
        echo "ERROR: 404 or connection failed\n";
        $error = error_get_last();
        echo "Details: " . print_r($error, true) . "\n\n";
    } else {
        echo "Response: " . substr($response, 0, 500) . "...\n\n";
    }
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n\n";
}
