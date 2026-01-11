import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { LoggedInUserProfile, createUserProfile } from "../model/UserProfile";
import {
  deleteUserToken,
  getClientId,
  getUserSettings,
} from "../backend/service";
import { UserSettings } from "../types";

interface UserContextType {
  user: LoggedInUserProfile | null;
  userSettings: UserSettings | null;
  handleLoginSuccess: (profile: LoggedInUserProfile) => void;
  handleSignOut: () => void;
  isLoading: boolean;
  clientId: string | null;
  refreshUserSettings: () => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<LoggedInUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [clientId, setClientId] = useState<string | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  // Fetch client ID on mount
  useEffect(() => {
    getClientId()
      .then((id) => setClientId(id))
      .catch((err) =>
        console.error("Failed to fetch client ID in Provider:", err)
      );
  }, []);

  // Initialize Google Accounts ID if GSI is ready and clientId is available
  useEffect(() => {
    if (clientId && window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: () => {}, // Handled in Login component for sign-in
      });
    }
  }, [clientId]);

  const refreshUserSettings = async () => {
    if (user) {
      try {
        const response = await getUserSettings(user.getEmail());
        setUserSettings(response.data);
      } catch (err) {
        console.error("Failed to refresh user settings:", err);
      }
    }
  };

  // Initialize user settings on mount
  useEffect(() => {
    refreshUserSettings();
  }, [user]);

  // Initialize user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("googleCredentials");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        const userProfile = createUserProfile({
          fullname: userData.name,
          email: userData.email,
          pictureUrl: userData.pictureUrl || "",
          googleId: userData.googleId || "",
          userId: userData.userId || "",
        });
        setUser(userProfile);
      } catch (e) {
        console.error("Error parsing stored user:", e);
      }
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = (profile: LoggedInUserProfile) => {
    setUser(profile);
    setIsLoading(false);
    // Store user info in localStorage
    const userData = {
      name: profile.getName(),
      email: profile.getEmail(),
      pictureUrl: profile.getImageUrl(),
      googleId: profile.getGoogleId(),
      userId: profile.getUserId(),
    };
    localStorage.setItem("googleCredentials", JSON.stringify(userData));
  };

  const handleSignOut = () => {
    const performLocalSignOut = () => {
      // Clear cached data from localStorage except for the selected theme
      const theme = localStorage.getItem("theme");
      localStorage.clear();
      if (theme) localStorage.setItem("theme", theme);

      // Clear sessionStorage to remove cached OAuth tokens
      sessionStorage.clear();
      if (user) {
        deleteUserToken(user.getUserId());
      }
      setUser(null);
    };

    if (window.google?.accounts?.id && user && clientId) {
      try {
        const email = user.getEmail();
        performLocalSignOut();

        // Disable auto-select to prevent the browser from automatically
        // signing the user back in during the next visit.
        window.google.accounts.id.disableAutoSelect();

        // Revoke the OAuth2 grant. Note: This may return false if no persistent
        // grant exists, which is normal for simple ID token sign-ins.
        window.google.accounts.id.revoke(email, (done: any) => {
          if (!done.successful) {
            console.warn(
              "Google session revocation skipped or failed:",
              done.error || "No active grant to revoke"
            );
          } else {
            console.log("Google session revoked successfully");
          }
        });
      } catch (e) {
        console.error("Error during Google revoke:", e);
        performLocalSignOut();
      }
    } else {
      performLocalSignOut();
    }
  };

  // Create the context value
  const contextValue: UserContextType = {
    user,
    handleLoginSuccess,
    handleSignOut,
    isLoading,
    clientId,
    userSettings,
    refreshUserSettings,
  };

  // Provide the context value to children
  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

// Custom hook to use the user context
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
};

export default UserProvider;
