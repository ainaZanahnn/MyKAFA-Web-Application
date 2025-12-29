# Replace Dummy Data with Real Database Data

## Backend Changes
- [ ] Update `backend/src/controllers/quizController.ts` - Replace dummy data in `getQuizzes` with SQL query to fetch from `quizzes` table

## Frontend Changes
- [ ] Update `frontend/src/pages/admin/manageQuiz.tsx` - Remove `dummyQuizzes` array and add API fetch in useEffect

## Testing
- [ ] Test backend API endpoint returns real data
- [ ] Test frontend fetches and displays real data
- [ ] Verify database connection and table data
