import React, { useMemo } from "react";
import { LucidePalmtree, Coffee } from "lucide-react";
import CalculationUtils from "../../utils/CalculationUtils";

interface VacationFundCardProps {
  totalBuffer: number;
  desiredGrossSalary: number;
  avgPension: number;
  targetVacationWeeks: number;
  publicHolidays: number;
}

const VacationFundCard: React.FC<VacationFundCardProps> = ({
  totalBuffer,
  desiredGrossSalary,
  avgPension,
  targetVacationWeeks,
  publicHolidays,
}) => {
  const data = useMemo(() => {
    return CalculationUtils.calculateVacationReadiness(
      totalBuffer,
      desiredGrossSalary,
      avgPension,
      targetVacationWeeks,
      publicHolidays
    );
  }, [
    totalBuffer,
    desiredGrossSalary,
    avgPension,
    targetVacationWeeks,
    publicHolidays,
  ]);

  const isFullyFunded = data.progress >= 100;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm transition-all hover:shadow-md h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400">
            <LucidePalmtree size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Rest & Recharge
            </h3>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">
              Vacation Pre-Funding
            </p>
          </div>
        </div>
        {isFullyFunded && (
          <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800">
            Fully Funded
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-end mb-2">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {data.fundedVacationWeeks.toFixed(1)}{" "}
                <span className="text-sm font-medium text-slate-400">
                  / {data.targetVacationWeeks} weeks
                </span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                (+{publicHolidays} Public Holidays)
              </span>
            </div>
            <span className="text-xs font-black text-amber-600 dark:text-amber-400">
              {Math.round(data.progress)}% Ready
            </span>
          </div>
          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-out ${
                isFullyFunded ? "bg-emerald-500" : "bg-amber-500"
              }`}
              style={{ width: `${Math.min(data.progress, 100)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
            <div className="flex justify-between items-start mb-1">
              <span className="text-[10px] font-black uppercase text-slate-400">
                Total Target
              </span>
              <span className="text-[9px] font-black text-slate-400 bg-slate-200/50 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                Annual
              </span>
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {Math.round(data.totalHolidayDays)} Paid Days
            </span>
            <div className="text-[9px] text-slate-400 font-medium mt-1">
              {CalculationUtils.formatCurrency(data.annualVacationCost)} total
              cost
            </div>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
            <span className="block text-[10px] font-black uppercase text-slate-400 mb-1">
              Buffer Contribution
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              +{CalculationUtils.formatCurrency(data.monthlySurcharge)}/mo
            </span>
            <div className="text-[9px] text-slate-400 font-medium mt-1">
              To reach 100% funding
            </div>
          </div>
        </div>

        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/50 flex items-start space-x-3">
          <Coffee size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] font-medium text-amber-900 dark:text-amber-400 leading-relaxed">
            {isFullyFunded
              ? "Your requested downtime is now fully pre-funded. You can take your vacation without impacting your monthly salary income."
              : `Your buffer currently covers ${data.fundedVacationDays.toFixed(
                  1
                )} working days. To fund a full year of vacation and public holidays (${Math.round(
                  data.totalHolidayDays
                )} days), increase your monthly buffer saving.`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VacationFundCard;
