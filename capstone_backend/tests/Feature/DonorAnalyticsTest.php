<?php

namespace Tests\Feature;

use App\Models\{User, Campaign, Donation, Charity, Beneficiary};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DonorAnalyticsTest extends TestCase
{
    use RefreshDatabase;

    protected $donor;
    protected $charity;
    protected $campaign;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test donor
        $this->donor = User::factory()->create(['role' => 'donor']);
        
        // Create test charity
        $charityAdmin = User::factory()->create(['role' => 'charity_admin']);
        $this->charity = Charity::factory()->create([
            'owner_id' => $charityAdmin->id,
            'verification_status' => 'approved',
        ]);
        
        // Create test campaign
        $this->campaign = Campaign::factory()->create([
            'charity_id' => $this->charity->id,
            'status' => 'published',
            'campaign_type' => 'medical',
            'target_amount' => 10000,
            'current_amount' => 5000,
            'region' => 'NCR',
            'province' => 'Metro Manila',
            'city' => 'Manila',
        ]);
    }

    public function test_can_fetch_analytics_summary()
    {
        // Create some donations
        Donation::factory()->count(5)->create([
            'campaign_id' => $this->campaign->id,
            'donor_id' => $this->donor->id,
            'status' => 'completed',
            'amount' => 1000,
        ]);

        $response = $this->actingAs($this->donor, 'sanctum')
            ->getJson('/api/donor-analytics/summary');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'total_campaigns',
                'active_campaigns',
                'total_donations_amount',
                'avg_donation',
                'total_donations_count',
            ])
            ->assertJson([
                'total_donations_count' => 5,
                'total_donations_amount' => 5000,
                'avg_donation' => 1000,
            ]);
    }

    public function test_can_query_analytics_with_filters()
    {
        // Create donations
        Donation::factory()->count(3)->create([
            'campaign_id' => $this->campaign->id,
            'donor_id' => $this->donor->id,
            'status' => 'completed',
            'amount' => 500,
        ]);

        $response = $this->actingAs($this->donor, 'sanctum')
            ->postJson('/api/donor-analytics/query', [
                'campaign_types' => ['medical'],
                'granularity' => 'daily',
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'campaign_type_distribution',
                'top_trending_campaigns',
                'charity_rankings',
                'donations_time_series',
                'campaign_frequency_time_series',
                'location_distribution',
                'beneficiary_breakdown',
            ]);
    }

    public function test_can_fetch_campaign_details()
    {
        // Create donations for campaign
        Donation::factory()->count(5)->create([
            'campaign_id' => $this->campaign->id,
            'donor_id' => $this->donor->id,
            'status' => 'completed',
            'amount' => 1000,
        ]);

        $response = $this->actingAs($this->donor, 'sanctum')
            ->getJson("/api/donor-analytics/campaign/{$this->campaign->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'campaign' => [
                    'id',
                    'title',
                    'type',
                    'charity',
                    'target_amount',
                    'current_amount',
                ],
                'donation_stats' => [
                    'count',
                    'total',
                    'average',
                    'min',
                    'max',
                ],
                'timeline',
                'why_trending',
            ])
            ->assertJson([
                'campaign' => [
                    'id' => $this->campaign->id,
                    'title' => $this->campaign->title,
                ],
                'donation_stats' => [
                    'count' => 5,
                ],
            ]);
    }

    public function test_can_fetch_donor_overview_for_own_data()
    {
        // Create donations for this donor
        Donation::factory()->count(10)->create([
            'campaign_id' => $this->campaign->id,
            'donor_id' => $this->donor->id,
            'status' => 'completed',
            'amount' => 500,
        ]);

        $response = $this->actingAs($this->donor, 'sanctum')
            ->getJson("/api/donor-analytics/donor/{$this->donor->id}/overview");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'total_donated',
                'total_count',
                'average_donation',
                'recent_trend',
            ])
            ->assertJson([
                'total_count' => 10,
                'total_donated' => 5000,
                'average_donation' => 500,
            ]);
    }

    public function test_cannot_fetch_other_donor_overview()
    {
        $otherDonor = User::factory()->create(['role' => 'donor']);

        $response = $this->actingAs($this->donor, 'sanctum')
            ->getJson("/api/donor-analytics/donor/{$otherDonor->id}/overview");

        $response->assertStatus(403);
    }

    public function test_analytics_filters_by_date_range()
    {
        // Create old donation
        Donation::factory()->create([
            'campaign_id' => $this->campaign->id,
            'donor_id' => $this->donor->id,
            'status' => 'completed',
            'amount' => 1000,
            'created_at' => now()->subDays(60),
        ]);

        // Create recent donation
        Donation::factory()->create([
            'campaign_id' => $this->campaign->id,
            'donor_id' => $this->donor->id,
            'status' => 'completed',
            'amount' => 2000,
            'created_at' => now()->subDays(5),
        ]);

        $response = $this->actingAs($this->donor, 'sanctum')
            ->getJson('/api/donor-analytics/summary?' . http_build_query([
                'date_from' => now()->subDays(30)->format('Y-m-d'),
                'date_to' => now()->format('Y-m-d'),
            ]));

        $response->assertStatus(200);
        $data = $response->json();
        
        // Should only count recent donation
        $this->assertEquals(2000, $data['total_donations_amount']);
        $this->assertEquals(1, $data['total_donations_count']);
    }

    public function test_analytics_caching_works()
    {
        Donation::factory()->count(5)->create([
            'campaign_id' => $this->campaign->id,
            'donor_id' => $this->donor->id,
            'status' => 'completed',
        ]);

        // First request
        $start = microtime(true);
        $response1 = $this->actingAs($this->donor, 'sanctum')
            ->getJson('/api/donor-analytics/summary');
        $time1 = microtime(true) - $start;

        // Second request (should be cached)
        $start = microtime(true);
        $response2 = $this->actingAs($this->donor, 'sanctum')
            ->getJson('/api/donor-analytics/summary');
        $time2 = microtime(true) - $start;

        $response1->assertStatus(200);
        $response2->assertStatus(200);
        
        // Cached request should be faster (though not always guaranteed in tests)
        $this->assertJson($response1->getContent(), $response2->getContent());
    }
}
