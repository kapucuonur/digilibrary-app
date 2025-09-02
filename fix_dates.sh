#!/bin/bash

# Fix dates to 2025 (September-October)
git filter-branch -f --env-filter '
if [ "$GIT_COMMIT" != "" ]; then
    # Change year from 2024 to 2025
    export GIT_AUTHOR_DATE="${GIT_AUTHOR_DATE/2024/2025}"
    export GIT_COMMITTER_DATE="${GIT_COMMITTER_DATE/2024/2025}"
    
    # Change April to September
    export GIT_AUTHOR_DATE="${GIT_AUTHOR_DATE/Apr/Sep}"
    export GIT_COMMITTER_DATE="${GIT_COMMITTER_DATE/Apr/Sep}"
fi
' -- --all

# Check if GITHUB_TOKEN is set
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Error: GITHUB_TOKEN environment variable is not set."
    echo "Usage: GITHUB_TOKEN=your_token ./fix_dates.sh"
    exit 1
fi

git push -f "https://$GITHUB_TOKEN@github.com/kapucuonur/digilibrary-app.git" main

echo "✅ Fixed all dates to 2025!"
