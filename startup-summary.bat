@echo off
REM startup-summary.bat - Quick project status summary for Windows

echo === CHOIR MUSIC SEARCH PROJECT STATUS ===
echo.

REM Check if conversation log exists
if exist "CONVERSATION_LOG.md" (
    echo 📋 LAST SESSION SUMMARY:
    echo ----------------------------
    findstr /C:"## Active Session Notes" /A:10 CONVERSATION_LOG.md
    echo.
)

REM Check if project status exists  
if exist "PROJECT_STATUS.md" (
    echo 📊 CURRENT PROJECT STATUS:
    echo ----------------------------
    findstr /C:"### 🔄 In Progress" /A:10 PROJECT_STATUS.md
    echo.
    echo 📝 NEXT STEPS:
    echo ----------------------------
    findstr /C:"### Next Steps" /A:10 PROJECT_STATUS.md
)

echo.
echo 💡 TO GET AI ASSISTANT UP TO SPEED:
echo 1. Open CONVERSATION_LOG.md
echo 2. Open PROJECT_STATUS.md
echo 3. Tell the AI: "Please read CONVERSATION_LOG.md and PROJECT_STATUS.md to get up to speed"
echo.
echo === END SUMMARY ===
pause


