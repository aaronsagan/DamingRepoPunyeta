<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DonorMilestone extends Model
{
    protected $fillable = [
        'donor_id',
        'key',
        'title',
        'description',
        'icon',
        'achieved_at',
        'meta',
    ];

    protected $casts = [
        'meta' => 'array',
        'achieved_at' => 'datetime',
    ];

    /**
     * Get the donor (user) that owns this milestone.
     */
    public function donor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'donor_id');
    }

    /**
     * Check if milestone is achieved.
     */
    public function isAchieved(): bool
    {
        return !is_null($this->achieved_at);
    }

    /**
     * Mark milestone as achieved.
     */
    public function markAsAchieved(): void
    {
        if (!$this->isAchieved()) {
            $this->achieved_at = now();
            $this->save();
        }
    }
}
