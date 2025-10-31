# 🏗️ Donor Campaign Analytics - System Architecture

## 📐 System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER (Donor)                                 │
│                    Browser: localhost:5173                           │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               │ HTTP/JSON
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                    FRONTEND (React + TypeScript)                     │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  DonorAnalyticsPage.tsx                                        │ │
│  │  ┌──────────────┬──────────────┬──────────────────────────┐   │ │
│  │  │ MetricCards  │ FiltersPanel │ Tabs (4)                 │   │ │
│  │  └──────────────┴──────────────┴──────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Custom Hooks                                                │   │
│  │  • useAnalyticsSummary()  → GET /summary                    │   │
│  │  • useAnalyticsQuery()    → POST /query                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               │ REST API (auth:sanctum)
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                    BACKEND (Laravel + PHP)                           │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  routes/api.php                                                │ │
│  │  • GET  /donor-analytics/summary                              │ │
│  │  • POST /donor-analytics/query                                │ │
│  │  • GET  /donor-analytics/campaign/{id}                        │ │
│  │  • GET  /donor-analytics/donor/{id}/overview                  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                ↓                                     │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  DonorAnalyticsController.php                                  │ │
│  │  • summary()           → High-level metrics                    │ │
│  │  • query()             → Complex filtered analytics            │ │
│  │  • campaignDetails()   → Single campaign drill-down            │ │
│  │  • donorOverview()     → Personal giving stats                 │ │
│  │                                                                 │ │
│  │  Helper Methods:                                               │ │
│  │  • getCampaignTypeDistribution()                               │ │
│  │  • getTopTrendingCampaigns()                                   │ │
│  │  • getCharityRankings()                                        │ │
│  │  • getDonationsTimeSeries()                                    │ │
│  │  • getCampaignFrequencyTimeSeries()                            │ │
│  │  • getLocationDistribution()                                   │ │
│  │  • getBeneficiaryBreakdown()                                   │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                ↓                                     │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Cache Layer (Laravel Cache / Redis)                          │ │
│  │  • TTL: 3-5 minutes                                            │ │
│  │  • Key format: donor_analytics_{hash}                         │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                ↓                                     │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Eloquent ORM + Query Builder                                  │ │
│  │  • Optimized SQL with GROUP BY, SUM, COUNT, AVG               │ │
│  │  • Joins: campaigns ↔ donations ↔ charities                   │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               │ SQL Queries
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                    DATABASE (MySQL)                                  │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Tables:                                                        │ │
│  │  • campaigns    (40 rows)   - Campaign data                    │ │
│  │  • donations    (716 rows)  - Donation transactions            │ │
│  │  • charities    (5 rows)    - Charity organizations            │ │
│  │  • users        (25 rows)   - Donors + admins                  │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagrams

### 1. Summary Metrics Flow

```
User Action: Page Load
     ↓
Frontend: useAnalyticsSummary() hook
     ↓
API: GET /donor-analytics/summary?date_from=X&date_to=Y
     ↓
Backend: DonorAnalyticsController@summary
     ↓
Check Cache: donor_analytics_summary_{hash}
     ↓
     ├─→ Cache HIT  → Return cached data (fast: ~50ms)
     │
     └─→ Cache MISS → Execute queries:
                      • COUNT campaigns
                      • SUM donations.amount
                      • AVG donations.amount
                      ↓
                      Store in cache (TTL: 5 min)
                      ↓
                      Return JSON response
     ↓
Frontend: Update MetricCards component
     ↓
User sees: 4 metric cards with numbers
```

### 2. Complex Query Flow

```
User Action: Apply Filters + Click Tab
     ↓
Frontend: useAnalyticsQuery() hook
     ↓
API: POST /donor-analytics/query
     Body: {
       date_from: "2025-01-01",
       date_to: "2025-11-01",
       campaign_types: ["medical", "education"],
       granularity: "monthly"
     }
     ↓
Backend: DonorAnalyticsController@query
     ↓
Check Cache: donor_analytics_query_{hash}
     ↓
     ├─→ Cache HIT  → Return cached data
     │
     └─→ Cache MISS → Execute 7 queries in parallel:
                      1. getCampaignTypeDistribution()
                      2. getTopTrendingCampaigns()
                      3. getCharityRankings()
                      4. getDonationsTimeSeries()
                      5. getCampaignFrequencyTimeSeries()
                      6. getLocationDistribution()
                      7. getBeneficiaryBreakdown()
                      ↓
                      Aggregate results
                      ↓
                      Store in cache (TTL: 3 min)
                      ↓
                      Return JSON response
     ↓
Frontend: Update all charts in active tab
     ↓
User sees: Rendered charts with filtered data
```

