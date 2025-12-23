import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calculator,
  Building2,
  Coins,
  Clock,
  Trash2,
  Download,
  Share2,
  User,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { getCalculationById, deleteCalculation } from "../backend/service";
import { calculateTax } from "../backend/taxService";
import { SalaryCalculation } from "../types";
import CalculationUtils from "../utils/CalculationUtils";
import { useUser } from "../context/UserContext";
import { useToast } from "../context/ToastContext";

const CalculationView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoading: userLoading } = useUser();
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
          response.data.remaining_for_gross_salary
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
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-brand-600 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
          Retrieving scenario...
        </p>
      </div>
    );
  }

  if (!calculation) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <Calculator size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">
          Simulation not found
        </h2>
        <p className="text-slate-500 mb-8 max-w-xs">
          The record you are looking for might have been moved or deleted.
        </p>
        <button
          onClick={() => navigate("/history")}
          className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center space-x-2"
        >
          <ArrowLeft size={18} />
          <span>Back to History</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-brand-100 pb-20">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => navigate("/history")}
              className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-500 hover:text-slate-900 group"
            >
              <ArrowLeft
                size={20}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 shadow-sm">
                <Calculator size={20} />
              </div>
              <div>
                <h1 className="text-lg font-black text-slate-900 line-clamp-1">
                  {calculation.client_name || "General Scenario"}
                </h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                  Simulation Record
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all disabled:opacity-50"
            >
              <Trash2 size={20} />
            </button>
            <button
              onClick={() => window.print()}
              className="hidden sm:flex items-center space-x-2 px-5 py-2.5 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 shadow-inner"
            >
              <Download size={18} />
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* CONFIRMATION MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => !isDeleting && setShowDeleteConfirm(false)}
          ></div>
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 right-0 p-6">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 md:p-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6 shadow-inner animate-bounce-subtle">
                <AlertTriangle size={32} />
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
                Delete Simulation?
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed mb-8">
                This action is permanent and cannot be undone. Are you sure you
                want to remove{" "}
                <span className="text-slate-900 font-bold">
                  "{calculation.client_name}"
                </span>
                ?
              </p>

              <div className="grid grid-cols-2 gap-4 w-full">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-6 py-4 bg-slate-50 text-slate-600 rounded-2xl font-black hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-6 py-4 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isDeleting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      <span>Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto w-full px-6 py-12 space-y-8">
        {/* SUMMARY HERO */}
        <div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
                <Clock size={14} className="text-brand-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                  Record Date: {calculation.date?.split("T")[0]}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 block ml-1">
                  Take-home Estimate
                </span>
                <div className="text-5xl md:text-7xl font-black font-mono tracking-tighter">
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
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-10 shadow-sm relative overflow-hidden group">
              <div className="flex items-center space-x-3 mb-10">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600">
                  <Coins size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  Revenue Flow
                </h3>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between py-4 border-b border-slate-50 group/item">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                      Hours Worked
                    </p>
                  </div>
                  <p className="text-xl font-black text-slate-900 font-mono tracking-tight group-hover/item:text-brand-600 transition-colors">
                    {calculation?.hours_worked || 0}
                  </p>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-slate-50 group/item">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                      Hourly Rate
                    </p>
                  </div>
                  <p className="text-xl font-black text-slate-900 font-mono tracking-tight group-hover/item:text-brand-600 transition-colors">
                    {calculation?.hourly_rate || 0}
                  </p>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-slate-50 group/item">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                      Total Invoiced
                    </p>
                    <p className="text-xs text-slate-400 font-medium">
                      ({calculation.hours_worked} hours ×{" "}
                      {CalculationUtils.formatCurrency(calculation.hourly_rate)}
                      /h)
                    </p>
                  </div>
                  <p className="text-xl font-black text-slate-900 font-mono tracking-tight group-hover/item:text-brand-600 transition-colors">
                    {CalculationUtils.formatCurrency(
                      calculation.invoiced_amount || 0
                    )}
                  </p>
                </div>

                <div className="flex items-center justify-between py-4 border-b border-slate-50 group/item">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                      Net Revenue (80%)
                    </p>
                    <p className="text-xs text-slate-400 font-medium">
                      Available for salary and savings after 20% model costs
                    </p>
                  </div>
                  <p className="text-xl font-black text-slate-900 font-mono tracking-tight group-hover/item:text-brand-600 transition-colors">
                    {CalculationUtils.formatCurrency(
                      calculation.after_deduction || 0
                    )}
                  </p>
                </div>

                <div className="flex items-center justify-between py-4 border-b border-slate-50 group/item">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                      Allocated Buffer
                    </p>
                    <p className="text-xs text-slate-400 font-medium">
                      Safety reserve and operational overhead
                    </p>
                  </div>
                  <p className="text-xl font-black text-slate-400 font-mono tracking-tight">
                    -
                    {CalculationUtils.formatCurrency(
                      calculation.save_to_buffer || 0
                    )}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-6 group/item">
                  <div className="space-y-1">
                    <p className="text-sm font-black text-slate-900 uppercase tracking-[0.1em]">
                      Gross Basis
                    </p>
                    <p className="text-xs text-slate-400 font-medium">
                      Base for employer contributions and gross salary
                    </p>
                  </div>
                  <p className="text-xl font-black text-brand-600 font-mono tracking-tighter">
                    {CalculationUtils.formatCurrency(
                      calculation.gross_salary || 0
                    )}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-6 group/item">
                  <div className="space-y-1">
                    <p className="text-sm font-black text-slate-900 uppercase tracking-[0.1em]">
                      Remaining salary after fixed costs
                    </p>
                    <p className="text-xs text-slate-400 font-medium">
                      Before employer contributions
                    </p>
                  </div>
                  <p className="text-xl font-black text-brand-600 font-mono tracking-tighter">
                    {CalculationUtils.formatCurrency(
                      calculation.remaining_salary || 0
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* EMPLOYER COSTS */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <Building2 size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  Employment Obligations
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">
                    Employer Social Fees
                  </span>
                  <p className="text-2xl font-black text-slate-900 font-mono tracking-tighter">
                    {CalculationUtils.formatCurrency(
                      calculation.employer_fee || 0
                    )}
                  </p>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">
                    Pension Contribution
                  </span>
                  <p className="text-2xl font-black text-slate-900 font-mono tracking-tighter">
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
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm h-full">
              <div className="flex items-center space-x-3 mb-8 text-slate-400">
                <User size={20} />
                <h3 className="text-sm font-black uppercase tracking-widest">
                  Metadata
                </h3>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">
                    Collaborator
                  </span>
                  <p className="text-lg font-black text-slate-900">
                    {calculation.email}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">
                    Scenario Notes
                  </span>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-500 font-medium text-sm leading-relaxed relative">
                    <Info
                      size={14}
                      className="absolute top-4 right-4 text-slate-300"
                    />
                    {calculation.notes ||
                      "No additional comments were provided for this simulation."}
                  </div>
                </div>

                <div className="pt-10">
                  <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100 flex items-center space-x-3 text-brand-700">
                    <Share2 size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">
                      Shared simulation
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CalculationView;
