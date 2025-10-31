<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DonationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'amount' => (float) $this->amount,
            'status' => $this->verification_status ?? $this->status,
            'created_at' => $this->created_at?->toISOString(),
            'donated_at' => $this->donated_at?->toISOString(),
            'campaign' => $this->when($this->campaign, [
                'id' => $this->campaign?->id,
                'title' => $this->campaign?->title,
                'slug' => $this->campaign?->slug,
                'cover_image' => $this->campaign?->cover_image_path 
                    ? url('storage/' . $this->campaign->cover_image_path) 
                    : null,
            ]),
            'charity' => $this->when($this->charity, [
                'id' => $this->charity?->id,
                'name' => $this->charity?->name,
            ]),
            'receipt_url' => $this->receipt_image_path 
                ? url('storage/' . $this->receipt_image_path) 
                : ($this->proof_path ? url('storage/' . $this->proof_path) : null),
            'is_anonymous' => (bool) $this->is_anonymous,
            'purpose' => $this->purpose,
            'ocr_verified' => $this->verification_status === 'auto_verified',
            'manually_verified' => $this->verification_status === 'manual_verified',
        ];
    }
}
