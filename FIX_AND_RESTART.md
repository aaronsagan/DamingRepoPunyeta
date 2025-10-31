# 🔧 Complete Fix and Restart Guide

## Issues Fixed:
1. ✅ Deleted old `BrowseCampaignsFiltered.tsx` file
2. ✅ Backend routes verified and exist (`/api/campaigns/filter`, `/api/campaigns/filter-options`)
3. ✅ Routes cache cleared
4. ✅ Import errors fixed

## Complete Restart Steps:

### Step 1: Clear All Caches
```bash
# Backend
cd capstone_backend
php artisan cache:clear
php artisan route:clear
php artisan config:clear
php artisan view:clear

# Frontend - Close dev server (Ctrl+C), then:
cd capstone_frontend
npm run build --force
```

### Step 2: Restart Everything
```bash
# Terminal 1 - Backend
cd capstone_backend
php artisan serve

# Terminal 2 - Frontend  
cd capstone_frontend  
npm run dev
```

### Step 3: Clear Browser Cache
1. Open browser
2. Press **Ctrl + Shift + Delete**
3. Clear **Cached images and files**
4. OR just do **Hard Refresh**: **Ctrl + Shift + R**

### Step 4: Test
1. Go to: `http://localhost:5173` (or whatever port Vite shows)
2. Login: `donor1@test.com` / `password`
3. Click **"Campaigns"** in navbar
4. Should load without errors!

---

## If Still Getting Errors:

### Error: "Target is not defined"
**Fix**: Hard refresh browser (Ctrl + Shift + R) or clear browser cache

### Error: "404 on /api/campaigns/filter"
**Fix**: Make sure backend is running on port 8000
```bash
cd capstone_backend
php artisan serve
# Should show: "Server running on [http://127.0.0.1:8000]"
```

### Error: "No campaigns showing"
**Fix**: Make sure you have data in database
```bash
cd capstone_backend  
php artisan db:seed --class=AnalyticsSampleSeeder
```

### Error: "Failed to load resource: 401 Unauthorized"
**Fix**: Login again
- Logout
- Clear browser cache
- Login again with `donor1@test.com` / `password`

---

## Quick Verification:

### Backend Routes Check:
```bash
cd capstone_backend
php artisan route:list --path=campaigns/filter
```

Should show:
```
GET|HEAD  api/campaigns/filter
GET|HEAD  api/campaigns/filter-options
```

### Frontend Files Check:
These files should exist:
- ✅ `src/pages/donor/BrowseCampaigns.tsx` (NEW)
- ❌ `src/pages/donor/BrowseCampaignsFiltered.tsx` (DELETED)

---

## Expected Result:

After following these steps, you should see:

1. **Navbar** has "Campaigns" link
2. **Campaigns page** loads with:
   - Hero section with search bar
   - Filter button (collapsible)
   - 3-column grid of campaigns (using CampaignCard component)
   - Pagination at bottom
3. **No console errors**
4. **Filters work** when you apply them

---

**Status**: All fixes applied, ready to restart! 🚀
