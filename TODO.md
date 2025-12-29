# TODO: Restore UPKK Style on Student Site

## Pending Tasks
- [ ] Update upkkPastYear.tsx to use card-based grid instead of table
- [ ] Replace PaperFilters with inline filter section (search bar and selects)
- [ ] Implement card grid with "Lihat" and "Muat Turun" buttons
- [ ] Keep API integration and PaperModal functionality
- [ ] Test changes to ensure everything works properly

## Completed Tasks
- [x] Fix admin session timeout issue - Added axios response interceptor to handle 401 errors and automatically log out users when token expires
- [x] Implement token validation on app load - Added automatic token validation and user restoration on app startup
- [x] Implement token refresh mechanism - Added refresh token functionality with backend support
- [x] Add loading states - Added isLoading state to AuthProvider for better UX during authentication operations
