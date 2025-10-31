<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DonorProfileResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $isOwner = $request->user() && $request->user()->id === $this->id;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $isOwner ? $this->email : null, // Only show to owner
            'avatar_url' => $this->profile_image ? url('storage/' . $this->profile_image) : null,
            'cover_url' => $this->cover_image ? url('storage/' . $this->cover_image) : null,
            'bio' => $this->bio ?? 'Making a difference through charitable giving and community support.',
            'location' => $this->address ?? null,
            'member_since' => $this->created_at?->format('Y-m-d'),
            'total_donated' => $this->getTotalDonated(),
            'campaigns_supported_count' => $this->getCampaignsSupportedCount(),
            'recent_donations_count' => $this->getRecentDonationsCount(),
            'liked_campaigns_count' => $this->getLikedCampaignsCount(),
            'achievements_preview' => $this->getAchievementsPreview(),
            'is_owner' => $isOwner,
        ];
    }

    /**
     * Get total amount donated (verified donations only)
     */
    private function getTotalDonated(): float
    {
        return (float) $this->donations()
            ->whereIn('verification_status', ['auto_verified', 'manual_verified'])
            ->sum('amount');
    }

    /**
     * Get count of unique campaigns supported
     */
    private function getCampaignsSupportedCount(): int
    {
        return $this->donations()
            ->whereIn('verification_status', ['auto_verified', 'manual_verified'])
            ->whereNotNull('campaign_id')
            ->distinct('campaign_id')
            ->count('campaign_id');
    }

    /**
     * Get count of recent donations (last 30 days)
     */
    private function getRecentDonationsCount(): int
    {
        return $this->donations()
            ->where('created_at', '>=', now()->subDays(30))
            ->count();
    }

    /**
     * Get count of liked campaigns (placeholder - implement when likes feature exists)
     */
    private function getLikedCampaignsCount(): int
    {
        // TODO: Implement when campaign likes/favorites feature is added
        return 0;
    }

    /**
     * Get preview of recent achievements (3 most recent)
     */
    private function getAchievementsPreview(): array
    {
        return $this->donorMilestones()
            ->whereNotNull('achieved_at')
            ->orderBy('achieved_at', 'desc')
            ->limit(3)
            ->get()
            ->map(fn($milestone) => [
                'title' => $milestone->title,
                'icon' => $milestone->icon,
                'achieved_at' => $milestone->achieved_at->format('Y-m-d'),
            ])
            ->toArray();
    }
}
