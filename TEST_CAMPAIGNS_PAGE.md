# 🧪 Testing the New Campaigns Page

## Quick Start (30 seconds)

### 1. Make sure backend and frontend are running:
```bash
# Terminal 1 - Backend
cd capstone_backend
php artisan serve

# Terminal 2 - Frontend
cd capstone_frontend
npm run dev
```

### 2. Login as a donor:
- Go to: `http://localhost:5173`
- Email: `donor1@test.com`
- Password: `password`

### 3. Access the Campaigns page:
**Option A:** Click **"Campaigns"** in the top navbar (between News Feed and Charities)

**Option B:** Direct URL: `http://localhost:5173/donor/campaigns/browse`

---

## 🎯 What to Test

### ✅ Basic Viewing
1. You should see a **hero section** with:
   - "Browse Campaigns" title
   - Total campaign count
   - Search bar
   - Filters button

2. Below that, a **3-column grid** of campaign cards showing:
   - Campaign title
   - Charity name
   - Progress bar
   - Goal amounts
   - Campaign type badge
   - Location
   - "Donate Now" button

### ✅ Search Functionality
1. Type something in the **search bar** (e.g., "medical", "education")
2. Click **"Search"** button OR press **Enter**
3. Results should filter immediately
4. Notice the **search pill** appears below showing active search
5. Click the **X** on the pill to clear search

### ✅ Filters
1. Click the **"Filters"** button (shows count badge if filters active)
2. Filter panel should **slide open**
3. Try different filters:
   - **Campaign Type** dropdown (Education, Medical, etc.)
   - **Region** dropdown (NCR, Region III, etc.)
   - **Province** dropdown (Metro Manila, Bulacan, etc.)
   - **City** dropdown (Manila, Quezon City, etc.)
   - **Min Goal** (e.g., 10000)
   - **Max Goal** (e.g., 50000)
   - **Date range** (start and end dates)
4. Click **"Apply Filters"**
5. Results should update
6. **Active filter pills** appear below filters button
7. Click **X** on individual pills to remove specific filters
8. Click **"Clear All"** to reset everything

### ✅ Pagination
1. If there are more than 12 campaigns:
   - **Pagination controls** appear at bottom
   - Shows **"Page X of Y"**
   - **Previous** button (disabled on first page)
   - **Next** button (disabled on last page)
2. Click **"Next"** to go to page 2
3. Click **"Previous"** to go back to page 1

### ✅ Empty State
1. Apply filters that have no results (e.g., Min Goal: 999999999)
2. Should see:
   - Target icon
   - "No campaigns found" message
   - Suggestion to adjust filters
   - **"Clear All Filters"** button

### ✅ Loading States
1. On initial page load:
   - Should see **skeleton cards** (6 gray boxes)
2. When clicking "Apply Filters":
   - Should see **spinner** with "Loading campaigns..." message

### ✅ Responsive Design
1. **Desktop** (wide screen): 3 columns
2. **Tablet** (medium): 2 columns (resize browser to test)
3. **Mobile** (narrow): 1 column (resize browser or use mobile device)

### ✅ Navigation
1. **Desktop navbar**: Click "Campaigns" link
2. **Mobile menu**: Tap user icon → "Browse Campaigns"
3. **From home page**: Click "Browse Campaigns" button in hero section

---

## 🐛 Common Issues & Fixes

### Issue: "No campaigns found" immediately
**Cause:** No campaigns in database  
**Fix:** Run the seeder again:
```bash
cd capstone_backend
php artisan db:seed --class=AnalyticsSampleSeeder
```

### Issue: Filter options don't load (empty dropdowns)
**Cause:** Backend not running or API error  
**Fix:** 
- Check backend is running: `php artisan serve`
- Check browser console for errors (F12)
- Verify you're logged in

### Issue: "Failed to load campaigns" error
**Cause:** API connection issue  
**Fix:**
- Check `.env` file has correct `VITE_API_URL`
- Clear cache: Ctrl+Shift+R (hard refresh)
- Check network tab in browser (F12) for failed requests

### Issue: Campaigns show but cards look broken
**Cause:** Missing CampaignCard component styles  
**Fix:** Should not happen as we're reusing existing component

### Issue: Filters don't work
**Cause:** Apply button not clicked OR backend endpoint issue  
**Fix:**
- Make sure to click "Apply Filters" button
- Check browser console for errors
- Verify backend route exists: `/api/campaigns/filter`

---

## ✨ Expected Behavior

