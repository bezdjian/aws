import React, { useEffect, useState, useCallback } from "react";
import { verifyToken } from "../backend/service";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { createUserProfile } from "../model/UserProfile";
import { useUser } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";

declare global {
  interface Window {
    google: any;
  }
}

interface CredentialResponse {
  credential: string;
}

const Login: React.FC = () => {
  const { handleLoginSuccess, clientId } = useUser();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const { showToast } = useToast();

  const finishLogin = useCallback(
    (user: any) => {
      localStorage.setItem("googleCredentials", JSON.stringify(user));
      const userProfile = createUserProfile(user);
      handleLoginSuccess(userProfile);
      navigate("/home", { replace: true });
    },
    [navigate, handleLoginSuccess]
  );

  const handleCredentialResponse = useCallback(
    (response: CredentialResponse) => {
      verifyToken(response.credential)
        .then((user) => {
          finishLogin(user);
        })
        .catch((error) => {
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
          theme: isDark ? "filled_black" : "outline",
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
  }, [clientId, scriptLoaded, handleCredentialResponse, isDark]);

  return (
    <div className="relative flex flex-col items-center justify-center p-8 space-y-6 overflow-hidden group transition-colors duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-white dark:from-slate-900 dark:to-slate-950 opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
      <div className="relative">
        <div className="w-full max-w-sm bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 transition-colors">
          <div className="space-y-6 relative z-10">
            <div className="text-center">
              <h2 className="text-brand-600 dark:text-brand-400 text-3xl font-black mb-2 tracking-tight">
                Welcome
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                Sign in with your organisation's Google account
              </p>
            </div>

            <div className="flex justify-center">
              <div
                id="googleButton"
                className="rounded-full overflow-hidden bg-transparent"
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative text-xs font-bold text-slate-400 dark:text-slate-600 text-center max-w-[240px] leading-relaxed uppercase tracking-widest transition-colors">
        By signing in, you agree to our Terms of Service and Privacy Policy
      </div>
    </div>
  );
};

export default Login;
