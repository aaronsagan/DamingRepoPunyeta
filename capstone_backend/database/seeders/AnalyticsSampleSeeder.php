<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\{User, Charity, Campaign, Donation};
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class AnalyticsSampleSeeder extends Seeder
{
    /**
     * Seed analytics sample data for testing
     */
    public function run(): void
    {
        $this->command->info('Seeding analytics sample data...');

        // Create sample donors
        $donors = [];
        for ($i = 1; $i <= 20; $i++) {
            $donors[] = User::firstOrCreate(
                ['email' => "donor{$i}@test.com"],
                [
                    'name' => "Sample Donor {$i}",
                    'email' => "donor{$i}@test.com",
                    'password' => Hash::make('password'),
                    'role' => 'donor',
                ]
            );
        }
        $this->command->info('Created 20 sample donors');

        // Create sample charities
        $charityAdmins = [];
        $charities = [];
        for ($i = 1; $i <= 5; $i++) {
            $admin = User::firstOrCreate(
                ['email' => "charity{$i}@test.com"],
                [
                    'name' => "Charity Admin {$i}",
                    'email' => "charity{$i}@test.com",
                    'password' => Hash::make('password'),
                    'role' => 'charity_admin',
                ]
            );
            $charityAdmins[] = $admin;

            $charity = Charity::firstOrCreate(
                ['name' => "Sample Charity {$i}"],
                [
                    'name' => "Sample Charity {$i}",
                    'owner_id' => $admin->id,
                    'verification_status' => 'approved',
                    'mission' => "This is a sample charity organization for testing analytics.",
                ]
            );
            $charities[] = $charity;
        }
        $this->command->info('Created 5 sample charities');

        // Skip beneficiaries (model not available)

        // Create sample campaigns with various types and locations
        $campaignTypes = ['education', 'medical', 'feeding_program', 'disaster_relief', 'environment'];
        $regions = ['NCR', 'Region III', 'Region IV-A', 'Region VII'];
        $provinces = [
            'NCR' => ['Metro Manila'],
            'Region III' => ['Bulacan', 'Pampanga'],
            'Region IV-A' => ['Cavite', 'Laguna', 'Rizal'],
            'Region VII' => ['Cebu', 'Bohol'],
        ];
        $cities = [
            'Metro Manila' => ['Manila', 'Quezon City', 'Makati', 'Pasig'],
            'Bulacan' => ['Malolos', 'Meycauayan'],
            'Pampanga' => ['Angeles City', 'San Fernando'],
            'Cavite' => ['Bacoor', 'Dasmariñas'],
            'Laguna' => ['Calamba', 'Santa Rosa'],
            'Rizal' => ['Antipolo', 'Cainta'],
            'Cebu' => ['Cebu City', 'Mandaue'],
            'Bohol' => ['Tagbilaran'],
        ];

        $campaigns = [];
        foreach ($charities as $charity) {
            for ($i = 0; $i < 8; $i++) {
                $region = $regions[array_rand($regions)];
                $province = $provinces[$region][array_rand($provinces[$region])];
                $city = $cities[$province][array_rand($cities[$province])];
                
                $campaign = Campaign::create([
                    'charity_id' => $charity->id,
                    'title' => "Sample Campaign " . ($i + 1) . " - " . ucwords($campaignTypes[$i % count($campaignTypes)]),
                    'campaign_type' => $campaignTypes[$i % count($campaignTypes)],
                    'description' => "This is a sample campaign for testing analytics features.",
                    'problem' => "Sample problem statement",
                    'solution' => "Sample solution",
                    'target_amount' => rand(10000, 100000),
                    'status' => ['published', 'published', 'published', 'archived'][rand(0, 3)],
                    'region' => $region,
                    'province' => $province,
                    'city' => $city,
                    'barangay' => 'Sample Barangay',
                    'created_at' => Carbon::now()->subDays(rand(0, 180)),
                ]);
                
                $campaigns[] = $campaign;
            }
        }
        $this->command->info('Created ' . count($campaigns) . ' sample campaigns');

        // Create sample donations with varying dates
        $donationCount = 0;
        foreach ($campaigns as $campaign) {
            $numDonations = rand(5, 30);
            for ($i = 0; $i < $numDonations; $i++) {
                $createdAt = Carbon::now()->subDays(rand(0, 90));
                
                Donation::create([
                    'campaign_id' => $campaign->id,
                    'donor_id' => $donors[array_rand($donors)]->id,
                    'charity_id' => $campaign->charity_id,
                    'amount' => rand(100, 5000),
                    'status' => ['completed', 'completed', 'completed', 'pending'][rand(0, 3)],
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);
                $donationCount++;
            }
        }
        $this->command->info("Created {$donationCount} sample donations");

        $this->command->info('Analytics sample data seeding completed!');
        $this->command->line('');
        $this->command->info('Test accounts created:');
        $this->command->line('- Donors: donor1@test.com to donor20@test.com (password: password)');
        $this->command->line('- Charities: charity1@test.com to charity5@test.com (password: password)');
    }
}
