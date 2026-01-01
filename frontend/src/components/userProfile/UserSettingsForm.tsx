import React from "react";
import {
  Settings as SettingsIcon,
  DollarSign,
  Shield,
  HeartPulse,
  Building2,
  ChevronRight,
  Loader2,
  Calendar,
  Sun,
} from "lucide-react";
import { UserSettings } from "../../types";
import { Municipality } from "../../backend/municipalities";

interface UserSettingsFormProps {
  settings: UserSettings | null;
  setSettings: React.Dispatch<React.SetStateAction<UserSettings | null>>;
  isSaving: boolean;
  handleSaveSettings: (e: React.FormEvent) => Promise<void>;
  municipalityQuery: string;
  setMunicipalityQuery: React.Dispatch<React.SetStateAction<string>>;
  setMunicipalityCode: React.Dispatch<React.SetStateAction<string>>;
  showMunicipalityList: boolean;
  setShowMunicipalityList: React.Dispatch<React.SetStateAction<boolean>>;
  filteredMunicipalities: Municipality[];
}

const UserSettingsForm: React.FC<UserSettingsFormProps> = ({
  settings,
  setSettings,
  isSaving,
  handleSaveSettings,
  municipalityQuery,
  setMunicipalityQuery,
  setMunicipalityCode,
  showMunicipalityList,
  setShowMunicipalityList,
  filteredMunicipalities,
}) => {
  return (
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
                setSettings((s: any) =>
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
                setSettings((s: any) =>
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

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
            Desired Monthly Gross Salary (SEK)
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-500 transition-colors">
              <HeartPulse size={18} />
            </div>
            <input
              type="number"
              value={settings?.desired_gross_salary || 0}
              onChange={(e) =>
                setSettings((s: any) =>
                  s
                    ? {
                        ...s,
                        desired_gross_salary: Number(e.target.value),
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

            {showMunicipalityList && filteredMunicipalities.length > 0 && (
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

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
            Target Vacation (Weeks/Year)
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-500 transition-colors">
              <Calendar size={18} />
            </div>
            <input
              type="number"
              value={settings?.target_vacation_weeks || 0}
              onChange={(e) =>
                setSettings((s: any) =>
                  s
                    ? {
                        ...s,
                        target_vacation_weeks: Number(e.target.value),
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
            Public Holidays (Days/Year)
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-500 transition-colors">
              <Sun size={18} />
            </div>
            <input
              type="number"
              value={settings?.public_holidays || 0}
              onChange={(e) =>
                setSettings((s: any) =>
                  s
                    ? {
                        ...s,
                        public_holidays: Number(e.target.value),
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
            Birth Year
          </label>
          <label className="font-black uppercase tracking-widest text-slate-500 ml-1">
            <span className="text-[8px]">(for tax calculation)</span>
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-500 transition-colors">
              <Shield size={18} />
            </div>
            <input
              type="number"
              value={settings?.birth_year || 0}
              onChange={(e) =>
                setSettings((s) =>
                  s
                    ? {
                        ...s,
                        birth_year: Number(e.target.value),
                      }
                    : null
                )
              }
              className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-500/20 focus:bg-white dark:focus:bg-slate-800 rounded-2xl font-black text-slate-900 dark:text-white transition-all outline-none"
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserSettingsForm;
