#!/bin/bash
# startup-summary.sh - Quick project status summary

echo "=== CHOIR MUSIC SEARCH PROJECT STATUS ==="
echo ""

# Check if conversation log exists
if [ -f "CONVERSATION_LOG.md" ]; then
    echo "📋 LAST SESSION SUMMARY:"
    echo "----------------------------"
    # Extract the last conversation and active session notes
    grep -A 10 "## Active Session Notes" CONVERSATION_LOG.md | head -15
    echo ""
fi

# Check if project status exists
if [ -f "PROJECT_STATUS.md" ]; then
    echo "📊 CURRENT PROJECT STATUS:"
    echo "----------------------------"
    # Extract current status section
    grep -A 20 "### 🔄 In Progress" PROJECT_STATUS.md | head -10
    echo ""
    echo "📝 NEXT STEPS:"
    echo "----------------------------"
    # Extract next steps
    grep -A 10 "### Next Steps" PROJECT_STATUS.md | head -10
fi

echo ""
echo "💡 TO GET AI ASSISTANT UP TO SPEED:"
echo "1. Open CONVERSATION_LOG.md"
echo "2. Open PROJECT_STATUS.md" 
echo "3. Tell the AI: 'Please read CONVERSATION_LOG.md and PROJECT_STATUS.md to get up to speed'"
echo ""
echo "=== END SUMMARY ==="


