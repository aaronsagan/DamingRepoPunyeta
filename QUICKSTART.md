# 🚀 Quick Start Guide - Donor Campaign Analytics

## Run & Test in 3 Minutes

### Step 1: Backend (30 seconds)
```bash
cd capstone_backend

# Seed sample data (creates 20 donors, 5 charities, 40 campaigns, 716 donations)
php artisan db:seed --class=AnalyticsSampleSeeder

# Run tests to verify backend works
php artisan test --filter=DonorAnalyticsTest

# Start backend server (if not already running)
php artisan serve
```

Expected output:
```
✅ Created 20 sample donors
✅ Created 5 sample charities
✅ Created 40 sample campaigns
✅ Created 716 sample donations
✅ Tests: 8 passed
```

### Step 2: Frontend (30 seconds)
```bash
cd capstone_frontend

# Start dev server (if not already running)
npm run dev
```

Server starts at: `http://localhost:5173`

### Step 3: Test the Feature (2 minutes)

1. **Login**
   - Go to: `http://localhost:5173`
   - Click "Login"
   - Email: `donor1@test.com`
   - Password: `password`

2. **Access Analytics**
   - Navigate to: `/donor/campaign-analytics`
   - OR use the sidebar navigation (if available)

3. **Verify Features**
   - ✅ See 4 metric cards at top
   - ✅ View Overview tab (pie chart, trending campaigns, top charities)
   - ✅ Click Distribution tab (location data, beneficiaries)
   - ✅ Click Trends tab (line chart, campaign frequency)
   - ✅ Click Insights tab (auto-generated summaries)
   - ✅ Use filters panel on right:
     - Click "Last 30 Days" preset
     - Check/uncheck campaign types
     - Change granularity
     - Click "Apply Filters"

## 🎯 What You Should See

### Metric Cards (Top)
```
┌─────────────────┬──────────────────┬─────────────────┬─────────────────┐
│ Total Campaigns │ Total Donations  │ Avg Donation    │ Active Campaigns│
│      40         │  ₱1,234,567      │    ₱1,725       │      30         │
└─────────────────┴──────────────────┴─────────────────┴─────────────────┘
```

### Overview Tab
- **Pie Chart**: Campaign types (Medical, Education, Feeding, etc.)
- **Bar Chart**: Top 5 trending campaigns
- **List**: Top 5 charities with rankings

### Distribution Tab
- **Table**: Regions with campaign counts and total raised
- **Bar Chart**: Beneficiary types

### Trends Tab
- **Line Chart**: Donation amount and count over time
- **Bar Chart**: Campaign frequency by period

### Insights Tab
- 3-4 auto-generated insights like:
  - "Medical campaigns are most common with 12 campaigns (30% of total)"
  - "Sample Campaign 3 by Sample Charity 2 is trending with 25 donations"
  - "NCR has the most campaigns (15) with avg ₱45,000 raised"

## 🔍 API Testing (Optional)

Test backend directly with curl/Postman:

```bash
# Get auth token first
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"donor1@test.com","password":"password"}'

# Copy the token, then:

# Test summary endpoint
curl http://localhost:8000/api/donor-analytics/summary \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test query endpoint
curl -X POST http://localhost:8000/api/donor-analytics/query \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"granularity":"monthly","campaign_types":["medical","education"]}'

# Test campaign details
curl http://localhost:8000/api/donor-analytics/campaign/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🎨 Test Filters

### Date Range Presets
- Click "Last 7 Days" → Charts update to show only last week
- Click "Last 30 Days" → Back to default view
- Click "Last Year" → See annual trends

### Campaign Types
- Check "Medical" only → See only medical campaigns
- Check "Education" + "Medical" → See combined data
- Uncheck all → Shows all types again

### Granularity
- Select "Daily" → See day-by-day data
- Select "Weekly" → See week-by-week aggregation
- Select "Monthly" → See month-by-month trends

## 🐛 Troubleshooting

### Backend Issues

**"Connection refused"**
```bash
cd capstone_backend
php artisan serve
```

**"No data showing"**
```bash
php artisan db:seed --class=AnalyticsSampleSeeder
```

**"Token expired"**
- Logout and login again
- Or run: `php artisan cache:clear`

### Frontend Issues

**"Failed to fetch analytics"**
- Check backend is running: `http://localhost:8000/api/ping`
- Verify you're logged in
- Check browser console for errors

**"Charts not rendering"**
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear browser cache
- Check console for JavaScript errors

**"Filters not working"**
- Click "Apply Filters" button after changing
- Check that date range is valid (From < To)

## 📊 Sample Data Overview

The seeder creates realistic test data:

### Donors (20)
- `donor1@test.com` to `donor20@test.com`
- Each has made 35-36 donations on average

### Charities (5)
- `charity1@test.com` to `charity5@test.com`
- Each has 8 campaigns

### Campaigns (40)
- Types: Education, Medical, Feeding, Disaster Relief, Environment
- Locations: NCR, Region III, Region IV-A, Region VII
- Status: Mostly "published", some "archived"
- Created: Spread across last 180 days

### Donations (716)
- Amount: ₱100 to ₱5,000 each
- Status: 75% completed, 25% pending
- Created: Spread across last 90 days
- Total volume: ~₱1.8M

## ✅ Success Indicators

You'll know it's working when:
- ✅ All metric cards show numbers (not zeros)
- ✅ Pie chart has multiple colored segments
- ✅ Bar charts have visible bars
- ✅ Line chart shows trending data
- ✅ Insights tab shows 3-4 sentences
- ✅ Filters change the data when applied
- ✅ No console errors in browser
- ✅ No 500 errors from backend

## 🎉 Next Steps

After verifying the feature works:

1. **Explore Data**
   - Try different filter combinations
   - Check each tab thoroughly
   - Test on mobile (resize browser)

2. **Review Code**
   - Backend: `app/Http/Controllers/DonorAnalyticsController.php`
   - Frontend: `src/pages/analytics/DonorAnalyticsPage.tsx`
   - Tests: `tests/Feature/DonorAnalyticsTest.php`

3. **Read Documentation**
   - Full guide: `DONOR_ANALYTICS_README.md`
   - PR summary: `PR_SUMMARY.md`

4. **Customize (Optional)**
   - Add more campaign types in seeder
   - Adjust chart colors in frontend
   - Add more date presets
   - Extend insights generation

## 📞 Need Help?

Check these files for detailed info:
- `DONOR_ANALYTICS_README.md` - Complete documentation
- `PR_SUMMARY.md` - Feature overview and technical details
- Backend logs: `capstone_backend/storage/logs/laravel.log`
- Browser console: Press F12 in browser

---

**Total Setup Time**: ~3 minutes  
**Status**: ✅ Ready to use  
**Support**: See documentation files above

Happy testing! 🚀
