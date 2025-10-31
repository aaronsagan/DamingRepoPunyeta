<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Donation;
use App\Models\DonorMilestone;
use App\Models\Charity;
use App\Models\Campaign;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DonorProfileTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test fetching donor profile returns correct data structure
     */
    public function test_can_fetch_donor_profile(): void
    {
        $donor = User::factory()->create([
            'role' => 'donor',
            'name' => 'Test Donor',
            'bio' => 'Test bio content',
        ]);

        $response = $this->getJson("/api/donors/{$donor->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'bio',
                    'location',
                    'member_since',
                    'total_donated',
                    'campaigns_supported_count',
                    'recent_donations_count',
                    'liked_campaigns_count',
                    'achievements_preview',
                    'is_owner',
                ]
            ])
            ->assertJson([
                'data' => [
                    'name' => 'Test Donor',
                    'bio' => 'Test bio content',
                ]
            ]);
    }

    /**
     * Test donor activity endpoint returns paginated donations
     */
    public function test_can_fetch_donor_activity(): void
    {
        $donor = User::factory()->create(['role' => 'donor']);
        $charity = Charity::factory()->create();
        $campaign = Campaign::factory()->create(['charity_id' => $charity->id]);
        
        // Create some donations
        Donation::factory()->count(5)->create([
            'donor_id' => $donor->id,
            'charity_id' => $charity->id,
            'campaign_id' => $campaign->id,
        ]);

        $response = $this->getJson("/api/donors/{$donor->id}/activity");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'amount',
                        'status',
                        'created_at',
                        'campaign',
                    ]
                ],
                'meta'
            ]);
    }

    /**
     * Test milestones endpoint returns donor achievements
     */
    public function test_can_fetch_donor_milestones(): void
    {
        $donor = User::factory()->create(['role' => 'donor']);
        
        // Create a milestone
        DonorMilestone::create([
            'donor_id' => $donor->id,
            'key' => 'first_donation',
            'title' => 'First Donation',
            'description' => 'Made your first donation',
            'icon' => 'Heart',
            'meta' => json_encode(['threshold' => 1]),
        ]);

        $response = $this->getJson("/api/donors/{$donor->id}/milestones");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'key',
                        'title',
                        'description',
                        'icon',
                        'achieved',
                        'achieved_at',
                    ]
                ]
            ]);
    }

    /**
     * Test only owner can update profile
     */
    public function test_only_owner_can_update_profile(): void
    {
        $donor = User::factory()->create(['role' => 'donor']);
        $otherDonor = User::factory()->create(['role' => 'donor']);

        $response = $this->actingAs($otherDonor, 'sanctum')
            ->putJson("/api/donors/{$donor->id}/profile", [
                'bio' => 'Updated bio',
            ]);

        $response->assertStatus(403);
    }

    /**
     * Test owner can update their profile
     */
    public function test_owner_can_update_profile(): void
    {
        $donor = User::factory()->create(['role' => 'donor']);

        $response = $this->actingAs($donor, 'sanctum')
            ->putJson("/api/donors/{$donor->id}/profile", [
                'bio' => 'Updated bio content',
                'address' => 'New Location',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Profile updated successfully',
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $donor->id,
            'bio' => 'Updated bio content',
            'address' => 'New Location',
        ]);
    }

    /**
     * Test profile update requires authentication
     */
    public function test_profile_update_requires_authentication(): void
    {
        $donor = User::factory()->create(['role' => 'donor']);

        $response = $this->putJson("/api/donors/{$donor->id}/profile", [
            'bio' => 'Updated bio',
        ]);

        $response->assertStatus(401);
    }

    /**
     * Test non-existent donor returns 404
     */
    public function test_non_existent_donor_returns_404(): void
    {
        $response = $this->getJson('/api/donors/999999');

        $response->assertStatus(404);
    }
}
