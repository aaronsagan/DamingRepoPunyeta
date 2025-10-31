<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DonorMilestoneSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $milestoneDefinitions = [
            [
                'key' => 'first_donation',
                'title' => 'First Donation',
                'description' => 'Made your first donation to a campaign',
                'icon' => 'Heart',
                'meta' => json_encode(['threshold' => 1]),
            ],
            [
                'key' => 'total_1000',
                'title' => 'Generous Supporter',
                'description' => 'Donated a total of ₱1,000 or more',
                'icon' => 'Award',
                'meta' => json_encode(['threshold' => 1000]),
            ],
            [
                'key' => 'total_5000',
                'title' => 'Champion of Change',
                'description' => 'Donated a total of ₱5,000 or more',
                'icon' => 'Trophy',
                'meta' => json_encode(['threshold' => 5000]),
            ],
            [
                'key' => 'total_10000',
                'title' => 'Impact Maker',
                'description' => 'Donated a total of ₱10,000 or more',
                'icon' => 'Star',
                'meta' => json_encode(['threshold' => 10000]),
            ],
            [
                'key' => 'supported_5_campaigns',
                'title' => 'Community Supporter',
                'description' => 'Supported 5 different campaigns',
                'icon' => 'Users',
                'meta' => json_encode(['threshold' => 5]),
            ],
            [
                'key' => 'supported_10_campaigns',
                'title' => 'Dedicated Philanthropist',
                'description' => 'Supported 10 different campaigns',
                'icon' => 'Sparkles',
                'meta' => json_encode(['threshold' => 10]),
            ],
            [
                'key' => 'verified_donor',
                'title' => 'Verified Donor',
                'description' => 'Had at least one donation auto-verified via OCR',
                'icon' => 'CheckCircle',
                'meta' => json_encode(['threshold' => 1]),
            ],
        ];

        // Get all donors (users with role = donor or who have made donations)
        $donors = \App\Models\User::where('role', 'donor')
            ->orWhereHas('donations')
            ->get();

        foreach ($donors as $donor) {
            foreach ($milestoneDefinitions as $definition) {
                \App\Models\DonorMilestone::firstOrCreate(
                    [
                        'donor_id' => $donor->id,
                        'key' => $definition['key'],
                    ],
                    [
                        'title' => $definition['title'],
                        'description' => $definition['description'],
                        'icon' => $definition['icon'],
                        'meta' => $definition['meta'],
                        'achieved_at' => null, // Will be set by refresh-milestones command
                    ]
                );
            }
        }

        $this->command->info('Donor milestones seeded successfully!');
    }
}
