import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calculator,
  Building2,
  Coins,
  Clock,
  Trash2,
  Download,
  User,
  Info,
} from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";
import { useParams, useNavigate } from "react-router-dom";
import {
  getCalculationById,
  deleteCalculation,
  getPresignedUrl,
} from "../backend/service";
import { calculateTax } from "../backend/taxService";
import { SalaryCalculation } from "../types";
import CalculationUtils from "../utils/CalculationUtils";
import { useUser } from "../context/UserContext";
import { useToast } from "../context/ToastContext";
import Header from "./Header";

const CalculationView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoading: userLoading, userSettings } = useUser();
  const { showToast } = useToast();

  const [calculation, setCalculation] = useState<SalaryCalculation | null>(
    null
  );
  const [taxData, setTaxData] = useState<{
    skatteavdrag: number;
    lonefterskatt: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!userLoading && !user) {
      navigate("/");
      return;
    }

    if (id) {
      fetchCalculation(id);
    }
  }, [id, user, userLoading, navigate]);

  const fetchCalculation = async (calcId: string) => {
    try {
      setIsLoading(true);
      const response = await getCalculationById(calcId);
      setCalculation(response.data);

      // Attempt to fetch tax data automatically for the saved gross salary
      if (response.data.remaining_for_gross_salary) {
        const taxRes = await calculateTax(
          response.data.remaining_for_gross_salary,
          userSettings?.birth_year || 1987,
          userSettings?.municipality_code || "180"
        );
        setTaxData(taxRes.data);
      }
    } catch (error) {
      showToast("Failed to load simulation details", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!calculation?.id) return;

    try {
      setIsDeleting(true);
      await deleteCalculation(calculation.id);
      showToast("Simulation deleted successfully", "success");
      navigate("/history");
    } catch (error) {
      showToast("Failed to delete record", "error");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center space-y-4 transition-colors duration-300">
        <div className="w-12 h-12 border-4 border-slate-100 dark:border-slate-800 border-t-brand-600 rounded-full animate-spin"></div>
        <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs">
          Retrieving scenario...
        </p>
      </div>
    );
  }

  if (!calculation) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center transition-colors duration-300">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mb-6">
          <Calculator size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
          Simulation not found
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs">
          The record you are looking for might have been moved or deleted.
        </p>
        <button
          onClick={() => navigate("/history")}
          className="px-8 py-3 bg-slate-900 dark:bg-brand-600 text-white rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-brand-500 transition-all flex items-center space-x-2"
        >
          <ArrowLeft size={18} />
          <span>Back to History</span>
        </button>
      </div>
    );
  }

  const handleDownloadReport = async () => {
    try {
      setIsDownloading(true);
      const res = await getPresignedUrl(
        user?.getEmail() || "",
        calculation?.client_name || "",
        calculation?.date || ""
      );
      window.open(res.data.url, "_blank");
    } catch (e: any) {
      if (e.response?.status === 404) {
        showToast("Report not found", "error");
      } else {
        showToast("Failed to download report", "error");
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans selection:bg-brand-100 pb-20 transition-colors duration-300">
      <Header />
      <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-16 z-40 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => navigate("/history")}
              className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white group"
            >
              <ArrowLeft
                size={20}
                className="group-hover:-translate-x-0.5 transition-transform print:hidden"
              />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/30 rounded-xl flex items-center justify-center text-brand-600 dark:text-brand-400 shadow-sm">
                <Calculator size={20} />
              </div>
              <div className="print:block">
                <h1 className="text-xl font-black text-slate-900 dark:text-white line-clamp-1">
                  {calculation.client_name || "General Scenario"}
                </h1>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">
                  Simulation Record
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all disabled:opacity-50 print:hidden"
            >
              <Trash2 size={20} />
            </button>
            <button
              onClick={() => navigate("/history")}
              className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-slate-900 dark:bg-brand-600 text-white rounded-2xl font-black text-sm hover:bg-slate-800 dark:hover:bg-brand-500 transition-all shadow-lg shadow-slate-900/10 print:hidden cursor-pointer"
            >
              <Clock size={16} />
              <span>View History</span>
            </button>
            <button
              onClick={handleDownloadReport}
              disabled={isDownloading}
              className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-brand-600 text-white rounded-2xl font-black text-sm hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 print:hidden cursor-pointer disabled:opacity-50"
            >
              {isDownloading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Download size={16} />
              )}
              <span>{isDownloading ? "Preparing..." : "Download Report"}</span>
            </button>
          </div>
        </div>
      </header>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Simulation?"
        message={
          <>
            This action is permanent and cannot be undone. Are you sure you want
            to remove{" "}
            <span className="text-slate-900 dark:text-white font-bold">
              "{calculation.client_name}"
            </span>
            ?
          </>
        }
        confirmText="Delete"
        isProcessing={isDeleting}
      />

      <main className="max-w-5xl mx-auto w-full px-6 py-12 space-y-8">
        {/* SUMMARY HERO */}
        <div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md border border-white/5">
                <Clock size={14} className="text-brand-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                  Record Date: {calculation.date?.split("T")[0]}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 block ml-1">
                  Take-home Estimate
                </span>
                <div className="text-5xl md:text-7xl font-black font-mono tracking-tighter text-white">
                  {CalculationUtils.formatCurrency(
                    taxData?.lonefterskatt ||
                      calculation.remaining_for_gross_salary ||
                      0
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:w-200">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-2">
                  Gross Salary
                </span>
                <p className="text-lg font-black font-mono text-green-400">
                  {CalculationUtils.formatCurrency(
                    calculation.remaining_for_gross_salary || 0
                  )}
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-2">
                  Tax Estimate
                </span>
                <p className="text-lg font-black font-mono text-red-400">
                  -{CalculationUtils.formatCurrency(taxData?.skatteavdrag || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* LEFT: Financial Breakdown */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 md:p-10 shadow-sm relative overflow-hidden group transition-colors duration-300">
              <div className="flex items-center space-x-3 mb-10">
                <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/30 rounded-xl flex items-center justify-center text-brand-600 dark:text-brand-400">
                  <Coins size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Revenue Flow
                </h3>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between py-4 border-b border-slate-50 dark:border-slate-800/50 group/item">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Hours Worked
                    </p>
                  </div>
                  <p className="text-xl font-black text-slate-900 dark:text-white font-mono tracking-tight group-hover/item:text-brand-600 dark:group-hover/item:text-brand-400 transition-colors">
                    {calculation?.hours_worked || 0}
                  </p>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-slate-50 dark:border-slate-800/50 group/item">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Hourly Rate
                    </p>
                  </div>
                  <p className="text-xl font-black text-slate-900 dark:text-white font-mono tracking-tight group-hover/item:text-brand-600 dark:group-hover/item:text-brand-400 transition-colors">
                    {calculation?.hourly_rate || 0}
                  </p>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-slate-50 dark:border-slate-800/50 group/item">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Total Invoiced
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      ({calculation.hours_worked} hours ×{" "}
                      {CalculationUtils.formatCurrency(calculation.hourly_rate)}
                      /h)
                    </p>
                  </div>
                  <p className="text-xl font-black text-slate-900 dark:text-white font-mono tracking-tight group-hover/item:text-brand-600 dark:group-hover/item:text-brand-400 transition-colors">
                    {CalculationUtils.formatCurrency(
                      calculation.invoiced_amount || 0
                    )}
                  </p>
                </div>

                <div className="flex items-center justify-between py-4 border-b border-slate-50 dark:border-slate-800/50 group/item">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Net Revenue (80%)
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      Available for salary and savings after 20% model costs
                    </p>
                  </div>
                  <p className="text-xl font-black text-slate-900 dark:text-white font-mono tracking-tight group-hover/item:text-brand-600 dark:group-hover/item:text-brand-400 transition-colors">
                    {CalculationUtils.formatCurrency(
                      calculation.after_deduction || 0
                    )}
                  </p>
                </div>

                <div className="flex items-center justify-between py-4 border-b border-slate-50 dark:border-slate-800/50 group/item">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Allocated Buffer
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      Safety reserve and operational overhead
                    </p>
                  </div>
                  <p className="text-xl font-black text-slate-400 dark:text-slate-500 font-mono tracking-tight">
                    -
                    {CalculationUtils.formatCurrency(
                      calculation.save_to_buffer || 0
                    )}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-6 group/item">
                  <div className="space-y-1">
                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.1em]">
                      Gross Basis
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      Base for employer contributions and gross salary
                    </p>
                  </div>
                  <p className="text-xl font-black text-brand-600 dark:text-brand-400 font-mono tracking-tighter">
                    {CalculationUtils.formatCurrency(
                      calculation.gross_salary || 0
                    )}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-6 group/item">
                  <div className="space-y-1">
                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.1em]">
                      Remaining salary after fixed costs
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      Before employer contributions
                    </p>
                  </div>
                  <p className="text-xl font-black text-brand-600 dark:text-brand-400 font-mono tracking-tighter">
                    {CalculationUtils.formatCurrency(
                      calculation.remaining_salary || 0
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* EMPLOYER COSTS */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm transition-colors duration-300">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Building2 size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Employment Obligations
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
                  <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest block mb-1">
                    Employer Social Fees
                  </span>
                  <p className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tighter">
                    {CalculationUtils.formatCurrency(
                      calculation.employer_fee || 0
                    )}
                  </p>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
                  <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest block mb-1">
                    Pension Contribution
                  </span>
                  <p className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tighter">
                    {CalculationUtils.formatCurrency(
                      calculation.pension_saving || 0
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Metadata & Notes */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm h-full transition-colors duration-300">
              <div className="flex items-center space-x-3 mb-8 text-slate-400 dark:text-slate-600">
                <User size={20} />
                <h3 className="text-sm font-black uppercase tracking-widest">
                  Metadata
                </h3>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest block mb-1">
                    Collaborator
                  </span>
                  <p className="text-lg font-black text-slate-900 dark:text-white">
                    {calculation.email}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest block mb-1">
                    Scenario Notes
                  </span>
                  <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 italic text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed relative transition-colors">
                    <Info
                      size={14}
                      className="absolute top-4 right-4 text-slate-300 dark:text-slate-600"
                    />
                    {calculation.notes ||
                      "No additional comments were provided for this simulation."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* PRINT-ONLY FOOTER */}
      <footer className="hidden print:block fixed bottom-12 left-0 right-0 text-center">
        <div className="max-w-7xl mx-auto px-12 border-t border-slate-100 dark:border-slate-800 pt-8 transition-colors">
          <p className="text-sm font-black text-slate-900 dark:text-white tracking-widest uppercase">
            Eighty-Twenty Simulation
          </p>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-[0.2em]">
            Generated via Eighty-Twenty Analytics Portal
          </p>
          <p className="text-[9px] text-slate-300 dark:text-slate-600 mt-6 font-mono">
            {new Date().toLocaleString()} • Record ID: {calculation.id}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CalculationView;
