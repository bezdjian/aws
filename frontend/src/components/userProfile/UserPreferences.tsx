import React from "react";
import {
  Palette,
  Sun,
  Moon,
  AlertCircle,
  Database,
  Download,
  CheckCircle2,
  Trash2Icon,
} from "lucide-react";

interface UserPreferencesProps {
  theme: string;
  calculations_count: number;
  toggleTheme: () => void;
  handleExportCSV: () => void;
  handleDeleteHistory: () => void;
}

const UserPreferences: React.FC<UserPreferencesProps> = ({
  theme,
  calculations_count,
  toggleTheme,
  handleExportCSV,
  handleDeleteHistory,
}) => {
  return (
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
                Theme preferences are synced with your browser's local storage
                for a consistent experience.
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

          <div className="items-center space-y-4">
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

            <button
              onClick={handleDeleteHistory}
              className="w-full flex items-center justify-between px-6 py-4 bg-red-900 dark:bg-red-900 text-white dark:text-white rounded-2xl font-black text-sm group hover:scale-[1.02] transition-all active:scale-95 shadow-lg shadow-slate-900/10"
            >
              <div className="flex items-center space-x-3">
                <Trash2Icon size={18} />
                <span>Delete History</span>
              </div>
              <span className="text-[10px] bg-white/10 dark:bg-slate-900/10 px-2 py-1 rounded-md uppercase">
                {calculations_count}
              </span>
            </button>
          </div>
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
          Your data is currently being replicated across multiple availability
          zones in the AWS Stockholm Region (eu-north-1) for maximum durability.
        </p>
      </div>
    </div>
  );
};

export default UserPreferences;
