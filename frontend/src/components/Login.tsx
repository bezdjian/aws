import React, { useEffect, useState, useCallback } from "react";
import { verifyToken, getClientId } from "../backend/service";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { createUserProfile } from "../model/UserProfile";
import { useUser } from "../context/UserContext";

declare global {
  interface Window {
    google: any;
  }
}

interface CredentialResponse {
  credential: string;
}

const Login: React.FC = () => {
  const [clientId, setClientId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { handleLoginSuccess } = useUser();
  const { showToast } = useToast();

  const finishLogin = useCallback(
    (user: any) => {
      localStorage.setItem("googleCredentials", JSON.stringify(user));
      const userProfile = createUserProfile(user);
      handleLoginSuccess(userProfile);
      console.log("User logged in: ", userProfile.getName());
      navigate("/home", { replace: true });
    },
    [navigate] // dependencies
  );

  useEffect(() => {
    getClientId()
      .then((id) => {
        console.log("Client ID: " + id);
        setClientId(id);
        localStorage.setItem("googleClientId", id);
      })
      .catch((e) => {
        console.log("Error fetching client ID: " + e.message);
        showToast("Error fetching client ID: " + e.message, "error");
      });
  }, [showToast]);

  const handleCredentialResponse = useCallback(
    (response: CredentialResponse) => {
      verifyToken(response.credential)
        .then((user) => {
          console.log("verify_token: User: ", user);
          finishLogin(user);
        })
        .catch((error) => {
          console.log("verify_token: Error: ", error);
          showToast("Error verifying token: " + error.message, "error");
        });
    },
    [finishLogin, showToast] // dependencies
  );

  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    let timeoutId: number;
    const checkGoogle = () => {
      if (window.google?.accounts?.id) {
        setScriptLoaded(true);
      } else {
        timeoutId = window.setTimeout(checkGoogle, 100);
      }
    };
    checkGoogle();
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!clientId || !scriptLoaded) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
      });

      const buttonDiv = document.getElementById("googleButton");
      if (buttonDiv) {
        window.google.accounts.id.renderButton(buttonDiv, {
          theme: "outline",
          size: "large",
          shape: "pill",
          type: "standard",
          text: "continue_with",
          logo_alignment: "left",
        });
      }
    } catch (error) {
      console.error("Error initializing Google Sign-In:", error);
    }
  }, [clientId, scriptLoaded, handleCredentialResponse]);

  return (
    <div className="relative flex flex-col items-center justify-center p-8 space-y-6 overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-50 dark:from-dark-200 dark:to-dark-100 opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
      <div className="relative">
        <div className="w-full max-w-md bg-white dark:bg-dark-200 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
          <div className="space-y-6 relative z-10">
            <div className="text-center mb-8">
              <h2 className="text-brand-600 text-2xl font-bold mb-2">
                Welcome
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Sign in with your organisation's Google account
              </p>
            </div>

            <div id="googleButton" className="flex justify-center"></div>
          </div>
        </div>
      </div>
      <div className="relative text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
        By signing in, you agree to our Terms of Service and Privacy Policy
      </div>
    </div>
  );
};

export default Login;
