import React, { useMemo } from "react";
import { Shield, Zap, AlertTriangle, TrendingDown } from "lucide-react";
import CalculationUtils from "../../utils/CalculationUtils";
import { SalaryCalculation, UserSettings } from "../../types";

interface TaxOptimizationCardProps {
  settings: UserSettings | null;
  calculations: SalaryCalculation[];
}

const TaxOptimizationCard: React.FC<TaxOptimizationCardProps> = ({
  settings,
  calculations,
}) => {
  const { desiredGross, isAverage, recordCount } = useMemo(() => {
    if (calculations && calculations.length > 0) {
      // Get the last 5 records
      const lastFive = calculations.slice(0, 5);
      const sum = lastFive.reduce(
        (acc, calc) => acc + (calc.remaining_for_gross_salary || 0),
        0
      );
      return {
        desiredGross: sum / lastFive.length,
        isAverage: true,
        recordCount: lastFive.length,
      };
    }
    return {
      desiredGross: settings?.desired_gross_salary || 50000,
      isAverage: false,
      recordCount: 0,
    };
  }, [calculations, settings]);

  const taxInfo = useMemo(() => {
    return CalculationUtils.calculateTaxEfficiency(desiredGross);
  }, [desiredGross]);

  const percentageToThreshold = Math.min(
    (desiredGross / taxInfo.threshold) * 100,
    120
  );

  const getStatusConfig = () => {
    switch (taxInfo.status) {
      case "danger":
        return {
          color: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-50 dark:bg-red-900/20",
          borderColor: "border-red-100 dark:border-red-900/30",
          barColor: "bg-red-500",
          icon: <AlertTriangle className="w-5 h-5" />,
          title: "Tax Overload",
        };
      case "warning":
        return {
          color: "text-amber-600 dark:text-amber-400",
          bgColor: "bg-amber-50 dark:bg-amber-900/20",
          borderColor: "border-amber-100 dark:border-amber-900/30",
          barColor: "bg-amber-500",
          icon: <Zap className="w-5 h-5" />,
          title: "Near Limit",
        };
      default:
        return {
          color: "text-emerald-600 dark:text-emerald-400",
          bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
          borderColor: "border-emerald-100 dark:border-emerald-900/30",
          barColor: "bg-emerald-500",
          icon: <Shield className="w-5 h-5" />,
          title: "Safe Zone",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className={`h-full flex flex-col justify-between p-6 rounded-3xl border ${config.borderColor} ${config.bgColor} transition-all duration-300`}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div
            className={`p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm ${config.color}`}
          >
            {config.icon}
          </div>
          <span
            className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/50 dark:bg-slate-800/50 ${config.color}`}
          >
            {config.title}
          </span>
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Tax Optimizer
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isAverage ? (
              <>
                Based on average gross salary from past{" "}
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {recordCount}
                </span>{" "}
                records:{" "}
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {CalculationUtils.formatCurrency(desiredGross)}
                </span>
              </>
            ) : (
              <>
                Based on your desired gross salary of{" "}
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {CalculationUtils.formatCurrency(desiredGross)}
                </span>
              </>
            )}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
            <span>Utilization</span>
            <span>{Math.round(percentageToThreshold)}% of threshold</span>
          </div>
          <div className="h-2 w-full bg-white/50 dark:bg-slate-800/50 rounded-full overflow-hidden">
            <div
              className={`h-full ${config.barColor} transition-all duration-1000 ease-out rounded-full`}
              style={{ width: `${Math.min(percentageToThreshold, 100)}%` }}
            />
          </div>
          {desiredGross > taxInfo.threshold && (
            <div className="h-1 w-full flex gap-1 mt-1">
              <div
                className="flex-1 bg-transparent"
                style={{ flexGrow: taxInfo.threshold }}
              ></div>
              <div
                className="flex-none bg-red-400 rounded-full"
                style={{ flexGrow: desiredGross - taxInfo.threshold }}
              ></div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white/40 dark:bg-slate-800/40 rounded-2xl border border-white/50 dark:border-slate-700/50">
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {taxInfo.message}
          </p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-white/20 dark:border-slate-700/20">
        <div className="bg-white/60 dark:bg-slate-900/60 p-3 rounded-xl flex items-start gap-3">
          <TrendingDown className="w-4 h-4 text-indigo-500 mt-0.5" />
          <p className="text-xs text-slate-600 dark:text-slate-400 italic">
            {taxInfo.isOverThreshold
              ? "Strategy: Switch to increasing company buffer savings to keep your salary below the 20% state tax limit."
              : "Strategy: You have room to increase salary if needed, but staying below the limit maximizes your 80/20 efficiency."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaxOptimizationCard;
