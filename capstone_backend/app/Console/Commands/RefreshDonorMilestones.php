<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class RefreshDonorMilestones extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'donor:refresh-milestones {--donor= : Specific donor ID to refresh}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Evaluate and update donor milestone achievements based on current donation data';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $donorId = $this->option('donor');
        
        if ($donorId) {
            $donors = \App\Models\User::where('id', $donorId)->get();
            $this->info("Refreshing milestones for donor ID: {$donorId}");
        } else {
            $donors = \App\Models\User::where('role', 'donor')
                ->orWhereHas('donations')
                ->get();
            $this->info("Refreshing milestones for all donors...");
        }

        $progressBar = $this->output->createProgressBar($donors->count());
        $achievementsUnlocked = 0;

        foreach ($donors as $donor) {
            $unlocked = $this->evaluateMilestones($donor);
            $achievementsUnlocked += $unlocked;
            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine();
        $this->info("✓ Milestone refresh complete!");
        $this->info("Total achievements unlocked: {$achievementsUnlocked}");

        return 0;
    }

    /**
     * Evaluate milestones for a specific donor
     */
    private function evaluateMilestones(\App\Models\User $donor): int
    {
        $milestones = $donor->donorMilestones;
        $unlocked = 0;

        // Get donor stats
        $totalDonated = $donor->donations()
            ->whereIn('verification_status', ['auto_verified', 'manual_verified'])
            ->sum('amount');
        
        $donationsCount = $donor->donations()
            ->whereIn('verification_status', ['auto_verified', 'manual_verified'])
            ->count();
        
        $campaignsSupported = $donor->donations()
            ->whereIn('verification_status', ['auto_verified', 'manual_verified'])
            ->whereNotNull('campaign_id')
            ->distinct('campaign_id')
            ->count('campaign_id');
        
        $autoVerifiedCount = $donor->donations()
            ->where('verification_status', 'auto_verified')
            ->count();

        foreach ($milestones as $milestone) {
            if ($milestone->isAchieved()) {
                continue; // Already achieved
            }

            $shouldAchieve = false;
            $threshold = $milestone->meta['threshold'] ?? 0;

            switch ($milestone->key) {
                case 'first_donation':
                    $shouldAchieve = $donationsCount >= 1;
                    break;
                
                case 'total_1000':
                    $shouldAchieve = $totalDonated >= 1000;
                    break;
                
                case 'total_5000':
                    $shouldAchieve = $totalDonated >= 5000;
                    break;
                
                case 'total_10000':
                    $shouldAchieve = $totalDonated >= 10000;
                    break;
                
                case 'supported_5_campaigns':
                    $shouldAchieve = $campaignsSupported >= 5;
                    break;
                
                case 'supported_10_campaigns':
                    $shouldAchieve = $campaignsSupported >= 10;
                    break;
                
                case 'verified_donor':
                    $shouldAchieve = $autoVerifiedCount >= 1;
                    break;
            }

            if ($shouldAchieve) {
                $milestone->markAsAchieved();
                $unlocked++;
            } else {
                // Update progress in meta
                $meta = $milestone->meta;
                
                // Ensure meta is an array
                if (is_string($meta)) {
                    $meta = json_decode($meta, true) ?? [];
                } elseif (!is_array($meta)) {
                    $meta = [];
                }
                
                switch ($milestone->key) {
                    case 'first_donation':
                        $meta['progress'] = $donationsCount;
                        break;
                    case 'total_1000':
                    case 'total_5000':
                    case 'total_10000':
                        $meta['progress'] = $totalDonated;
                        break;
                    case 'supported_5_campaigns':
                    case 'supported_10_campaigns':
                        $meta['progress'] = $campaignsSupported;
                        break;
                    case 'verified_donor':
                        $meta['progress'] = $autoVerifiedCount;
                        break;
                }
                
                $milestone->meta = $meta;
                $milestone->save();
            }
        }

        return $unlocked;
    }
}
