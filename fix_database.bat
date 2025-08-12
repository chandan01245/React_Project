@echo off
echo ========================================
echo    Database Schema Fix Script
echo ========================================
echo.

echo This script will fix the missing pinned_panels column in your database.
echo.

REM Check if Docker is running
echo Checking if Docker is running...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo Docker is running. Continuing...
echo.

REM Get the container name for the database
echo Finding database container...
for /f "tokens=*" %%i in ('docker ps --filter "ancestor=postgres:17" --format "{{.Names}}"') do set DB_CONTAINER=%%i

if "%DB_CONTAINER%"=="" (
    echo ERROR: Could not find PostgreSQL container!
    echo Make sure your containers are running with: docker-compose up -d
    pause
    exit /b 1
)

echo Found database container: %DB_CONTAINER%
echo.

REM Check if dashboard table exists
echo Checking if dashboard table exists...
docker exec %DB_CONTAINER% psql -U postgres -d kero -c "\dt" | findstr dashboard >nul
if %errorlevel% neq 0 (
    echo ERROR: Dashboard table does not exist!
    echo Please make sure your backend has started at least once.
    pause
    exit /b 1
)

echo Dashboard table exists. Continuing...
echo.

REM Check if pinned_panels column exists
echo Checking if pinned_panels column exists...
docker exec %DB_CONTAINER% psql -U postgres -d kero -c "\d dashboard" | findstr pinned_panels >nul
if %errorlevel% equ 0 (
    echo pinned_panels column already exists!
    echo No fix needed.
    goto :show_structure
)

echo pinned_panels column is missing. Adding it now...
echo.

REM Add the missing column
echo Adding pinned_panels column...
docker exec %DB_CONTAINER% psql -U postgres -d kero -c "ALTER TABLE dashboard ADD COLUMN pinned_panels TEXT;"

if %errorlevel% neq 0 (
    echo ERROR: Failed to add pinned_panels column!
    pause
    exit /b 1
)

echo Successfully added pinned_panels column!
echo.

:show_structure
REM Show the final table structure
echo ========================================
echo    Final Dashboard Table Structure
echo ========================================
docker exec %DB_CONTAINER% psql -U postgres -d kero -c "\d dashboard"

echo.
echo ========================================
echo           Fix Complete!
echo ========================================
echo.
echo The database is now ready for pinned panels functionality!
echo.
echo You can now:
echo 1. Restart your backend container
echo 2. Test the pinned panels feature
echo 3. Run the test scripts to verify everything works
echo.

pause
