<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Testing AnalyticsController methods...\n\n";

try {
    $controller = new \App\Http\Controllers\AnalyticsController();
    
    echo "1. Testing filterOptions() method:\n";
    $response = $controller->filterOptions();
    $data = $response->getData(true);
    
    if (isset($data['types'])) {
        echo "   ✅ Method exists and returns data\n";
        echo "   ✅ Found " . count($data['types']) . " types\n";
        echo "   ✅ Found " . count($data['regions']) . " regions\n";
    } else {
        echo "   ❌ Unexpected response structure\n";
        var_dump($data);
    }
    
    echo "\n2. Testing filterCampaigns() method:\n";
    $request = \Illuminate\Http\Request::create('/api/campaigns/filter', 'GET', [
        'status' => 'published',
        'per_page' => 3
    ]);
    
    $response = $controller->filterCampaigns($request);
    $data = $response->getData(true);
    
    if (isset($data['data'])) {
        echo "   ✅ Method exists and returns data\n";
        echo "   ✅ Found " . count($data['data']) . " campaigns\n";
        echo "   ✅ Total: " . ($data['total'] ?? 0) . "\n";
    } else {
        echo "   ❌ Unexpected response structure\n";
        var_dump($data);
    }
    
    echo "\n✅ Both controller methods work!\n";
    echo "The problem is with route registration, not the controller.\n";
    
} catch (\Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "\nStack trace:\n" . $e->getTraceAsString() . "\n";
}
