# TODO List

## Fixed Login 500 Error
- [x] Identified issue in progressModel.ts where year_level queries used incorrect format
- [x] Fixed initializeProgress to use `Year ${registrationYear}` instead of `registrationYear.toString()`
- [x] Fixed calculateLessonCompletionPercentage to use `Year ${year}` instead of `year.toString()`
- [x] Rebuilt and restarted backend server
- [x] Backend running on port 5000, frontend on 5174 with proxy configured

## Next Steps
- [ ] Test login functionality to confirm fix
- [ ] If issues persist, check database for existing progress records with mismatched year formats
