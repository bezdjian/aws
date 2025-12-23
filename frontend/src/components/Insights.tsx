import React, { useEffect, useState, useMemo } from "react";
import {
  ArrowLeft,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  DollarSign,
  Zap,
  ShieldCheck,
  Briefcase,
  FileDown,
  HelpCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { getCalculationsByEmail } from "../backend/service";
import { SalaryCalculation } from "../types";
import CalculationUtils from "../utils/CalculationUtils";
import { useToast } from "../context/ToastContext";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format, parseISO } from "date-fns";

const Insights: React.FC = () => {
  const { user, isLoading: userLoading } = useUser();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [calculations, setCalculations] = useState<SalaryCalculation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
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
      showToast("Failed to fetch analytics data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Core Summary Stats
  const stats = useMemo(() => {
    const totalInvoiced = calculations.reduce(
      (acc, curr) => acc + (curr.invoiced_amount || 0),
      0
    );
    const totalNet = calculations.reduce(
      (acc, curr) => acc + (curr.remaining_for_gross_salary || 0),
      0
    );
    const totalBuffer = calculations.reduce(
      (acc, curr) => acc + (curr.save_to_buffer || 0),
      0
    );
    const avgRate =
      calculations.length > 0
        ? calculations.reduce((acc, curr) => acc + (curr.hourly_rate || 0), 0) /
          calculations.length
        : 0;

    return {
      totalInvoiced,
      totalNet,
      totalBuffer,
      avgRate,
      count: calculations.length,
    };
  }, [calculations]);

  // 2. Chart Data: Monthly Revenue
  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};

    // Get last 6 months
    calculations.forEach((calc) => {
      if (!calc.date) return;
      const monthKey = format(parseISO(calc.date), "MMM yy");
      months[monthKey] = (months[monthKey] || 0) + (calc.invoiced_amount || 0);
    });

    return Object.entries(months)
      .map(([name, value]) => ({ name, value }))
      .reverse(); // Simplified sort for demo
  }, [calculations]);

  // 3. Chart Data: Average Efficiency Breakdown
  const distributionData = useMemo(() => {
    if (calculations.length === 0) return [];

    const count = calculations.length;

    // Sum up everything to calculate true averages
    const totalInvoiced = calculations.reduce(
      (acc, curr) => acc + (curr.invoiced_amount || 0),
      0
    );
    const totalBuffer = calculations.reduce(
      (acc, curr) => acc + (curr.save_to_buffer || 0),
      0
    );
    const totalGross = calculations.reduce(
      (acc, curr) => acc + (curr.remaining_for_gross_salary || 0),
      0
    );
    const totalSocialPension = calculations.reduce(
      (acc, curr) =>
        acc + (curr.employer_fee || 0) + (curr.pension_saving || 0),
      0
    );

    // 20% Model Fee is consistent across all
    const avgModelFee = (totalInvoiced * 0.2) / count;
    const avgBuffer = totalBuffer / count;
    const avgGross = totalGross / count;
    const avgSocialPension = totalSocialPension / count;

    return [
      { name: "Model Fee (20%)", value: avgModelFee, color: "#6366f1" }, // brand-500
      { name: "Safety Buffer", value: avgBuffer, color: "#f59e0b" }, // amber-500
      { name: "Gross Salary Basis", value: avgGross, color: "#10b981" }, // emerald-500
      { name: "Social & Pension", value: avgSocialPension, color: "#ef4444" }, // red-500
    ];
  }, [calculations]);

  const handleExportCSV = () => {
    if (calculations.length === 0) {
      showToast("No data to export", "error");
      return;
    }

    const rows = [];

    // Section 1: Core Statistics
    rows.push(["FINANCIAL SUMMARY REPORT"]);
    rows.push(["Generated on", new Date().toLocaleString()]);
    rows.push([]);
    rows.push(["Metric", "Value"]);
    rows.push(["Total Accumulated Billing", stats.totalInvoiced]);
    rows.push(["Total Projected Net (Gross)", stats.totalNet]);
    rows.push(["Total Accumulated Safety Buffer", stats.totalBuffer]);
    rows.push(["Average Hourly Rate", Math.round(stats.avgRate)]);
    rows.push(["Total Saved Scenarios", stats.count]);
    rows.push([]);

    // Section 2: Monthly Performance
    rows.push(["MONTHLY REVENUE PERFORMANCE"]);
    rows.push(["Month", "Revenue"]);
    monthlyData.forEach((item) => {
      rows.push([item.name, item.value]);
    });
    rows.push([]);

    // Section 3: Latest Distribution Profile
    rows.push(["80/20 DISTRIBUTION (LATEST PROFILE)"]);
    rows.push(["Category", "Amount"]);
    distributionData.forEach((item) => {
      rows.push([item.name, item.value]);
    });

    const csvContent = rows.map((row) => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `eighty_twenty_insights_summary_${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Insights Summary exported successfully", "success");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4 font-sans">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-brand-600 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
          Generating Insights...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-brand-100 pb-20">
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
            <div className="h-8 w-px bg-slate-100"></div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-600/20">
                <TrendingUp size={20} />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 leading-none">
                  Financial Insights
                </h1>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                  Analytics Dashboard
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-5 py-2.5 bg-brand-600 text-white rounded-2xl font-black text-sm hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20"
          >
            <FileDown size={18} />
            <span className="hidden sm:block">Export Data</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-8 w-full">
        {calculations.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">
              No data yet
            </h2>
            <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">
              Create and save simulations to see your financial trends and
              performance metrics here.
            </p>
            <button
              onClick={() => navigate("/home")}
              className="px-8 py-4 bg-brand-600 text-white rounded-2xl font-black hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 active:scale-95"
            >
              Start Calculating
            </button>
          </div>
        ) : (
          <>
            {/* HERO STATS - BENTO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-2 bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-slate-900/10 group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="relative z-10">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2 block">
                    Accumulated Billing
                  </span>
                  <div className="text-5xl font-black font-mono tracking-tighter mb-4">
                    {CalculationUtils.formatCurrency(stats.totalInvoiced)}
                  </div>
                  <div className="flex items-center text-emerald-400 text-xs font-bold space-x-1">
                    <TrendingUp size={14} />
                    <span>Based on {stats.count} saved scenarios</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:border-brand-200 transition-all flex flex-col justify-between group">
                <div>
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                    <ShieldCheck size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">
                    Safety Buffer
                  </span>
                  <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                    {CalculationUtils.formatCurrency(stats.totalBuffer)}
                  </p>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-4">
                  Future Reserve
                </p>
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:border-brand-200 transition-all flex flex-col justify-between group">
                <div>
                  <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-600 group-hover:text-white transition-all duration-500">
                    <Zap size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">
                    Avg Hourly Rate
                  </span>
                  <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                    {CalculationUtils.formatCurrency(Math.round(stats.avgRate))}
                  </p>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-4">
                  Market Position
                </p>
              </div>
            </div>

            {/* CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* REVENUE TREND */}
              <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-100 p-8 md:p-10 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center">
                      <BarChart3 size={20} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">
                      Revenue Performance
                    </h3>
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Monthly Billing Trend
                  </div>
                </div>

                <div className="h-[350px] w-full min-w-0">
                  {isMounted && (
                    <ResponsiveContainer
                      width="99%"
                      height="100%"
                      debounce={100}
                    >
                      <AreaChart data={monthlyData}>
                        <defs>
                          <linearGradient
                            id="colorValue"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#6366f1"
                              stopOpacity={0.1}
                            />
                            <stop
                              offset="95%"
                              stopColor="#6366f1"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 10,
                            fontWeight: 700,
                            fill: "#64748b",
                          }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 10,
                            fontWeight: 700,
                            fill: "#64748b",
                          }}
                          tickFormatter={(value: number) => `${value / 1000}k`}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "16px",
                            border: "none",
                            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                            fontSize: "12px",
                          }}
                          formatter={(value: number | undefined) => [
                            CalculationUtils.formatCurrency(Number(value || 0)),
                            "Revenue",
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#6366f1"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorValue)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* DISTRIBUTION PIE */}
              <div className="bg-white rounded-[3rem] border border-slate-100 p-8 md:p-10 shadow-sm flex flex-col">
                <div className="flex items-center space-x-3 mb-10">
                  <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center">
                    <PieChartIcon size={20} />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-xl font-black text-slate-900">
                      80/20 Efficiency
                    </h3>
                    <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mt-0.5">
                      Average performance profile
                    </p>
                  </div>
                </div>

                <div className="h-[300px] w-full relative mb-8 min-w-0">
                  {isMounted && (
                    <ResponsiveContainer width="99%" height="100%">
                      <PieChart>
                        <Pie
                          data={distributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {distributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: "16px",
                            border: "none",
                            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                          }}
                          formatter={(value: number | undefined) =>
                            CalculationUtils.formatCurrency(Number(value || 0))
                          }
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                  {/* Center Text Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      Your Average
                    </span>
                    <span className="text-2xl font-black text-slate-900 mt-1">
                      80/20
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mt-auto">
                  {distributionData.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-xs font-bold text-slate-500">
                          Avg. {item.name}
                        </span>
                      </div>
                      <span className="text-xs font-black text-slate-900 font-mono">
                        {CalculationUtils.formatCurrency(item.value)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                  <div className="flex items-start space-x-3">
                    <HelpCircle
                      size={14}
                      className="text-slate-400 mt-0.5 shrink-0"
                    />
                    <p className="text-[10px] leading-relaxed text-slate-500 font-medium">
                      This represents your{" "}
                      <span className="text-slate-900 font-bold">
                        typical revenue split
                      </span>
                      . It averages every simulation to show how much actually
                      stays in your pocket vs. overhead and taxes.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM GRID - ADDITIONAL CONTEXT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-brand-50 rounded-[2.5rem] border border-brand-100/50 flex items-start space-x-6">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-brand-600 shadow-sm shrink-0">
                  <Briefcase size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900 mb-1">
                    Consulting Health
                  </h4>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">
                    Your average hourly rate of{" "}
                    <span className="text-brand-600 font-bold">
                      {CalculationUtils.formatCurrency(
                        Math.round(stats.avgRate)
                      )}
                    </span>{" "}
                    is strong. Consistency in your billing is the key to
                    maintaining a long-term safety buffer.
                  </p>
                </div>
              </div>

              <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100/50 flex items-start space-x-6">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                  <DollarSign size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900 mb-1">
                    Financial Freedom
                  </h4>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">
                    You have projected a total net take-home of{" "}
                    <span className="text-emerald-600 font-bold">
                      {CalculationUtils.formatCurrency(stats.totalNet)}
                    </span>{" "}
                    across your simulations. Great job optimizing your
                    distribution!
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Insights;
