# URL Migration Tasks

## Completed
- [x] Create TODO.md file
- [x] Update vite.config.ts: Add proxy configuration for /api requests
- [x] Update axios.ts: Remove hardcoded base URL
- [x] Update API calls in pages: Change hardcoded URLs to relative /api
- [x] Update profile picture URLs: Change to relative paths
- [x] Update file viewing URLs: Change to relative paths
- [x] Fix AuthProvider hardcoded URL in register function
- [x] Fix all remaining hardcoded URLs in components and pages

## Completed
- [x] Test UI renders correctly - Frontend now running on http://localhost:5174/

## Files to Update
- vite.config.ts
- src/lib/axios.ts
- src/pages/student/upkkPastYear.tsx
- src/pages/student/profile.tsx
- src/pages/student/announcement.tsx
- src/pages/guardian/profile.tsx
- src/pages/guardian/dashboard.tsx
- src/pages/admin/user.tsx
- src/pages/admin/upkk.tsx
- src/pages/admin/aktivities.tsx
- src/components/upkk/PaperModal.tsx
- src/components/auth/AuthProvider.tsx

## Testing
- [ ] Test API calls work correctly
- [ ] Test profile pictures load
- [ ] Test file downloads work
- [ ] Test UI renders correctly
