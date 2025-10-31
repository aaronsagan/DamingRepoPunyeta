# Complete Fix Script for Campaigns Page
Write-Host "🔧 Fixing Campaigns Page Issues..." -ForegroundColor Cyan

# Step 1: Clear backend caches
Write-Host "`n📦 Clearing backend caches..." -ForegroundColor Yellow
Set-Location capstone_backend
php artisan cache:clear
php artisan route:clear
php artisan config:clear
php artisan view:clear

# Step 2: Verify routes exist
Write-Host "`n✅ Verifying backend routes..." -ForegroundColor Yellow
php artisan route:list --path=campaigns/filter

# Step 3: Check frontend file structure
Write-Host "`n📂 Checking frontend files..." -ForegroundColor Yellow
Set-Location ..\capstone_frontend
if (Test-Path "src\pages\donor\BrowseCampaigns.tsx") {
    Write-Host "✅ BrowseCampaigns.tsx exists" -ForegroundColor Green
} else {
    Write-Host "❌ BrowseCampaigns.tsx missing!" -ForegroundColor Red
}

if (Test-Path "src\pages\donor\BrowseCampaignsFiltered.tsx") {
    Write-Host "⚠️  Old BrowseCampaignsFiltered.tsx still exists, deleting..." -ForegroundColor Yellow
    Remove-Item "src\pages\donor\BrowseCampaignsFiltered.tsx" -Force
    Write-Host "✅ Deleted old file" -ForegroundColor Green
} else {
    Write-Host "✅ Old file already deleted" -ForegroundColor Green
}

Write-Host "`n🎉 All fixes applied!" -ForegroundColor Green
Write-Host "`n📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Open 2 terminals"
Write-Host "2. Terminal 1: cd capstone_backend && php artisan serve"
Write-Host "3. Terminal 2: cd capstone_frontend && npm run dev"
Write-Host "4. In browser: Hard refresh (Ctrl+Shift+R)"
Write-Host "5. Login and click Campaigns in navbar"
Write-Host "`n✨ Done!" -ForegroundColor Green