### 3. Campaign Drill-Down Flow

```
User Action: Click on trending campaign
     ↓
Frontend: Navigate to campaign details (future enhancement)
     ↓
API: GET /donor-analytics/campaign/1
     ↓
Backend: DonorAnalyticsController@campaignDetails
     ↓
Check Cache: donor_analytics_campaign_1
     ↓
     ├─→ Cache HIT  → Return cached data
     │
     └─→ Cache MISS → Execute queries:
                      • Find campaign with charity
                      • Aggregate donation stats (SUM, AVG, MIN, MAX)
                      • Get timeline series (GROUP BY date)
                      • Generate "why_trending" reasons
                      ↓
                      Store in cache (TTL: 5 min)
                      ↓
                      Return detailed JSON
     ↓
Frontend: Show campaign modal/page (future)
     ↓
User sees: Detailed campaign analytics
```

---

## 🗄️ Database Schema (Relevant Tables)

### campaigns
```sql
┌──────────────┬─────────────────┬──────────────────────────┐
│ Column       │ Type            │ Description              │
├──────────────┼─────────────────┼──────────────────────────┤
│ id           │ BIGINT          │ Primary key              │
│ charity_id   │ BIGINT          │ FK to charities          │
│ title        │ VARCHAR(255)    │ Campaign name            │
│ campaign_type│ VARCHAR(50)     │ Type (medical, etc.)     │
│ target_amount│ DECIMAL(15,2)   │ Fundraising goal         │
│ status       │ VARCHAR(20)     │ published/archived       │
│ region       │ VARCHAR(100)    │ Location region          │
│ province     │ VARCHAR(100)    │ Location province        │
│ city         │ VARCHAR(100)    │ Location city            │
│ barangay     │ VARCHAR(100)    │ Location barangay        │
│ created_at   │ TIMESTAMP       │ Creation date            │
│ updated_at   │ TIMESTAMP       │ Last update              │
└──────────────┴─────────────────┴──────────────────────────┘
Indexes: id (PK), charity_id, status, campaign_type, created_at, region
```

### donations
```sql
┌──────────────┬─────────────────┬──────────────────────────┐
│ Column       │ Type            │ Description              │
├──────────────┼─────────────────┼──────────────────────────┤
│ id           │ BIGINT          │ Primary key              │
│ campaign_id  │ BIGINT          │ FK to campaigns          │
│ donor_id     │ BIGINT          │ FK to users              │
│ charity_id   │ BIGINT          │ FK to charities          │
│ amount       │ DECIMAL(15,2)   │ Donation amount          │
│ status       │ VARCHAR(20)     │ completed/pending        │
│ created_at   │ TIMESTAMP       │ Donation date            │
│ updated_at   │ TIMESTAMP       │ Last update              │
└──────────────┴─────────────────┴──────────────────────────┘
Indexes: id (PK), campaign_id, donor_id, charity_id, status, created_at
```

### charities
```sql
┌──────────────────────┬─────────────────┬──────────────────────┐
│ Column               │ Type            │ Description          │
├──────────────────────┼─────────────────┼──────────────────────┤
│ id                   │ BIGINT          │ Primary key          │
│ owner_id             │ BIGINT          │ FK to users          │
│ name                 │ VARCHAR(255)    │ Charity name         │
│ verification_status  │ VARCHAR(20)     │ approved/pending     │
│ mission              │ TEXT            │ Mission statement    │
│ created_at           │ TIMESTAMP       │ Registration date    │
│ updated_at           │ TIMESTAMP       │ Last update          │
└──────────────────────┴─────────────────┴──────────────────────┘
Indexes: id (PK), owner_id, verification_status
```

---

## 🧩 Component Hierarchy (Frontend)