### On Page Load:
```
1. Shows skeleton loading cards (6 gray boxes)
2. Fetches campaigns from backend
3. Displays campaigns in 3-column grid
4. Shows total count in hero section
5. Filters button ready to use
```

### After Searching:
```
1. Search term appears in pill below filters button
2. Grid updates with matching campaigns
3. Pagination resets to page 1
4. Can clear search by clicking X on pill
```

### After Filtering:
```
1. Active filters show as pills (if filters hidden)
2. OR filters remain visible in panel
3. Filter count badge updates on button
4. Grid updates with filtered campaigns
5. Empty state if no matches
```

### Clicking a Campaign Card:
```
1. Navigates to campaign detail page
2. Shows full campaign information
3. Donate Now button functional
```

---

## 📸 What It Should Look Like

### Hero Section:
```
╔════════════════════════════════════════════════════╗
║  🎯 Browse Campaigns                               ║
║  Discover meaningful causes and make an impact     ║
║  today. 40 campaigns available.                   ║
║                                                    ║
║  [🔍 Search campaigns...] [Search] [Filters (0)]  ║
╚════════════════════════════════════════════════════╝
```

### Campaign Grid:
```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ [Image]         │ │ [Image]         │ │ [Image]         │
│ Campaign Title  │ │ Campaign Title  │ │ Campaign Title  │
│ Charity Name    │ │ Charity Name    │ │ Charity Name    │
│ [Progress Bar]  │ │ [Progress Bar]  │ │ [Progress Bar]  │
│ ₱50K of ₱100K  │ │ ₱50K of ₱100K  │ │ ₱50K of ₱100K  │
│ 📍 Manila      │ │ 📍 Cebu        │ │ 📍 Davao       │
│ [Donate Now]    │ │ [Donate Now]    │ │ [Donate Now]    │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### Filter Panel (when open):
```
╔══════════════════════════════════════════════════╗
║  🔍 Filter Campaigns              [Clear All]    ║
╠══════════════════════════════════════════════════╣
║  [Campaign Type ▼]  [Region ▼]    [Province ▼]  ║
║  [City ▼]           [Min Goal]    [Max Goal]    ║
║  [Start Date]       [End Date]                   ║
║                                    [Apply Filter] ║
╚══════════════════════════════════════════════════╝
```

---

## ✅ Success Criteria

The page is working correctly if:

- ✅ You can see campaigns in a 3-column grid
- ✅ Search works and shows results
- ✅ Filters apply and update results
- ✅ Pagination works (if > 12 campaigns)
- ✅ Loading states show (skeletons/spinner)
- ✅ Empty state shows when no results
- ✅ Campaign cards match home page design
- ✅ Clicking cards navigates to details
- ✅ Responsive on mobile/tablet/desktop
- ✅ Active filter pills show and are removable
- ✅ Clear All button resets everything

---

## 🎉 Quick Test Checklist

Copy this checklist and test each item:

```
Page Access:
[ ] Can access from navbar "Campaigns" link
[ ] Can access from mobile menu
[ ] Direct URL works: /donor/campaigns/browse

Display:
[ ] Hero section shows with title and search
[ ] Campaigns display in 3-column grid
[ ] Campaign cards look good (images, progress, etc.)
[ ] Total count shows in hero

Search:
[ ] Can type in search bar
[ ] Enter key triggers search
[ ] Search button triggers search
[ ] Search pill appears with active search
[ ] Can clear search via pill X button

Filters:
[ ] Filters button toggles panel open/close
[ ] All dropdowns populate with options
[ ] Can select multiple filters
[ ] Apply button updates results
[ ] Active filter pills show
[ ] Can remove individual filters via pills
[ ] Clear All resets everything
[ ] Filter count badge updates

Pagination:
[ ] Shows when > 12 campaigns
[ ] Can navigate to next page
[ ] Can navigate to previous page
[ ] Page indicator updates
[ ] Buttons disable appropriately

States:
[ ] Loading skeletons on initial load
[ ] Spinner during filter application
[ ] Empty state when no results
[ ] Friendly error messages

Responsive:
[ ] 3 columns on desktop
[ ] 2 columns on tablet
[ ] 1 column on mobile
[ ] All elements fit properly

Interaction:
[ ] Can click campaign cards
[ ] Navigates to campaign detail
[ ] Hover effects work
[ ] All buttons clickable
```

---

**Status:** ✅ Ready to Test  
**Time:** ~5 minutes for full testing  
**Result:** Fully functional Campaigns browse page! 🎉
