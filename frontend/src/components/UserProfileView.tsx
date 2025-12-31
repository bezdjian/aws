import React, { useEffect, useState, useMemo } from "react";
import {
  Settings as SettingsIcon,
  TrendingUp,
  Download,
  Shield,
  Palette,
  LogOut,
  ChevronRight,
  Database,
  Building2,
  DollarSign,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sun,
  Moon,
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

    return {
      totalRevenue,
      totalBuffer,
      avgTakeHome: totalTakeHome / calculations.length,
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
              Avg. Take-home
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* CONFIGURATION COLUMN */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 md:p-10 shadow-sm transition-colors">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center text-brand-600 dark:text-brand-400">
                    <SettingsIcon size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                      Global Defaults
                    </h2>
                    <p className="text-sm font-medium text-slate-400">
                      Values for new simulations
                    </p>
                  </div>
                </div>
                <button
                  form="settings-form"
                  disabled={isSaving}
                  className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-slate-900/10 active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>

              <form
                id="settings-form"
                onSubmit={handleSaveSettings}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                    Default Hourly Rate (SEK)
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-500 transition-colors">
                      <DollarSign size={18} />
                    </div>
                    <input
                      type="number"
                      value={settings?.default_hourly_rate || 0}
                      onChange={(e) =>
                        setSettings((s) =>
                          s
                            ? {
                                ...s,
                                default_hourly_rate: Number(e.target.value),
                              }
                            : null
                        )
                      }
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-500/20 focus:bg-white dark:focus:bg-slate-800 rounded-2xl font-black text-slate-900 dark:text-white transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                    Monthly Buffer Target (SEK)
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-500 transition-colors">
                      <Shield size={18} />
                    </div>
                    <input
                      type="number"
                      value={settings?.default_buffer_amount || 0}
                      onChange={(e) =>
                        setSettings((s) =>
                          s
                            ? {
                                ...s,
                                default_buffer_amount: Number(e.target.value),
                              }
                            : null
                        )
                      }
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-500/20 focus:bg-white dark:focus:bg-slate-800 rounded-2xl font-black text-slate-900 dark:text-white transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2 relative md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                    Tax Municipality
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-500 transition-colors">
                      <Building2 size={18} />
                    </div>
                    <input
                      type="text"
                      placeholder="Search municipalities..."
                      value={municipalityQuery}
                      onFocus={() => setShowMunicipalityList(true)}
                      onBlur={() =>
                        setTimeout(() => setShowMunicipalityList(false), 200)
                      }
                      onChange={(e) => setMunicipalityQuery(e.target.value)}
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-500/20 focus:bg-white dark:focus:bg-slate-800 rounded-2xl font-black text-slate-900 dark:text-white transition-all outline-none"
                    />

                    {showMunicipalityList &&
                      filteredMunicipalities.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-2xl z-50 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                          {filteredMunicipalities.map((m) => (
                            <button
                              key={m.kod}
                              type="button"
                              onClick={() => {
                                setMunicipalityQuery(m.namn);
                                setMunicipalityCode(m.kod);
                                setShowMunicipalityList(false);
                              }}
                              className="w-full px-6 py-3 text-left font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-brand-600 transition-colors flex items-center justify-between group"
                            >
                              <span>{m.namn}</span>
                              <ChevronRight
                                size={14}
                                className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* PREFERENCES & UTILS */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm space-y-8 transition-colors">
              <div className="flex items-center space-x-3 text-slate-400 dark:text-slate-600">
                <Palette size={20} />
                <h3 className="text-xs font-black uppercase tracking-widest">
                  Preferences
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    {theme === "light" ? (
                      <Sun size={18} className="text-amber-500" />
                    ) : (
                      <Moon size={18} className="text-brand-400" />
                    )}
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Dark Mode
                    </span>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
                      theme === "dark" ? "bg-brand-600" : "bg-slate-300"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                        theme === "dark" ? "left-7" : "left-1"
                      }`}
                    ></div>
                  </button>
                </div>

                <div className="p-4 bg-brand-50 dark:bg-brand-900/20 rounded-2xl border border-brand-100 dark:border-brand-900/50">
                  <div className="flex items-start space-x-3">
                    <AlertCircle
                      size={18}
                      className="text-brand-600 shrink-0 mt-0.5"
                    />
                    <p className="text-xs font-medium text-brand-800 dark:text-brand-400 leading-relaxed">
                      Theme preferences are synced with your browser's local
                      storage for a consistent experience.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 dark:border-slate-800">
                <div className="flex items-center space-x-3 text-slate-400 dark:text-slate-600 mb-6">
                  <Database size={20} />
                  <h3 className="text-xs font-black uppercase tracking-widest">
                    Data Management
                  </h3>
                </div>

                <button
                  onClick={handleExportCSV}
                  className="w-full flex items-center justify-between px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm group hover:scale-[1.02] transition-all active:scale-95 shadow-lg shadow-slate-900/10"
                >
                  <div className="flex items-center space-x-3">
                    <Download size={18} />
                    <span>Export History</span>
                  </div>
                  <span className="text-[10px] bg-white/10 dark:bg-slate-900/10 px-2 py-1 rounded-md uppercase">
                    CSV
                  </span>
                </button>
              </div>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-[2rem] p-8 border border-emerald-100 dark:border-emerald-900/50">
              <div className="flex items-center space-x-3 text-emerald-600 dark:text-emerald-400 mb-4">
                <CheckCircle2 size={20} />
                <h3 className="text-sm font-black uppercase tracking-widest">
                  System Health
                </h3>
              </div>
              <p className="text-xs font-medium text-emerald-800 dark:text-emerald-400 leading-relaxed">
                Your data is currently being replicated across multiple
                availability zones in the AWS Stockholm Region (eu-north-1) for
                maximum durability.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfileView;
