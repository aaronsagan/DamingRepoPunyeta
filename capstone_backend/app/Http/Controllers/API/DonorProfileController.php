<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DonorProfileResource;
use App\Http\Resources\DonationResource;
use App\Http\Resources\DonorMilestoneResource;
use App\Http\Resources\DonorBadgeResource;
use App\Models\User;
use App\Models\Donation;
use App\Models\DonorMilestone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DonorProfileController extends Controller
{
    /**
     * Get donor profile with computed metrics
     * 
     * @param int $id Donor user ID
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $donor = User::findOrFail($id);
        
        return response()->json([
            'data' => new DonorProfileResource($donor)
        ]);
    }

    /**
     * Get donor's activity (paginated donations)
     * 
     * @param int $id Donor user ID
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function activity($id, Request $request)
    {
        $perPage = $request->get('per_page', 10);
        $page = $request->get('page', 1);
        
        $donations = Donation::forDonor($id)
            ->with(['campaign', 'charity'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);
        
        return DonationResource::collection($donations);
    }

    /**
     * Get donor's milestones/achievements
     * 
     * @param int $id Donor user ID
     * @return \Illuminate\Http\JsonResponse
     */
    public function milestones($id)
    {
        $milestones = DonorMilestone::where('donor_id', $id)
            ->orderByRaw('achieved_at IS NULL') // Achieved first
            ->orderBy('achieved_at', 'desc')
            ->get();
        
        return response()->json([
            'data' => DonorMilestoneResource::collection($milestones)
        ]);
    }

    /**
     * Update donor profile (bio, contact)
     * Only owner can update
     * 
     * @param Request $request
     * @param int $id Donor user ID
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $donor = User::findOrFail($id);
        
        // Authorization: only the owner can update
        if (!$request->user() || $request->user()->id !== $donor->id) {
            return response()->json([
                'message' => 'Unauthorized. You can only update your own profile.'
            ], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'bio' => 'nullable|string|max:1000',
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'profile_image' => 'nullable|image|max:4096',
            'cover_image' => 'nullable|image|max:8192',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Handle basic fields
        $donor->fill($request->only(['bio', 'address', 'phone']));

        // Handle profile image upload
        if ($request->hasFile('profile_image')) {
            $path = $request->file('profile_image')->store('profiles', 'public');
            $donor->profile_image = $path;
        }

        // Handle cover image upload
        if ($request->hasFile('cover_image')) {
            $path = $request->file('cover_image')->store('covers', 'public');
            $donor->cover_image = $path;
        }

        $donor->save();
        
        return response()->json([
            'message' => 'Profile updated successfully',
            'data' => new DonorProfileResource($donor)
        ]);
    }

    /**
     * Get donor's badges/recognition
     * 
     * @param int $id Donor user ID
     * @return \Illuminate\Http\JsonResponse
     */
    public function badges($id)
    {
        $donor = User::findOrFail($id);
        
        // Calculate donor stats
        $totalDonated = Donation::forDonor($id)->verified()->sum('amount');
        $donationCount = Donation::forDonor($id)->verified()->count();
        $campaignsSupported = Donation::forDonor($id)->verified()->distinct('campaign_id')->count('campaign_id');
        
        // Define available badges and check if earned
        $badges = [
            [
                'name' => 'First Donation',
                'description' => 'Made your first charitable donation',
                'icon' => 'Heart',
                'earned' => $donationCount >= 1,
            ],
            [
                'name' => 'Generous Giver',
                'description' => 'Donated over ₱10,000',
                'icon' => 'Award',
                'earned' => $totalDonated >= 10000,
            ],
            [
                'name' => 'Community Supporter',
                'description' => 'Supported 5 different campaigns',
                'icon' => 'Users',
                'earned' => $campaignsSupported >= 5,
            ],
            [
                'name' => 'Super Donor',
                'description' => 'Donated over ₱50,000',
                'icon' => 'Trophy',
                'earned' => $totalDonated >= 50000,
            ],
            [
                'name' => 'Active Supporter',
                'description' => 'Made 10 or more donations',
                'icon' => 'Zap',
                'earned' => $donationCount >= 10,
            ],
            [
                'name' => 'Campaign Champion',
                'description' => 'Supported 10 different campaigns',
                'icon' => 'Flag',
                'earned' => $campaignsSupported >= 10,
            ],
        ];
        
        return response()->json([
            'data' => array_map(function($badge) {
                return (object) $badge;
            }, $badges)
        ]);
    }
}
