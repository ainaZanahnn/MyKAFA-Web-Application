# TODO: Fix Topic Completion Logic

## Problem
When a student completes all materials in a topic, the interface shows it as completed (green with checkmark, button says "Semak Semula"). However, if an admin adds new material to that topic, the button doesn't change back to "Mula Belajar" because the topic should be incomplete again since there's new material the student hasn't viewed yet.

## Solution Implemented
- Changed the completion logic in `studentlessontable.tsx` to determine completion based on whether all materials have been viewed (`materialProgress.viewed === materialProgress.total`)
- This ensures that topics automatically show as incomplete when new materials are added, since the student hasn't viewed the new materials yet
- Materials that were already viewed remain viewed (not reset to original state)

## Changes Made
- [x] Updated lesson completion logic in main lesson cards
- [x] Updated lesson completion logic in quiz section
- [x] Ensured viewed materials are preserved when new materials are added

## Testing
- Verify that completed topics show "Semak Semula" button
- Verify that when admin adds new material, topic shows "Mula Belajar" button again
- Verify that previously viewed materials remain viewed
- Verify that quiz access is properly controlled based on material completion
