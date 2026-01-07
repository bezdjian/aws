import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  History as HistoryIcon,
  ChevronRight,
  Search,
  Trash2,
  Clock,
  TrendingUp,
  FileDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
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

  const handleExportCSV = () => {
    if (calculations.length === 0) {
      showToast("No data to export", "error");
      return;
    }

    const headers = [
      "Date",
      "Client Name",
      "Hourly Rate",
      "Hours Worked",
      "Invoiced Amount",
      "After Deduction (80%)",
      "Save to Buffer",
      "Pension Saving",
      "Employer Fee",
      "Gross Salary",
      "Remaining for Net",
      "Notes",
    ];

    const csvRows = calculations.map((calc) => [
      calc.date?.split("T")[0] || "",
      `"${calc.client_name || ""}"`,
      calc.hourly_rate || 0,
      calc.hours_worked || 0,
      calc.invoiced_amount || 0,
      calc.after_deduction,
      calc.save_to_buffer || 0,
      calc.pension_saving || 0,
      calc.employer_fee || 0,
      calc.gross_salary || 0,
      calc.remaining_for_gross_salary || 0,
      `"${calc.notes || ""}"`,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvRows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `eighty_twenty_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("CSV History exported successfully", "success");
  };

  const filteredCalculations = calculations.filter(
    (calc) =>
      calc.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      calc.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans selection:bg-brand-100 transition-colors duration-300">
      <Header />
      {/* PAGE HEADER */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-16 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => navigate("/home")}
              className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-500 hover:text-slate-900 group cursor-pointer"
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
                <h1 className="text-xl font-black text-slate-900 leading-none dark:text-white">
                  Simulation History
                </h1>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                  Historical Scenarios
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center bg-slate-100 rounded-2xl px-4 py-2 border border-slate-200/50 w-72 group focus-within:bg-white transition-all">
              <Search
                size={18}
                className="text-slate-400 group-focus-within:text-brand-500 transition-colors"
              />
              <input
                type="text"
                placeholder="Search simulations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none focus:ring-0 text-sm font-medium text-slate-900 placeholder:text-slate-400 w-full ml-2"
              />
            </div>
            <button
              onClick={() => navigate("/insights")}
              className="hidden lg:flex items-center space-x-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all border border-slate-100 cursor-pointer"
            >
              <TrendingUp size={16} />
              <span>Analytics</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-2 px-4 py-2 bg-brand-600 text-white rounded-2xl font-black text-sm hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 cursor-pointer"
            >
              <FileDown size={16} />
              <span className="hidden sm:block">Export CSV</span>
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
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 p-20 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-200 dark:text-slate-700 mb-8 border border-slate-100 dark:border-slate-800">
              <HistoryIcon size={48} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
              No simulations found
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm font-medium leading-relaxed">
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
                className="group relative bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:border-brand-200 dark:hover:border-brand-500/50 p-6 md:p-8 shadow-sm hover:shadow-xl hover:shadow-brand-500/5 dark:hover:shadow-brand-500/10 transition-all duration-500 cursor-pointer overflow-hidden"
              >
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Info Column */}
                  <div className="md:col-span-4 space-y-4">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white decoration-brand-500/30 group-hover:decoration-brand-500 group-hover:underline underline-offset-4 transition-all tracking-tight">
                          {calc.client_name || "General Calculation"}
                        </h3>
                        <div className="flex items-center space-x-2 text-slate-400 dark:text-slate-500 mt-1">
                          <Calendar size={12} />
                          <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                            {calc.date?.split("T")[0] || "No date"}
                          </span>
                        </div>
                      </div>
                    </div>
                    {calc.notes && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-2 italic leading-relaxed pl-15">
                        "{calc.notes}"
                      </p>
                    )}
                  </div>

                  {/* Metrics Row */}
                  <div className="md:col-span-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider block">
                        Invoiced
                      </span>
                      <p className="text-sm font-black text-slate-900 dark:text-white font-mono italic">
                        {CalculationUtils.formatCurrency(
                          calc.invoiced_amount || 0
                        )}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider block">
                        Before employer fee
                      </span>
                      <p className="text-sm font-black text-slate-900 dark:text-white font-mono italic">
                        {CalculationUtils.formatCurrency(
                          calc.remaining_salary || 0
                        )}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase text-emerald-500/70 dark:text-emerald-400/70 tracking-wider block font-black">
                        Gross Salary
                      </span>
                      <p className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        {CalculationUtils.formatCurrency(
                          calc.remaining_for_gross_salary || 0
                        )}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase text-brand-400 dark:text-brand-500/70 tracking-wider block">
                        Rate/h
                      </span>
                      <p className="text-sm font-black text-slate-700 dark:text-slate-300 font-mono italic">
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
                      className="p-3 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all cursor-pointer"
                      title="Delete record"
                    >
                      <Trash2 size={20} />
                    </button>
                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300 dark:text-slate-600 group-hover:bg-brand-500 dark:group-hover:bg-brand-600 group-hover:text-white transition-all transform group-hover:scale-110 shadow-sm">
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
            <span className="text-slate-900 font-bold dark:text-white">
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
