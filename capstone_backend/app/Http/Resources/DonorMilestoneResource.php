<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DonorMilestoneResource extends JsonResource
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
            'key' => $this->key,
            'title' => $this->title,
            'description' => $this->description,
            'icon' => $this->icon,
            'achieved' => $this->isAchieved(),
            'achieved_at' => $this->achieved_at?->toISOString(),
            'meta' => $this->meta,
            'progress' => $this->meta['progress'] ?? null,
            'threshold' => $this->meta['threshold'] ?? null,
        ];
    }
}
