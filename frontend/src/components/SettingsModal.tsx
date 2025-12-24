import React, { useState, useEffect } from "react";
import { X, Settings, Percent, Wallet, Save, Timer } from "lucide-react";
import { useUser } from "../context/UserContext";
import { useToast } from "../context/ToastContext";
import { getUserSettings, updateUserSettings } from "../backend/service";
import { UserSettings as UserSettingsType } from "../types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess?: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSaveSuccess,
}) => {
  const { user } = useUser();
  const { showToast } = useToast();
  const [settings, setSettings] = useState<UserSettingsType>({
    email: user?.getEmail() || "",
    default_tax_rate: 32,
    default_buffer_amount: 10000,
    default_hourly_rate: 800,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user?.getEmail()) {
      fetchSettings();
    }
  }, [isOpen, user]);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await getUserSettings(user?.getEmail() || "");
      setSettings(response.data);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUserSettings(settings);
      showToast("Settings saved successfully!", "success");
      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (error: any) {
      showToast("Failed to save settings: " + error.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-900">
              <Settings size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 leading-tight">
                Preferences
              </h3>
              <p className="text-xs text-slate-400 font-medium tracking-tight">
                Set your calculation defaults
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin mb-4" />
              <p className="text-sm font-bold text-slate-400">
                Loading settings...
              </p>
            </div>
          ) : (
            <>
              {/* Default Tax Rate */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                      <Percent size={14} />
                    </div>
                    <label className="text-sm font-black text-slate-800 uppercase tracking-widest">
                      Default Tax Rate
                    </label>
                  </div>
                  <span className="text-sm font-black text-slate-900">
                    {settings.default_tax_rate}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={settings.default_tax_rate}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      default_tax_rate: parseFloat(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Default Buffer Amount */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                      <Wallet size={14} />
                    </div>
                    <label className="text-sm font-black text-slate-800 uppercase tracking-widest">
                      Default Buffer
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={settings.default_buffer_amount}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          default_buffer_amount:
                            parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-32 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-sm font-black text-slate-900 text-right focus:outline-none focus:border-slate-300 transition-colors"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">
                      SEK
                    </span>
                  </div>
                </div>
              </div>

              {/* Default Hourly Rate */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                      <Timer size={14} />
                    </div>
                    <label className="text-sm font-black text-slate-800 uppercase tracking-widest">
                      Default Hourly Rate
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={settings.default_hourly_rate}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          default_hourly_rate: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-32 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-sm font-black text-slate-900 text-right focus:outline-none focus:border-slate-300 transition-colors"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">
                      SEK
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-6 bg-slate-50/50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="flex-3 px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-[0_8px_30px_rgb(15,23,42,0.1)] active:scale-95"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save size={18} />
                Save Defaults
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
