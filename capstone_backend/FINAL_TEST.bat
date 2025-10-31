@echo off
echo ========================================
echo FINAL COMPREHENSIVE TEST
echo ========================================
echo.
echo This will test ALL endpoints including the new ones.
echo.
pause

echo.
echo [1] Testing basic routing...
curl http://127.0.0.1:8000/api/ping
echo.
echo.

echo [2] Testing simple test route...
curl http://127.0.0.1:8000/api/test-campaigns-route
echo.
echo.

echo [3] Testing campaign filter options...
curl http://127.0.0.1:8000/api/campaigns/filter-options
echo.
echo.

echo [4] Testing campaign filter...
curl "http://127.0.0.1:8000/api/campaigns/filter?status=published&per_page=3"
echo.
echo.

echo ========================================
echo If all 4 tests return JSON (not HTML), it works!
echo ========================================
pause
