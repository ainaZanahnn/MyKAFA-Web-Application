# TODO: Fix Quiz Status Update Error

## Issue
- PUT http://localhost:5173/api/admin/undefined/status 500 (Internal Server Error)
- The quiz ID was undefined when making the status update request

## Root Cause
- Some quiz objects in the frontend state had undefined `id` values
- The dropdown menu actions were calling status change functions with undefined IDs

## Changes Made
- [x] Filter out quizzes without IDs when fetching from API (manageQuiz.tsx)
- [x] Add conditional rendering for action buttons only when quiz.id exists (quiztable.tsx)
- [x] Use non-null assertion (!) for quiz.id when calling functions since we check existence first

## Testing
- [ ] Test quiz status changes (draf -> diterbitkan -> diarkibkan)
- [ ] Test quiz deletion
- [ ] Test quiz editing
- [ ] Verify no undefined IDs in quiz list

## Follow-up
- [ ] Check backend logs for any related errors
- [ ] Consider adding better error handling for missing quiz IDs