```
App.tsx
  └── DonorLayout
       └── Route: /donor/campaign-analytics
            └── DonorAnalyticsPage
                 ├── MetricCards
                 │    ├── Card (Total Campaigns)
                 │    ├── Card (Total Donations)
                 │    ├── Card (Average Donation)
                 │    └── Card (Active Campaigns)
                 │
                 ├── Tabs
                 │    ├── TabsList
                 │    │    ├── TabsTrigger (Overview)
                 │    │    ├── TabsTrigger (Distribution)
                 │    │    ├── TabsTrigger (Trends)
                 │    │    └── TabsTrigger (Insights)
                 │    │
                 │    ├── TabsContent (Overview)
                 │    │    ├── Card → PieChart (Campaign Types)
                 │    │    ├── Card → BarChart (Trending)
                 │    │    └── Card → List (Top Charities)
                 │    │
                 │    ├── TabsContent (Distribution)
                 │    │    ├── Card → Table (Locations)
                 │    │    └── Card → BarChart (Beneficiaries)
                 │    │
                 │    ├── TabsContent (Trends)
                 │    │    ├── Card → LineChart (Donations)
                 │    │    └── Card → BarChart (Frequency)
                 │    │
                 │    └── TabsContent (Insights)
                 │         └── Card → Text (Auto-insights)
                 │
                 └── FiltersPanel (Sticky Sidebar)
                      ├── Date Presets
                      ├── Date Pickers (From/To)
                      ├── Campaign Type Checkboxes
                      ├── Granularity Select
                      └── Apply/Reset Buttons
```

---

## 🔐 Security Architecture

```
┌──────────────────────────────────────────────────────────┐
│  Request: GET /donor-analytics/summary                   │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
         ┌─────────────────────────┐
         │  Middleware Chain       │
         │  ──────────────────     │
         │  1. CORS                │  ← Allow frontend origin
         │  2. auth:sanctum        │  ← Verify Bearer token
         │  3. Rate Limiting       │  ← 60 requests/min
         └──────────┬──────────────┘
                    │
                    ▼
         ┌─────────────────────────┐
         │  Controller Logic       │
         │  ──────────────────     │
         │  • Validate inputs      │
         │  • Check permissions    │
         │  • Execute queries      │
         │  • Return response      │
         └─────────────────────────┘
```

### Security Layers

1. **Authentication**: Laravel Sanctum token validation
2. **Authorization**: Owner-only checks for personal data
3. **Input Validation**: All filters validated and sanitized
4. **SQL Injection**: Prevented by Eloquent ORM parameter binding
5. **XSS Protection**: React automatically escapes output
6. **CSRF Protection**: Sanctum provides CSRF tokens
7. **Rate Limiting**: 60 requests per minute per user
8. **Privacy**: Only aggregated public data exposed

---

## 🚀 Performance Architecture

### Caching Strategy

```
Request → Check Cache → Cache Hit? → Return cached data (fast)
                             ↓
                            No
                             ↓
                     Execute DB Queries
                             ↓
                     Aggregate Results
                             ↓
                     Store in Cache (TTL)
                             ↓
                     Return Fresh Data
```

### Cache Keys
```
donor_analytics_summary_{md5(filters)}
donor_analytics_query_{md5(filters)}
donor_analytics_campaign_{id}
donor_analytics_donor_{id}_overview
```

### Query Optimization

1. **Indexes**: All JOIN and WHERE columns indexed
2. **Aggregation**: SUM, COUNT, AVG at database level
3. **Eager Loading**: `with(['charity'])` to prevent N+1
4. **Pagination**: LIMIT results to 10-20
5. **Select Specific**: Only columns needed, not `SELECT *`

### Frontend Performance

1. **Code Splitting**: Lazy load analytics page
2. **Memoization**: useMemo for expensive calculations
3. **Debouncing**: Filter changes debounced 300ms
4. **Lazy Charts**: Charts only render when tab active
5. **Skeleton Loading**: Show placeholders during fetch

---

## 📊 Analytics Query Examples

### 1. Campaign Type Distribution
```sql
SELECT 
    campaign_type,
    COUNT(*) as count
FROM campaigns
WHERE status != 'archived'
  AND created_at >= '2025-01-01'
  AND created_at <= '2025-11-01'
GROUP BY campaign_type
ORDER BY count DESC;
```

