@echo off

echo.
echo === Pull Latest Updates from GitHub ===
echo.

cd /d "H:\My Drive\sites\AwtadPolicies.kholaidy.com\client"

IF NOT EXIST ".git" (
    echo Warning: Not a Git repository. Cloning...
    cd ..
    git clone https://github.com/kholaidy/AwtadPolicies-demo.git "AwtadPolicies.kholaidy.com"
    cd "AwtadPolicies.kholaidy.com"
    echo Successfully cloned repository.
) ELSE (
    echo Checking for updates...
    
    REM Check for local uncommitted changes
    git diff --quiet
    IF ERRORLEVEL 1 (
        echo.
        echo Warning: You have uncommitted local changes!
        echo.
        choice /C YN /M "Do you want to stash them before pulling? (Y=Yes, N=No - will be discarded)"
        
        IF ERRORLEVEL 2 (
            echo Discarding local changes...
            git reset --hard HEAD
            git clean -fd
        ) ELSE (
            echo Stashing local changes...
            git stash
        )
    )
    
    echo Pulling latest updates...
    git fetch origin
    git pull origin main
    
    IF ERRORLEVEL 1 (
        echo.
        echo Error: Failed to pull updates!
        echo Please resolve the issue manually.
    ) ELSE (
        echo.
        echo Successfully pulled latest updates!
        
        REM Check if there are stashed changes
        git stash list | findstr /C:"stash@" >nul
        IF NOT ERRORLEVEL 1 (
            echo.
            choice /C YN /M "Do you want to restore stashed changes? (Y=Yes, N=No)"
            IF NOT ERRORLEVEL 2 (
                git stash pop
                echo Stashed changes restored.
            )
        )
    )
)

echo.
pause