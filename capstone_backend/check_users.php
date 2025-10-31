<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Checking for seeded users...\n\n";

$donor1 = \App\Models\User::where('email', 'donor1@test.com')->first();
$donor20 = \App\Models\User::where('email', 'donor20@test.com')->first();
$charity1 = \App\Models\User::where('email', 'charity1@test.com')->first();

if ($donor1) {
    echo "✅ donor1@test.com EXISTS\n";
    echo "   ID: {$donor1->id}\n";
    echo "   Name: {$donor1->name}\n";
    echo "   Role: {$donor1->role}\n\n";
} else {
    echo "❌ donor1@test.com NOT FOUND\n\n";
}

if ($donor20) {
    echo "✅ donor20@test.com EXISTS\n\n";
} else {
    echo "❌ donor20@test.com NOT FOUND\n\n";
}

if ($charity1) {
    echo "✅ charity1@test.com EXISTS\n\n";
} else {
    echo "❌ charity1@test.com NOT FOUND\n\n";
}

$totalDonors = \App\Models\User::where('email', 'like', 'donor%@test.com')->count();
echo "Total donor accounts with 'donor%@test.com' pattern: {$totalDonors}\n\n";

$totalCampaigns = \App\Models\Campaign::count();
$totalDonations = \App\Models\Donation::count();

echo "Total campaigns: {$totalCampaigns}\n";
echo "Total donations: {$totalDonations}\n";
