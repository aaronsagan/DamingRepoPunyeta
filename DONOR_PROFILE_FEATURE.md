# Donor Profile Feature Documentation

## Overview
This feature provides a complete donor profile system matching the visual structure of the charity profile page, with donor-specific metrics, milestones/achievements, and activity tracking.

## Backend Implementation

### Database Schema

#### `donor_milestones` Table
- `id` (bigint, primary key)
- `donor_id` (foreign key to users.id)
- `key` (string) - Machine-readable identifier (e.g., 'first_donation', 'total_1000')
- `title` (string) - Display title
- `description` (text) - Description of the milestone
- `icon` (string, nullable) - Icon name for UI
- `achieved_at` (timestamp, nullable) - When milestone was achieved
- `meta` (json, nullable) - Additional data (threshold, progress, etc.)
- `created_at`, `updated_at`
- **Unique constraint**: `(donor_id, key)`
- **Indexes**: `donor_id`, `key`, `(donor_id, key)`

#### `users` Table Addition
- `bio` (text, nullable) - User biography/about section

### API Endpoints

#### GET /api/donors/{id}
**Description**: Fetch donor profile with computed metrics

**Response**:
```json
{
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com", // Only visible to owner
    "avatar_url": "https://...",
    "bio": "Making a difference...",
    "location": "Manila, Philippines",
    "member_since": "2025-10-01",
    "total_donated": 5000.00,
    "campaigns_supported_count": 3,
    "recent_donations_count": 5,
    "liked_campaigns_count": 10,
    "achievements_preview": [
      {
        "title": "First Donation",
        "icon": "Heart",
        "achieved_at": "2025-10-15"
      }
    ],
    "is_owner": true
  }
}
```

#### GET /api/donors/{id}/activity
**Description**: Get paginated list of donor's donations

**Query Parameters**:
- `per_page` (default: 10)
- `page` (default: 1)

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "amount": 1000.00,
      "status": "auto_verified",
      "created_at": "2025-10-31T10:00:00Z",
      "donated_at": "2025-10-31T10:00:00Z",
      "campaign": {
        "id": 5,
        "title": "Help Flood Victims",
        "slug": "help-flood-victims",
        "cover_image": "https://..."
      },
      "charity": {
        "id": 2,
        "name": "Red Cross"
      },
      "receipt_url": "https://...",
      "is_anonymous": false,
      "purpose": "emergency",
      "ocr_verified": true,
      "manually_verified": false
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 10,
    "total": 25
  }
}
```

#### GET /api/donors/{id}/milestones
**Description**: Get all milestones for a donor

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "key": "first_donation",
      "title": "First Donation",
      "description": "Made your first donation to a campaign",
      "icon": "Heart",
      "achieved": true,
      "achieved_at": "2025-10-15T14:30:00Z",
      "meta": {
        "threshold": 1,
        "progress": 1
      },
      "progress": 1,
      "threshold": 1
    },
    {
      "id": 2,
      "key": "total_1000",
      "title": "Generous Supporter",
      "description": "Donated a total of ₱1,000 or more",
      "icon": "Award",
      "achieved": false,
      "achieved_at": null,
      "meta": {
        "threshold": 1000,
        "progress": 500
      },
      "progress": 500,
      "threshold": 1000
    }
  ]
}
```

#### PUT /api/donors/{id}/profile
**Description**: Update donor profile (authenticated, owner only)

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "bio": "Updated biography text",
  "address": "Manila, Philippines",
  "phone": "+1234567890"
}
```

**Response**:
```json
{
  "message": "Profile updated successfully",
  "data": { /* updated profile */ }
}
```

**Authorization**: Returns 403 if user is not the profile owner

### Models

#### DonorMilestone
- **Relationships**: `belongsTo(User, 'donor_id')`
- **Methods**:
  - `isAchieved()`: Check if milestone is achieved
  - `markAsAchieved()`: Mark milestone as achieved with current timestamp

#### User (Extended)
- **New Relationship**: `donorMilestones()` - `hasMany(DonorMilestone, 'donor_id')`

#### Donation (Extended)
- **New Scopes**:
  - `forDonor($donorId)`: Filter by donor
  - `verified()`: Filter verified donations only
- **New Method**: `isVerified()`: Check if donation is verified

### Artisan Commands

#### `php artisan donor:refresh-milestones`
**Description**: Evaluate and update all donor milestone achievements based on current donation data

**Options**:
- `--donor={id}`: Refresh milestones for a specific donor only

**Milestone Definitions**:
1. **first_donation**: Made first donation (threshold: 1)
2. **total_1000**: Donated ₱1,000+ total (threshold: 1000)
3. **total_5000**: Donated ₱5,000+ total (threshold: 5000)
4. **total_10000**: Donated ₱10,000+ total (threshold: 10000)
5. **supported_5_campaigns**: Supported 5 different campaigns (threshold: 5)
6. **supported_10_campaigns**: Supported 10 different campaigns (threshold: 10)
7. **verified_donor**: Had at least one OCR-verified donation (threshold: 1)

**Example**:
```bash
# Refresh all donors
php artisan donor:refresh-milestones

