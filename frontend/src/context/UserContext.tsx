import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { LoggedInUserProfile, createUserProfile } from "../model/UserProfile";
import { deleteUserToken } from "../backend/service";

interface UserContextType {
  user: LoggedInUserProfile | null;
  handleLoginSuccess: (profile: LoggedInUserProfile) => void;
  handleSignOut: () => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | null>(null);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<LoggedInUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    if (window.google?.accounts?.id && user) {
      window.google.accounts.id.revoke(user.getEmail(), () => {
        // Clear cached data from localStorage except for the selected theme
        for (const key in localStorage) {
          if (key !== "theme") {
            localStorage.removeItem(key);
          }
        }
        // Clear sessionStorage to remove cached OAuth tokens
        sessionStorage.clear();
        setUser(null);
        deleteUserToken(user.getUserId());
      });
    } else {
      // Clear cached data from localStorage except for the selected theme
      for (const key in localStorage) {
        if (key !== "theme") {
          localStorage.removeItem(key);
        }
      }
      // Clear sessionStorage to remove cached OAuth tokens
      sessionStorage.clear();
      setUser(null);
    }
  };

  // Create the context value
  const contextValue: UserContextType = {
    user,
    handleLoginSuccess,
    handleSignOut,
    isLoading,
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
