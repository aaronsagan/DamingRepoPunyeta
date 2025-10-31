<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Donation extends Model
{
    protected $fillable = [
        'donor_id','donor_name','donor_email','charity_id','campaign_id','amount','purpose','is_anonymous',
        'status','proof_path','proof_type','channel_used','reference_number','message','external_ref','receipt_no','donated_at',
        'is_recurring','recurring_type','recurring_end_date','next_donation_date','parent_donation_id',
        'receipt_image_path','ocr_text','ocr_ref_number','ocr_amount','ocr_date','ocr_confidence','verification_status'
    ];

    protected $casts = [
        'is_anonymous' => 'boolean',
        'is_recurring' => 'boolean',
        'donated_at'   => 'datetime',
        'next_donation_date' => 'datetime',
        'recurring_end_date' => 'datetime',
        'amount'       => 'decimal:2',
    ];

    public function donor(){ return $this->belongsTo(User::class,'donor_id'); }
    public function charity(){ return $this->belongsTo(Charity::class); }
    public function campaign(){ return $this->belongsTo(Campaign::class); }
    public function parentDonation(){ return $this->belongsTo(Donation::class, 'parent_donation_id'); }
    public function recurringDonations(){ return $this->hasMany(Donation::class, 'parent_donation_id'); }

    /**
     * Scope to get donations for a specific donor
     */
    public function scopeForDonor($query, int $donorId)
    {
        return $query->where('donor_id', $donorId);
    }

    /**
     * Scope to get verified donations (auto or manual)
     */
    public function scopeVerified($query)
    {
        return $query->whereIn('verification_status', ['auto_verified', 'manual_verified']);
    }

    /**
     * Check if donation is verified
     */
    public function isVerified(): bool
    {
        return in_array($this->verification_status, ['auto_verified', 'manual_verified']);
    }
}
