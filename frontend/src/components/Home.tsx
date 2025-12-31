import React, { useState, useEffect } from "react";
import {
  Calculator,
  Calendar,
  Coins,
  Clock,
  PiggyBank,
  TrendingUp,
  Save,
  ChevronRight,
} from "lucide-react";
import Header from "./Header";
import CalculationUtils from "../utils/CalculationUtils";
import { SalaryCalculation } from "../types";
import { useUser } from "../context/UserContext";
import { useToast } from "../context/ToastContext";
import {
  createCalculation,
  checkDuplicateCalculation,
  updateCalculation,
} from "../backend/service";
import { calculateTax } from "../backend/taxService";
import ConfirmationModal from "./ConfirmationModal";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const { user, isLoading, userSettings } = useUser();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isCalculatingTax, setIsCalculatingTax] = useState(false);
  const [taxResult, setTaxResult] = useState<{
    skatteavdrag: number;
    lonefterskatt: number;
  } | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [existingCalculationId, setExistingCalculationId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/", { replace: true });
    } else if (user) {
      fetchDefaults();
    }
  }, [user, isLoading, navigate, userSettings]);

  const fetchDefaults = async () => {
    try {
      const email = user?.getEmail() || "";

      setFormData((prev) => ({
        ...prev,
        email: email,
        save_to_buffer:
          userSettings?.default_buffer_amount ?? prev.save_to_buffer,
        hourly_rate: userSettings?.default_hourly_rate ?? prev.hourly_rate,
      }));
    } catch (error) {
      console.error("Failed to fetch defaults:", error);
      // Even if settings fetch fails, ensure the email is set
      setFormData((prev) => ({
        ...prev,
        email: user?.getEmail() || prev.email,
      }));
    }
  };

  const [formData, setFormData] = useState<SalaryCalculation>({
    email: user?.getEmail() || "",
    client_name: "General",
    hourly_rate: 800,
    hours_worked: 160,
    invoiced_amount: 128000,
    after_deduction: 102400,
    save_to_buffer: 10000,
    pension_saving: 3000,
    gross_salary: 92400,
    remaining_salary: 88050,
    remaining_for_gross_salary: 66999,
    employer_fee: 21051,
    notes: "",
    date: new Date().toISOString(),
  });

  // Derived calculations
  useEffect(() => {
    const invoiced = CalculationUtils.calculateInvoicedAmount(formData);
    const afterDed = CalculationUtils.calculateAfterDeduction(formData);
    const gross = afterDed - formData.save_to_buffer;
    const remainingSalary = CalculationUtils.calculateRemainingSalary(formData);
    const remainingForGrossSalary =
      CalculationUtils.calculateRemainingForGrossSalary(formData);
    const employerFee = CalculationUtils.calculateEmployerFee(formData);

    setFormData((prev) => ({
      ...prev,
      invoiced_amount: invoiced,
      after_deduction: afterDed,
      gross_salary: gross,
      remaining_salary: remainingSalary,
      remaining_for_gross_salary: remainingForGrossSalary,
      employer_fee: employerFee,
    }));
  }, [
    formData.hourly_rate,
    formData.hours_worked,
    formData.save_to_buffer,
    formData.pension_saving,
  ]);

  // Reset tax result when form data changes
  useEffect(() => {
    setTaxResult(null);
  }, [
    formData.hourly_rate,
    formData.hours_worked,
    formData.save_to_buffer,
    formData.pension_saving,
  ]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const type =
      e.target instanceof HTMLInputElement ? e.target.type : "textarea";
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const userEmail = user?.getEmail() || "";
    if (!userEmail) {
      showToast("Email is required to save", "error");
      setIsSaving(false);
      return;
    }

    try {
      // 1. Check if a calculation exists for this month and client using backend
      const response = await checkDuplicateCalculation(
        userEmail,
        formData.client_name || "General"
      );
      const duplicate = response.data;

      if (duplicate && duplicate.id) {
        setExistingCalculationId(duplicate.id);
        setShowUpdateModal(true);
        setIsSaving(false);
        return;
      }

      // 2. If no duplicate, create new
      await createCalculation({
        ...formData,
        email: userEmail,
      });
      showToast("Calculation saved successfully!", "success");
    } catch (error: any) {
      showToast("Failed to save calculation: " + error.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmUpdate = async () => {
    if (!existingCalculationId) return;

    setIsSaving(true);
    setShowUpdateModal(false);

    try {
      await updateCalculation(existingCalculationId, {
        ...formData,
        email: user?.getEmail() || formData.email,
      });
      showToast("Calculation updated successfully!", "success");
    } catch (error: any) {
      showToast("Failed to update calculation: " + error.message, "error");
    } finally {
      setIsSaving(false);
      setExistingCalculationId(null);
    }
  };

  const handleCalculateTax = () => {
    setIsCalculatingTax(true);
    calculateTax(
      formData.remaining_for_gross_salary,
      userSettings?.birth_year || 1987,
      userSettings?.municipality_code || "180"
    )
      .then((response) => {
        setTaxResult(response.data);
      })
      .catch((error) => {
        showToast("Failed to calculate tax: " + error.message, "error");
      })
      .finally(() => {
        setIsCalculatingTax(false);
      });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Header onSettingsUpdate={fetchDefaults} />

      <main className="flex-grow flex flex-col md:flex-row">
        {/* LEFT SECTION: User Welcome & History Placeholder */}
        <section className="md:w-[30%] bg-slate-50/50 dark:bg-slate-900/20 p-8 md:p-12 lg:p-16 flex flex-col justify-start relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 left-10 w-64 h-64 bg-brand-100/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-100/20 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-6 leading-tight tracking-tight">
              Welcome back,
              <br />
              <span className="text-medium text-brand-600 dark:text-brand-400">
                {user?.getName()?.split(" ")[0]}
              </span>
              .
            </h1>
            <p className="text-medium text-slate-500 dark:text-slate-400 mb-10 leading-relaxed font-medium max-w-sm">
              Ready to optimize your finances? Use the calculator to estimate
              your net income and keep a secure record of your earnings.
            </p>

            <div className="space-y-4">
              <div
                onClick={() => navigate("/history")}
                className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group cursor-pointer hover:border-brand-200 dark:hover:border-brand-500/50 transition-all font-sans"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-brand-50 dark:group-hover:bg-brand-900/30 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-all duration-500">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      View History
                    </p>
                    <p className="text-xs text-slate-400">
                      Access your saved calculations
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  className="text-slate-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all"
                />
              </div>

              <div
                onClick={() => navigate("/insights")}
                className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group cursor-pointer hover:border-brand-200 dark:hover:border-brand-500/50 transition-all font-sans"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-brand-50 dark:group-hover:bg-brand-900/30 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-all duration-500">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      Analytics & Insights
                    </p>
                    <p className="text-xs text-slate-400">
                      Financial performance charts
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  className="text-slate-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all"
                />
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT SECTION: Calculation Form */}
        <section className="md:w-[70%] bg-white dark:bg-slate-950 p-8 md:p-16 flex flex-col transition-colors duration-300">
          <div className="w-full max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4 pb-4">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                <span className="flex items-center">
                  <Calculator
                    className="mr-3 text-brand-600 dark:text-brand-400"
                    size={24}
                  />
                  Create Simulation
                </span>
              </h2>
              <div className="flex items-center space-x-2 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <Calendar size={16} />
                <span className="text-xs font-bold font-mono uppercase">
                  {formData.date?.split("T")[0]}
                </span>
              </div>
            </div>

            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="col-span-full space-y-1">
                  <label className="text-[11px] font-black uppercase text-slate-400 flex items-center tracking-widest px-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    name="client_name"
                    value={formData.client_name}
                    onChange={handleChange}
                    placeholder="Enter client name (e.g. Acme Corp)"
                    disabled={isSaving}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase text-slate-400 flex items-center tracking-widest px-1">
                    <Coins size={14} className="mr-1.5" /> Hourly Rate (SEK)
                  </label>
                  <input
                    type="number"
                    name="hourly_rate"
                    value={formData.hourly_rate}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase text-slate-400 flex items-center tracking-widest px-1">
                    <Clock size={14} className="mr-1.5" /> Monthly Hours
                  </label>
                  <input
                    type="number"
                    name="hours_worked"
                    value={formData.hours_worked}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase text-slate-400 flex items-center tracking-widest px-1">
                    <PiggyBank size={14} className="mr-1.5" /> Buffer Savings
                  </label>
                  <input
                    type="number"
                    name="save_to_buffer"
                    value={formData.save_to_buffer}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 font-mono font-bold text-brand-600 dark:text-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase text-slate-400 flex items-center tracking-widest px-1">
                    <TrendingUp size={14} className="mr-1.5" /> Pension Saving
                  </label>
                  <input
                    type="number"
                    name="pension_saving"
                    value={formData.pension_saving}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 font-mono font-bold text-slate-500 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* RESULTS GRID */}
                <div className="col-span-full grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                  <div className="p-5 rounded-2xl bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 border border-brand-100 dark:border-brand-800/50 flex flex-col justify-between">
                    <span className="text-[11px] font-black uppercase text-brand-400 dark:text-brand-500/70 tracking-wider mb-2">
                      Invoiced
                    </span>
                    <div className="text-lg font-bold font-mono">
                      {CalculationUtils.formatCurrency(
                        formData.invoiced_amount
                      )}
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                    <span className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">
                      Net (80%)
                    </span>
                    <div className="text-lg font-bold font-mono text-slate-400 dark:text-slate-500">
                      {CalculationUtils.formatCurrency(
                        formData.after_deduction
                      )}
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 border border-brand-100 dark:border-brand-800/50 flex flex-col justify-between">
                    <span className="text-[11px] font-black uppercase text-brand-400 dark:text-brand-500/70 tracking-wider mb-2">
                      Gross Basis
                    </span>
                    <div className="text-lg font-bold font-mono">
                      {CalculationUtils.formatCurrency(formData.gross_salary)}
                    </div>
                  </div>
                </div>

                <div className="col-span-full space-y-4">
                  <div
                    className={`p-6 rounded-3xl transition-all duration-500 ${
                      taxResult
                        ? "bg-slate-900 dark:bg-brand-600 text-white"
                        : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50"
                    } text-center`}
                  >
                    <span
                      className={`text-[10px] font-black uppercase ${
                        taxResult
                          ? "text-slate-400 dark:text-white/60"
                          : "text-emerald-500 dark:text-emerald-400/70"
                      } tracking-[0.2em] block mb-2`}
                    >
                      Remaining for Gross Salary
                    </span>
                    <div className="text-3xl font-black font-mono">
                      {CalculationUtils.formatCurrency(
                        formData.remaining_for_gross_salary
                      )}
                    </div>
                  </div>

                  {taxResult && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                      <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800/50 flex flex-col items-center">
                        <span className="text-[9px] font-black uppercase text-red-400 dark:text-red-500/70 tracking-wider mb-2">
                          Estimated Tax
                        </span>
                        <div className="text-xl font-bold font-mono">
                          -
                          {CalculationUtils.formatCurrency(
                            taxResult.skatteavdrag
                          )}
                        </div>
                      </div>
                      <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 flex flex-col items-center">
                        <span className="text-[9px] font-black uppercase text-emerald-400 dark:text-emerald-500/70 tracking-wider mb-2">
                          Net Salary
                        </span>
                        <div className="text-xl font-bold font-mono">
                          {CalculationUtils.formatCurrency(
                            taxResult.lonefterskatt
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* NOTES SECTION */}
                <div className="col-span-full space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 flex items-center tracking-widest px-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Add any notes about this calculation (e.g., equipment costs, specific client terms...)"
                    rows={3}
                    disabled={isSaving}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* BUTTONS */}
                <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
                  <button
                    type="button"
                    onClick={handleCalculateTax}
                    disabled={isCalculatingTax}
                    className="flex items-center justify-center space-x-2 bg-slate-900 dark:bg-brand-600 text-white py-5 px-8 rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-brand-700 cursor-pointer transition-all active:translate-y-0 shadow-lg shadow-slate-200 dark:shadow-brand-900/20 disabled:opacity-50 disabled:translate-y-0 disabled:cursor-not-allowed"
                  >
                    {isCalculatingTax ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Calculator size={18} />
                        <span>Calculate net salary</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center justify-center space-x-2 bg-brand-600 text-white py-5 px-8 rounded-2xl font-bold hover:bg-brand-700 cursor-pointer transition-all active:translate-y-0 shadow-brand-100 disabled:opacity-50 disabled:translate-y-0 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Save size={18} />
                        <span>Save calculation</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            <footer className="mt-12 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
                Protected by 80/20 Governance Model v1.0
              </p>
            </footer>
          </div>
        </section>
      </main>

      <ConfirmationModal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setExistingCalculationId(null);
        }}
        onConfirm={confirmUpdate}
        title="Update Existing Calculation?"
        message="A simulation already exists for this client in the current month. Would you like to overwrite it with these new values?"
        confirmText="Update"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Home;
