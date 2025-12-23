export interface UserProfile {
  fullname: string;
  email: string;
  pictureUrl: string;
  googleId: string;
  userId?: string;
}

export interface LoggedInUserProfile {
  getName: () => string;
  getEmail: () => string;
  getImageUrl: () => string;
  getGoogleId: () => string;
  getUserId: () => string;
}

// Helper function to create a user profile object with getter functions
export const createUserProfile = (data: UserProfile) => ({
  getName: () => data.fullname,
  getEmail: () => data.email,
  getImageUrl: () => data.pictureUrl,
  getGoogleId: () => data.googleId,
  getUserId: () => data.userId ?? "",
});