# Refresh specific donor
php artisan donor:refresh-milestones --donor=5
```

### Seeders

#### DonorMilestoneSeeder
**Description**: Creates default milestone definitions for all donors

**Usage**:
```bash
php artisan db:seed --class=DonorMilestoneSeeder
```

## Frontend Implementation

### Pages

#### DonorProfilePage (`/donor/profile`)
Main donor profile page with charity-profile-matching layout

**Features**:
- Cover photo with gradient background
- Large avatar with initials fallback
- Profile header with name, badges, location
- Edit Profile and Share buttons (for owner)
- 4 metric cards: Total Donated, Campaigns Supported, Recent Donations, Liked Campaigns
- 3 tabs: About, Milestones, Recent Activity

**Layout**:
- **About Tab**: Large card (bio) + small card (member info)
- **Milestones Tab**: Large card (milestone list) + small card (summary)
- **Activity Tab**: Large card (donation list) + small card (quick actions)

### Components

#### MetricCard
**Props**:
- `icon`: Lucide icon component
- `label`: Metric label text
- `value`: Metric value to display
- `gradient`, `ring`, `iconColor`, `valueColor`: Styling props
- `onClick`: Optional click handler

**Usage**:
```tsx
<MetricCard
  icon={TrendingUp}
  label="Total Donated"
  value={formatCurrency(1000)}
  gradient="from-emerald-500/20 via-emerald-400/10 to-transparent"
  ring="ring-emerald-500/30"
  iconColor="text-emerald-400"
  valueColor="text-emerald-400"
/>
```

#### MilestoneCard
**Props**:
- `milestone`: DonorMilestone object

**Features**:
- Dynamic icon from milestone data
- Achievement badge when unlocked
- Progress bar for unachieved milestones
- Achievement date display

#### ActivityList
**Props**:
- `donations`: Array of DonorDonation objects
- `loading`: Loading state
- `hasMore`: Whether more pages exist
- `onLoadMore`: Load more handler

**Features**:
- Campaign thumbnails
- Donation amount with verification badges
- Receipt link (if available)
- Load more pagination
- Empty state with CTA

### Custom Hooks

#### useDonorProfile(donorId)
**Returns**: `{ profile, loading, error, refetch }`

**Example**:
```tsx
const { profile, loading } = useDonorProfile('5');
```

#### useDonorActivity(donorId, perPage?)
**Returns**: `{ donations, loading, error, meta, loadMore, hasMore, refetch }`

**Example**:
```tsx
const { donations, loadMore, hasMore } = useDonorActivity('5', 10);
```

#### useDonorMilestones(donorId)
**Returns**: `{ milestones, loading, error, refetch }`

**Example**:
```tsx
const { milestones } = useDonorMilestones('5');
```

#### updateDonorProfile(donorId, data)
**Returns**: `Promise<{ success: boolean, error?: string }>`

**Example**:
```tsx
const result = await updateDonorProfile(5, {
  bio: 'Updated bio',
  address: 'New location'
});
```

## Testing

### Backend Tests
Location: `tests/Feature/DonorProfileTest.php`

**Test Cases**:
1. ✅ Can fetch donor profile
2. ✅ Can fetch donor activity (paginated)
3. ✅ Can fetch donor milestones
4. ✅ Only owner can update profile
5. ✅ Owner can update profile successfully
6. ✅ Profile update requires authentication
7. ✅ Non-existent donor returns 404

**Run Tests**:
```bash
php artisan test --filter=DonorProfileTest
```

## Setup Instructions

### Initial Setup
```bash
# 1. Run migrations
cd capstone_backend
php artisan migrate

# 2. Seed milestone definitions for existing donors
php artisan db:seed --class=DonorMilestoneSeeder

# 3. Evaluate and mark achieved milestones
php artisan donor:refresh-milestones

# 4. Install frontend dependencies (if needed)
cd ../capstone_frontend
npm install

# 5. Start development servers
# Terminal 1 - Backend
cd capstone_backend
php artisan serve

# Terminal 2 - Frontend
cd capstone_frontend
npm run dev
```

### Adding New Milestones

1. Add milestone definition to `DonorMilestoneSeeder`:
```php
[
    'key' => 'new_milestone_key',
    'title' => 'Achievement Title',
    'description' => 'Description of what this achieves',
    'icon' => 'IconName', // Lucide icon name
    'meta' => json_encode(['threshold' => 100]),
]
```

2. Add evaluation logic to `RefreshDonorMilestones` command:
```php
case 'new_milestone_key':
    $shouldAchieve = /* your condition */;
    break;
```

3. Update progress tracking in same command:
```php
case 'new_milestone_key':
    $meta['progress'] = /* current progress value */;
    break;
```

## Security Considerations

1. **Email Privacy**: Email only shown to profile owner (checked via `is_owner` flag)
2. **Update Authorization**: Profile updates restricted to owner via middleware check
3. **Public vs Private**: Profile viewing is public, but editing requires authentication
4. **Input Validation**: All profile update fields validated (bio max 1000 chars, etc.)

## Performance Optimizations

1. **Eager Loading**: Activity endpoint eager loads campaign and charity relationships
2. **Pagination**: Activity list paginated (default 10 per page)
3. **Indexes**: Database indexes on `donor_id`, `key`, and composite `(donor_id, key)`
4. **Computed Metrics**: Stats calculated on-demand but can be cached if needed

## Future Enhancements

1. Add campaign likes/favorites tracking for "Liked Campaigns" metric
2. Implement profile photo upload
3. Add social media links to profile
4. Create public donor profile page (separate from authenticated view)
5. Add achievement notifications when milestones are unlocked
6. Implement donor leaderboards based on milestones
7. Add milestone sharing to social media
8. Create achievement badges/icons library

## Troubleshooting

### Milestones not showing as achieved
```bash
# Re-run the milestone refresh command
php artisan donor:refresh-milestones
```

### Profile metrics showing 0
- Ensure donations have `verification_status` set to 'auto_verified' or 'manual_verified'
- Check that donations are linked to campaigns via `campaign_id`

### Frontend API errors
- Verify `VITE_API_URL` is set correctly in `.env`
- Check backend API routes are registered in `routes/api.php`
- Ensure CORS is configured if frontend/backend on different domains
