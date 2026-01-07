import React, { useMemo } from "react";
import { HeartPulse, Award, Zap } from "lucide-react";
import CalculationUtils from "../../utils/CalculationUtils";

interface ResilienceDashboardProps {
  totalBuffer: number;
  desiredGrossSalary: number;
  avgPension: number;
}

const ResilienceDashboard: React.FC<ResilienceDashboardProps> = ({
  totalBuffer,
  desiredGrossSalary,
  avgPension,
}) => {
  const resilience = useMemo(() => {
    const desiredGross = desiredGrossSalary || 50000;

    // Calculate fixed costs based on the average pension saving
    const fixedCosts = CalculationUtils.calculateTotalCosts({
      pension_saving: avgPension || 3000,
    } as any);

    // Total monthly cost needed from the 80% pot:
    // (Gross Salary * 1.3142) + Fixed Costs (Insurance, Fees, etc.)
    const totalMonthlyCost = desiredGross * 1.3142 + fixedCosts;

    const runway = totalBuffer / totalMonthlyCost;

    let status = {
      level: "Building Reserve",
      iconColor: "text-slate-400",
      bgColor: "bg-slate-50 dark:bg-slate-900/40",
      borderColor: "border-slate-100 dark:border-slate-800",
      description:
        "You're building your war chest. Every contribution brings you closer to safety.",
    };

    if (runway >= 6) {
      status = {
        level: "Antifragile",
        iconColor: "text-emerald-500",
        bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
        borderColor: "border-emerald-100 dark:border-emerald-800/50",
        description:
          "Incredible! You have over 6 months of full salary pre-funded. You are officially independent of market volatility.",
      };
    } else if (runway >= 3) {
      status = {
        level: "Fortress",
        iconColor: "text-brand-500",
        bgColor: "bg-brand-50 dark:bg-brand-900/20",
        borderColor: "border-brand-100 dark:border-brand-800/50",
        description:
          "Solid foundation. You can handle a quarter-year without invoicing and maintain your lifestyle.",
      };
    } else if (runway >= 1) {
      status = {
        level: "Runway Established",
        iconColor: "text-amber-500",
        bgColor: "bg-amber-50 dark:bg-amber-900/20",
        borderColor: "border-amber-100 dark:border-amber-800/50",
        description:
          "You have a full month of gross salary covered. This is the first step towards total autonomy.",
      };
    }

    const progress = Math.min((runway / 6) * 100, 100);

    return {
      runway,
      desiredGross,
      totalMonthlyCost,
      progress,
      ...status,
    };
  }, [totalBuffer, desiredGrossSalary, avgPension]);

  return (
    <section
      className={`relative overflow-hidden p-8 md:p-10 rounded-[2.5rem] border ${resilience.borderColor} ${resilience.bgColor} transition-all duration-500 h-full`}
    >
      <div className="absolute top-0 right-0 p-10 opacity-10 dark:opacity-5">
        <HeartPulse size={120} className={resilience.iconColor} />
      </div>

      <div className="relative z-10 flex flex-col gap-8">
        <div className="space-y-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div
                className={`p-2 rounded-lg ${resilience.bgColor} border ${resilience.borderColor} ${resilience.iconColor}`}
              >
                <Award size={20} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                Buffer-as-an-Insurance Simulation
              </h3>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Resilience:{" "}
              <span className={resilience.iconColor}>{resilience.level}</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium leading-relaxed">
              {resilience.description}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between font-black text-[10px] uppercase tracking-widest text-slate-400">
                <span>Runway Coverage</span>
                <span className={resilience.iconColor}>
                  {resilience.runway.toFixed(1)} Months
                </span>
              </div>
              <div className="h-4 bg-white/50 dark:bg-slate-800/50 rounded-full overflow-hidden p-1 shadow-inner border border-white/20">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out relative shadow-sm ${
                    resilience.runway >= 6
                      ? "bg-emerald-500"
                      : resilience.runway >= 3
                      ? "bg-brand-500"
                      : resilience.runway >= 1
                      ? "bg-amber-500"
                      : "bg-slate-400"
                  }`}
                  style={{ width: `${resilience.progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>

            <div className="bg-white/60 dark:bg-slate-900/60 p-4 rounded-2xl border border-white/50 dark:border-slate-800/50 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="block text-[10px] font-black uppercase text-slate-400">
                  Monthly Burn
                </span>
                <span className="text-lg font-mono font-black text-slate-900 dark:text-white">
                  {CalculationUtils.formatCurrency(resilience.totalMonthlyCost)}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-500">
                <Zap size={18} className="animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResilienceDashboard;
