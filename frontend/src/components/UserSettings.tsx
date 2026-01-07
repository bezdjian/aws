import React, { useEffect, useState, useMemo } from "react";
import { TrendingUp, Loader2, Clock } from "lucide-react";
import { useUser } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";
import {
  getUserSettings,
  updateUserSettings,
  getCalculationsByEmail,
} from "../backend/service";
import { SalaryCalculation, UserSettings } from "../types";
import Header from "./Header";
import { municipalities, Municipality } from "../backend/municipalities";
import { exportHistory } from "../utils/ExportUtils";
import UserSettingsForm from "./userProfile/UserSettingsForm";
import UserPreferences from "./userProfile/UserPreferences";

const UserProfileView: React.FC = () => {
  const { user, isLoading: isAuthLoading, refreshUserSettings } = useUser();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [calculations, setCalculations] = useState<SalaryCalculation[]>([]);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [municipalityQuery, setMunicipalityQuery] = useState("");
  const [municipalityCode, setMunicipalityCode] = useState("");
  const [showMunicipalityList, setShowMunicipalityList] = useState(false);
  const [allMunicipalities, setAllMunicipalities] = useState<Municipality[]>(
    []
  );

  useEffect(() => {
    if (!isAuthLoading && !user) {
      navigate("/", { replace: true });
    } else if (user) {
      fetchData();
    }
  }, [user, isAuthLoading, navigate]);

  const fetchData = async () => {
    try {
      setIsProfileLoading(true);
      const email = user?.getEmail() || "";
      const [settingsRes, calculationsRes, municipalitiesRes] =
        await Promise.all([
          getUserSettings(email),
          getCalculationsByEmail(email),
          municipalities(),
        ]);

      setSettings(settingsRes.data);
      setCalculations(calculationsRes.data);
      setMunicipalityQuery(settingsRes.data.municipality || "");
      setAllMunicipalities(municipalitiesRes);
      setMunicipalityCode(settingsRes.data.municipality_code || "");
    } catch (error) {
      console.error("Error fetching profile data:", error);
      showToast("Failed to load profile data", "error");
    } finally {
      setIsProfileLoading(false);
    }
  };

  const filteredMunicipalities = useMemo(() => {
    if (!municipalityQuery) return [];
    return allMunicipalities
      .filter((m) =>
        m.namn.toLowerCase().includes(municipalityQuery.toLowerCase())
      )
      .slice(0, 5);
  }, [municipalityQuery, allMunicipalities]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      setIsSaving(true);
      await updateUserSettings({
        ...settings,
        municipality: municipalityQuery,
        municipality_code: String(municipalityCode),
      });
      await refreshUserSettings();
      showToast("Settings updated successfully", "success");
    } catch (error) {
      showToast("Failed to update settings", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCSV = () => {
    if (calculations.length === 0) {
      showToast("No data to export", "error");
      return;
    }

    exportHistory(calculations);
    showToast("Exporting History as CSV...", "success");
  };

  if (isAuthLoading || isProfileLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center transition-colors">
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
          {isAuthLoading ? "Authenticating..." : "Synchronizing settings..."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300 pb-20">
      <Header />
      <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-16 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-6"></div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/insights")}
              className="hidden lg:flex items-center space-x-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all border border-slate-100 cursor-pointer"
            >
              <TrendingUp size={16} />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => navigate("/history")}
              className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-slate-900 dark:bg-brand-600 text-white rounded-2xl font-black text-sm hover:bg-slate-800 dark:hover:bg-brand-500 transition-all shadow-lg shadow-slate-900/10 print:hidden cursor-pointer"
            >
              <Clock size={16} />
              <span>View History</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full px-6 py-12 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* CONFIGURATION COLUMN */}
          <div className="lg:col-span-2 space-y-8">
            <UserSettingsForm
              settings={settings}
              setSettings={setSettings}
              isSaving={isSaving}
              handleSaveSettings={handleSaveSettings}
              municipalityQuery={municipalityQuery}
              setMunicipalityQuery={setMunicipalityQuery}
              setMunicipalityCode={setMunicipalityCode}
              showMunicipalityList={showMunicipalityList}
              setShowMunicipalityList={setShowMunicipalityList}
              filteredMunicipalities={filteredMunicipalities}
            />
          </div>

          {/* PREFERENCES & UTILS */}
          <UserPreferences
            theme={theme}
            toggleTheme={toggleTheme}
            handleExportCSV={handleExportCSV}
          />
        </div>
      </main>
    </div>
  );
};

export default UserProfileView;
