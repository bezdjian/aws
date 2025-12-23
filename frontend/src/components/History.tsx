import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  User,
  History as HistoryIcon,
  ChevronRight,
  Search,
  Trash2,
  Clock,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { getCalculationsByEmail, deleteCalculation } from "../backend/service";
import { SalaryCalculation } from "../types";
import CalculationUtils from "../utils/CalculationUtils";
import { useToast } from "../context/ToastContext";
import ConfirmationModal from "./ConfirmationModal";

const History: React.FC = () => {
  const { user, isLoading: userLoading } = useUser();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [calculations, setCalculations] = useState<SalaryCalculation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [calculationToDelete, setCalculationToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!userLoading && !user) {
      navigate("/");
      return;
    }

    if (user) {
      fetchCalculations();
    }
  }, [user, userLoading, navigate]);

  const fetchCalculations = async () => {
    try {
      setIsLoading(true);
      const email = user?.getEmail();
      if (email) {
        const response = await getCalculationsByEmail(email);
        setCalculations(response.data);
      }
    } catch (error) {
      showToast("Failed to fetch calculation history", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCalculationToDelete({ id, name });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!calculationToDelete) return;

    try {
      setIsDeleting(true);
      await deleteCalculation(calculationToDelete.id);
      showToast("Simulation deleted successfully", "success");
      setCalculations((prev) =>
        prev.filter((calc) => calc.id !== calculationToDelete.id)
      );
    } catch (error) {
      showToast("Failed to delete simulation", "error");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setCalculationToDelete(null);
    }
  };

  const filteredCalculations = calculations.filter(
    (calc) =>
      calc.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      calc.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-brand-100">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => navigate("/home")}
              className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-500 hover:text-slate-900 group"
            >
              <ArrowLeft
                size={20}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600">
                <HistoryIcon size={20} />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 leading-none">
                  Simulation History
                </h1>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                  Historical Scenarios
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center bg-slate-100 rounded-2xl px-4 py-2 border border-slate-200/50 w-72 group focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-500/10 focus-within:border-brand-500 transition-all">
              <Search
                size={18}
                className="text-slate-400 group-focus-within:text-brand-500 transition-colors"
              />
              <input
                type="text"
                placeholder="Search simulations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-900 placeholder:text-slate-400 w-full ml-2"
              />
            </div>
            <button
              onClick={() => navigate("/insights")}
              className="flex items-center space-x-2 px-4 py-2 bg-brand-50 text-brand-600 rounded-2xl font-black text-sm hover:bg-brand-100 transition-all"
            >
              <TrendingUp size={16} />
              <span className="hidden sm:block">Analytics</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 flex-grow w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-brand-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
              Loading records...
            </p>
          </div>
        ) : filteredCalculations.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-20 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-8 border border-slate-100">
              <HistoryIcon size={48} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-3">
              No simulations found
            </h2>
            <p className="text-slate-500 max-w-sm font-medium leading-relaxed">
              {searchTerm
                ? "Try searching for a different client or note."
                : "You haven't saved any salary simulations yet. Head back home to create your first one!"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate("/home")}
                className="mt-10 px-8 py-4 bg-brand-600 text-white rounded-2xl font-black hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 active:scale-95 flex items-center space-x-3"
              >
                <span>New Simulation</span>
                <ChevronRight size={18} />
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredCalculations.map((calc) => (
              <div
                key={calc.id}
                onClick={() => navigate(`/calculation/${calc.id}`)}
                className="group relative bg-white rounded-[2rem] border border-slate-100 hover:border-brand-200 p-6 md:p-8 shadow-sm hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-500 cursor-pointer overflow-hidden"
              >
                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-brand-500/10 transition-colors"></div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Info Column */}
                  <div className="md:col-span-4 space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-all duration-500 shadow-inner">
                        <User size={22} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900 decoration-brand-500/30 group-hover:decoration-brand-500 group-hover:underline underline-offset-4 transition-all tracking-tight">
                          {calc.client_name || "General Calculation"}
                        </h3>
                        <div className="flex items-center space-x-2 text-slate-400 mt-1">
                          <Calendar size={12} />
                          <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                            {calc.date?.split("T")[0] || "No date"}
                          </span>
                        </div>
                      </div>
                    </div>
                    {calc.notes && (
                      <p className="text-sm text-slate-500 font-medium line-clamp-2 italic leading-relaxed pl-15">
                        "{calc.notes}"
                      </p>
                    )}
                  </div>

                  {/* Metrics Row */}
                  <div className="md:col-span-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">
                        Invoiced
                      </span>
                      <p className="text-sm font-black text-slate-900 font-mono italic">
                        {CalculationUtils.formatCurrency(
                          calc.invoiced_amount || 0
                        )}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">
                        Gross
                      </span>
                      <p className="text-sm font-black text-slate-900 font-mono italic">
                        {CalculationUtils.formatCurrency(
                          calc.gross_salary || 0
                        )}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase text-emerald-500/70 tracking-wider block font-black">
                        Net Salary
                      </span>
                      <p className="text-base font-black text-emerald-600 font-mono">
                        {CalculationUtils.formatCurrency(
                          calc.remaining_for_gross_salary || 0
                        )}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase text-brand-400 tracking-wider block">
                        Rate/h
                      </span>
                      <p className="text-sm font-black text-slate-700 font-mono italic">
                        {CalculationUtils.formatCurrency(calc.hourly_rate || 0)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-2 flex items-center justify-end space-x-3">
                    <button
                      onClick={(e) =>
                        handleDelete(
                          calc.id!,
                          calc.client_name || "General Calculation",
                          e
                        )
                      }
                      className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                      title="Delete record"
                    >
                      <Trash2 size={20} />
                    </button>
                    <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-brand-500 group-hover:text-white transition-all transform group-hover:scale-110 shadow-sm">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer info */}
        {!isLoading && filteredCalculations.length > 0 && (
          <div className="mt-12 flex items-center justify-center space-x-2 text-slate-400">
            <Clock size={14} />
            <p className="text-xs font-bold uppercase tracking-[0.2em]">
              Showing {filteredCalculations.length} simulations
            </p>
          </div>
        )}
      </main>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => !isDeleting && setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Simulation?"
        message={
          <>
            This action is permanent and cannot be undone. Are you sure you want
            to remove{" "}
            <span className="text-slate-900 font-bold">
              "{calculationToDelete?.name}"
            </span>
            ?
          </>
        }
        confirmText="Delete"
        isProcessing={isDeleting}
      />
    </div>
  );
};

export default History;
