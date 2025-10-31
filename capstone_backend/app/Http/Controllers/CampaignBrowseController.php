<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CampaignBrowseController extends Controller
{
    /**
     * GET /api/campaigns/filter-options
     * Get available filter options for browsing campaigns
     */
    public function filterOptions()
    {
        $cacheKey = 'campaign_browse_filter_options';
        
        $options = Cache::remember($cacheKey, 3600, function () {
            // Get unique regions
            $regions = Campaign::whereNotNull('region')
                ->where('status', 'published')
                ->distinct()
                ->pluck('region')
                ->filter()
                ->sort()
                ->values();
            
            // Get unique provinces
            $provinces = Campaign::whereNotNull('province')
                ->where('status', 'published')
                ->distinct()
                ->pluck('province')
                ->filter()
                ->sort()
                ->values();
            
            // Get unique cities
            $cities = Campaign::whereNotNull('city')
                ->where('status', 'published')
                ->distinct()
                ->pluck('city')
                ->filter()
                ->sort()
                ->values();
            
            // Campaign types
            $types = [
                ['value' => 'education', 'label' => 'Education'],
                ['value' => 'feeding_program', 'label' => 'Feeding Program'],
                ['value' => 'medical', 'label' => 'Medical'],
                ['value' => 'disaster_relief', 'label' => 'Disaster Relief'],
                ['value' => 'environment', 'label' => 'Environment'],
                ['value' => 'animal_welfare', 'label' => 'Animal Welfare'],
                ['value' => 'other', 'label' => 'Other'],
            ];
            
            return [
                'regions' => $regions,
                'provinces' => $provinces,
                'cities' => $cities,
                'types' => $types,
            ];
        });
        
        return response()->json($options);
    }
    
    /**
     * GET /api/campaigns/filter
     * Filter and browse campaigns with multiple criteria
     */
    public function filter(Request $request)
    {
        $validated = $request->validate([
            'campaign_type' => 'nullable|string',
            'region' => 'nullable|string',
            'province' => 'nullable|string',
            'city' => 'nullable|string',
            'min_goal' => 'nullable|numeric|min:0',
            'max_goal' => 'nullable|numeric',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'status' => 'nullable|in:published,closed',
            'search' => 'nullable|string|max:255',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);
        
        $query = Campaign::with(['charity:id,name'])
            ->where('status', '!=', 'archived');
        
        // Filter by campaign type
        if (!empty($validated['campaign_type'])) {
            $query->where('campaign_type', $validated['campaign_type']);
        }
        
        // Filter by location
        if (!empty($validated['region'])) {
            $query->where('region', $validated['region']);
        }
        if (!empty($validated['province'])) {
            $query->where('province', $validated['province']);
        }
        if (!empty($validated['city'])) {
            $query->where('city', $validated['city']);
        }
        
        // Filter by goal range
        if (isset($validated['min_goal'])) {
            $query->where('target_amount', '>=', $validated['min_goal']);
        }
        if (isset($validated['max_goal'])) {
            $query->where('target_amount', '<=', $validated['max_goal']);
        }
        
        // Filter by date range
        if (!empty($validated['start_date'])) {
            $query->where('start_date', '>=', $validated['start_date']);
        }
        if (!empty($validated['end_date'])) {
            $query->where('end_date', '<=', $validated['end_date']);
        }
        
        // Filter by status
        if (!empty($validated['status'])) {
            $query->where('status', $validated['status']);
        } else {
            // Default to published only
            $query->where('status', 'published');
        }
        
        // Search in title, description, and beneficiary
        if (!empty($validated['search'])) {
            $search = $validated['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%")
                  ->orWhere('beneficiary', 'LIKE', "%{$search}%");
            });
        }
        
        // Order by latest first
        $query->orderBy('created_at', 'desc');
        
        // Paginate results
        $perPage = $validated['per_page'] ?? 12;
        $campaigns = $query->paginate($perPage);
        
        // Add current_amount and donors_count to each campaign
        $campaigns->getCollection()->transform(function ($campaign) {
            // Calculate current amount from donations
            $currentAmount = \App\Models\Donation::where('campaign_id', $campaign->id)
                ->where('verification_status', 'verified')
                ->sum('amount');
            
            // Count unique donors
            $donorsCount = \App\Models\Donation::where('campaign_id', $campaign->id)
                ->where('verification_status', 'verified')
                ->distinct('donor_id')
                ->count('donor_id');
            
            return [
                'id' => $campaign->id,
                'title' => $campaign->title,
                'description' => $campaign->description,
                'campaign_type' => $campaign->campaign_type,
                'target_amount' => (float) $campaign->target_amount,
                'current_amount' => (float) $currentAmount,
                'progress' => $campaign->target_amount > 0 
                    ? round(($currentAmount / $campaign->target_amount) * 100, 2)
                    : 0,
                'donors_count' => $donorsCount,
                'status' => $campaign->status,
                'start_date' => $campaign->start_date?->format('Y-m-d'),
                'deadline_at' => $campaign->deadline_at?->format('Y-m-d'),
                'region' => $campaign->region,
                'province' => $campaign->province,
                'city' => $campaign->city,
                'beneficiary' => $campaign->beneficiary,
                'charity' => $campaign->charity ? [
                    'id' => $campaign->charity->id,
                    'name' => $campaign->charity->name,
                ] : null,
                'cover_image_path' => $campaign->cover_image_path,
                'created_at' => $campaign->created_at->format('Y-m-d'),
                'views' => $campaign->views ?? 0,
            ];
        });
        
        return response()->json($campaigns);
    }
}
