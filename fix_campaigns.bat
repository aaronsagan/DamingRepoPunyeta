@echo off
echo ======================================
echo Fixing Campaigns Page Issues
echo ======================================

echo.
echo [1/4] Clearing backend caches...
cd capstone_backend
call php artisan cache:clear
call php artisan route:clear
call php artisan config:clear

echo.
echo [2/4] Verifying routes...
call php artisan route:list --path=campaigns/filter

echo.
echo [3/4] Checking files...
cd ..\capstone_frontend
if exist "src\pages\donor\BrowseCampaigns.tsx" (
    echo [OK] BrowseCampaigns.tsx exists
) else (
    echo [ERROR] BrowseCampaigns.tsx missing!
)

if exist "src\pages\donor\BrowseCampaignsFiltered.tsx" (
    echo [WARNING] Deleting old BrowseCampaignsFiltered.tsx...
    del "src\pages\donor\BrowseCampaignsFiltered.tsx"
    echo [OK] Old file deleted
) else (
    echo [OK] Old file already deleted
)

echo.
echo ======================================
echo All fixes applied!
echo ======================================
echo.
echo Next steps:
echo 1. Open 2 terminals
echo 2. Terminal 1: cd capstone_backend ^&^& php artisan serve
echo 3. Terminal 2: cd capstone_frontend ^&^& npm run dev
echo 4. In browser: Hard refresh (Ctrl+Shift+R)
echo 5. Login and click Campaigns in navbar
echo.
echo Done!
pause
