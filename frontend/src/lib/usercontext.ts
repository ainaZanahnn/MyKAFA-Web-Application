/** @format */

// User data from authentication system
export interface UserProfile {
  id: string;
  name: string;
  currentYear: number; // The year level the student is currently on (based on progress)
  registrationYear?: number; // The year the student registered
  progress?: any[]; // Student progress data
}

// Get current user from AuthProvider context
export const getCurrentUser = (): UserProfile | null => {
  // This will be replaced by AuthProvider context
  // For now, return null to indicate data should come from AuthProvider
  return null;
};

// Legacy function - kept for compatibility but should not be used
export const setUserYear = (year: number): void => {
  console.warn(
    "setUserYear is deprecated. Progress is now managed by the backend."
  );
};

// User data from authentication system
export interface UserProfile {
  id: string;
  name: string;
  currentYear: number; // The year level the student is currently on (based on progress)
  registrationYear?: number; // The year the student registered
  progress?: any[]; // Student progress data
}

// Get current user from AuthProvider context
export const getCurrentUser = (): UserProfile | null => {
  // This will be replaced by AuthProvider context
  // For now, return null to indicate data should come from AuthProvider
  return null;
};

// Legacy function - kept for compatibility but should not be used
export const setUserYear = (year: number): void => {
  console.warn(
    "setUserYear is deprecated. Progress is now managed by the backend."
  );
};