### 2. Top Trending Campaigns
```sql
SELECT 
    c.id,
    c.title,
    c.campaign_type,
    COUNT(d.id) as donation_count,
    SUM(CASE WHEN d.status = 'completed' THEN d.amount ELSE 0 END) as total_amount
FROM campaigns c
LEFT JOIN donations d ON c.id = d.campaign_id
WHERE c.status = 'published'
  AND d.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY c.id, c.title, c.campaign_type
HAVING donation_count > 0
ORDER BY donation_count DESC, total_amount DESC
LIMIT 10;
```

### 3. Donations Time Series (Monthly)
```sql
SELECT 
    DATE_FORMAT(created_at, '%Y-%m') as period,
    COUNT(*) as count,
    SUM(amount) as total,
    AVG(amount) as average
FROM donations
WHERE status = 'completed'
  AND created_at >= '2025-01-01'
  AND created_at <= '2025-11-01'
GROUP BY period
ORDER BY period;
```

---

## 🧪 Testing Architecture

```
┌────────────────────────────────────────────────────────────┐
│  DonorAnalyticsTest.php (PHPUnit)                          │
│  ─────────────────────────────────────                     │
│                                                             │
│  Setup:                                                     │
│  • Create test donor, charity, campaign                    │
│  • Seed sample donations                                   │
│                                                             │
│  Tests (8):                                                 │
│  1. test_can_fetch_analytics_summary                       │
│  2. test_can_query_analytics_with_filters                  │
│  3. test_can_fetch_campaign_details                        │
│  4. test_can_fetch_donor_overview_for_own_data            │
│  5. test_cannot_fetch_other_donor_overview                │
│  6. test_analytics_filters_by_date_range                   │
│  7. test_analytics_caching_works                           │
│  8. test_response_structure_matches_spec                   │
│                                                             │
│  Assertions:                                                │
│  • HTTP status codes (200, 403)                            │
│  • JSON structure                                          │
│  • Data accuracy                                           │
│  • Authorization logic                                     │
└────────────────────────────────────────────────────────────┘
```

---

## 📦 Deployment Architecture

### Development
```
Frontend: npm run dev → localhost:5173
Backend:  php artisan serve → localhost:8000
Database: MySQL → localhost:3306
Cache:    File/Redis → localhost:6379
```

### Production (Recommended)
```
Frontend: 
  • Build: npm run build
  • Serve: Nginx/Apache + static files
  • CDN: CloudFlare for assets

Backend:
  • Web Server: Nginx + PHP-FPM
  • Queue: Laravel Queue (for async tasks)
  • Cache: Redis cluster
  • Session: Redis

Database:
  • MySQL 8.0+ with read replicas
  • Indexes optimized
  • Query cache enabled

Monitoring:
  • APM: New Relic / Datadog
  • Logs: ELK Stack / CloudWatch
  • Uptime: Pingdom / UptimeRobot
```

---

## 🔄 State Management Flow

```
Component State (React)
  ↓
  • filters (local state)
  • appliedFilters (triggers API)
  • summary (from hook)
  • data (from hook)
  • loading (boolean)
  • error (string | null)
  ↓
User Action (change filter)
  ↓
Update local 'filters' state
  ↓
User clicks "Apply"
  ↓
Set 'appliedFilters' = filters
  ↓
useEffect triggers (dependency: appliedFilters)
  ↓
Hooks re-fetch with new filters
  ↓
Update component state
  ↓
Re-render UI
```

---

## 🎯 Summary

### Architecture Principles
- ✅ **Separation of Concerns**: Clear layers (UI, Logic, Data)
- ✅ **Scalability**: Caching + optimized queries
- ✅ **Security**: Auth + validation at every layer
- ✅ **Performance**: <2s load time, <1s filter updates
- ✅ **Maintainability**: Modular, documented, tested
- ✅ **Accessibility**: ARIA labels, keyboard support

### Technology Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind, shadcn/ui, Recharts
- **Backend**: Laravel 10, PHP 8.1+, Eloquent ORM
- **Database**: MySQL 8.0+
- **Cache**: Laravel Cache (File) / Redis
- **Auth**: Laravel Sanctum (Token-based)
- **Testing**: PHPUnit, React Testing Library

---

**Last Updated**: November 1, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production-Ready
