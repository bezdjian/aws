import React, { useEffect, useState, useMemo } from "react";
import {
  TrendingUp,
  Shield,
  LogOut,
  Database,
  DollarSign,
  Briefcase,
  Loader2,
  Clock,
} from "lucide-react";
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
import CalculationUtils from "../utils/CalculationUtils";
import Header from "./Header";
import { municipalities, Municipality } from "../backend/municipalities";
import { exportHistory } from "../utils/ExportUtils";
import ResilienceDashboard from "./userProfile/ResilienceDashboard";
import UserSettingsForm from "./userProfile/UserSettingsForm";
import UserPreferences from "./userProfile/UserPreferences";
import VacationFundCard from "./userProfile/VacationFundCard";
import TaxOptimizationCard from "./userProfile/TaxOptimizationCard";

const UserProfileView: React.FC = () => {
  const {
    user,
    handleSignOut,
    isLoading: isAuthLoading,
    refreshUserSettings,
  } = useUser();
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

  const stats = useMemo(() => {
    if (calculations.length === 0)
      return {
        totalRevenue: 0,
        totalBuffer: 0,
        avgTakeHome: 0,
        count: 0,
      };

    const totalRevenue = calculations.reduce(
      (sum, c) => sum + (c.invoiced_amount || 0),
      0
    );
    const totalBuffer = calculations.reduce(
      (sum, c) => sum + (c.save_to_buffer || 0),
      0
    );
    const totalTakeHome = calculations.reduce(
      (sum, c) => sum + (c.remaining_for_gross_salary || 0),
      0
    );

    const totalPension = calculations.reduce(
      (sum, c) => sum + (c.pension_saving || 0),
      0
    );

    return {
      totalRevenue,
      totalBuffer,
      avgTakeHome: totalTakeHome / calculations.length,
      avgPension: totalPension / calculations.length,
      count: calculations.length,
    };
  }, [calculations]);

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
          {isAuthLoading ? "Authenticating..." : "Synchronizing profile..."}
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
        {/* PROFILE HEADER CARD */}
        <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-12 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-brand-500/10 transition-colors duration-700"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-10">
            <div className="relative">
              <img
                src={user?.getImageUrl()}
                alt={user?.getName()}
                className="w-32 h-32 rounded-3xl border-4 border-white dark:border-slate-800 shadow-2xl ring-1 ring-slate-100 dark:ring-slate-700 object-cover"
              />
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-xl shadow-lg border-4 border-white dark:border-slate-900">
                <Shield size={16} />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <div className="inline-flex items-center space-x-2 bg-brand-50 dark:bg-brand-900/30 px-3 py-1 rounded-full mb-3">
                  <span className="w-2 h-2 bg-brand-600 rounded-full animate-pulse"></span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-brand-700 dark:text-brand-400">
                    Verified Consultant
                  </span>
                </div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  {user?.getName()}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mt-1">
                  {user?.getEmail()}
                </p>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-6 py-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl font-black text-sm hover:bg-red-100 dark:hover:bg-red-900/20 transition-all active:scale-95"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
                <div className="flex items-center space-x-2 px-6 py-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-sm">
                  <Database size={16} />
                  <span>ID: {user?.getEmail().split("@")[0]}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ANALYTICS SNAPSHOT */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm group hover:border-brand-100 dark:hover:border-brand-900/50 transition-all duration-300">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
              <TrendingUp size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-2">
              Total Invoiced
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {CalculationUtils.formatCurrency(stats.totalRevenue)}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm group hover:border-brand-100 dark:hover:border-brand-900/50 transition-all duration-300">
            <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center text-brand-600 dark:text-brand-400 mb-6 group-hover:scale-110 transition-transform">
              <Shield size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-2">
              Buffer Saved
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {CalculationUtils.formatCurrency(stats.totalBuffer)}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm group hover:border-brand-100 dark:hover:border-brand-900/50 transition-all duration-300">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6 group-hover:scale-110 transition-transform">
              <DollarSign size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-2">
              Avg. Take-home (Gross)
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {CalculationUtils.formatCurrency(stats.avgTakeHome)}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm group hover:border-brand-100 dark:hover:border-brand-900/50 transition-all duration-300">
            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-400 mb-6 group-hover:scale-110 transition-transform">
              <Briefcase size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-2">
              Simulations
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {stats.count}
            </p>
          </div>
        </section>

        {/* STRATEGIC PLANNING */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ResilienceDashboard
            totalBuffer={stats.totalBuffer}
            desiredGrossSalary={settings?.desired_gross_salary || 50000}
            avgPension={stats.avgPension || 3000}
          />
          <VacationFundCard
            totalBuffer={stats.totalBuffer}
            desiredGrossSalary={settings?.desired_gross_salary || 50000}
            avgPension={stats.avgPension || 3000}
            targetVacationWeeks={settings?.target_vacation_weeks || 5}
            publicHolidays={settings?.public_holidays || 12}
          />
          <TaxOptimizationCard settings={settings} />
        </div>

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
