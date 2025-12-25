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
  Sparkles,
  BrainCircuit,
  X,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import { useUser } from "../context/UserContext";
import { getCalculationsByEmail, getInsightStats } from "../backend/service";
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
import { exportInsightsSummary } from "../utils/ExportUtils";
import { useTheme } from "../context/ThemeContext";

const Insights: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user, isLoading: userLoading } = useUser();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [calculations, setCalculations] = useState<SalaryCalculation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [statsResult, setStatsResult] = useState<string>(
    () => localStorage.getItem("ai_insights_cache") || ""
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
    const totalGrossSalary = calculations.reduce(
      (acc, curr) => acc + (curr.remaining_for_gross_salary || 0),
      0
    );
    const totalBuffer = calculations.reduce(
      (acc, curr) => acc + (curr.save_to_buffer || 0),
      0
    );

    const totalHourlyRate = calculations.reduce(
      (acc, curr) => acc + (curr.hourly_rate || 0),
      0
    );

    const avgRate =
      calculations.length > 0
        ? calculations.reduce((acc, curr) => acc + (curr.hourly_rate || 0), 0) /
          calculations.length
        : 0;

    const clientNames = calculations.map(
      (calc) => calc.client_name || "Unknown Client"
    );
    const uniqueClientNames = [...new Set(clientNames)];
    const clientCount = uniqueClientNames.length;

    return {
      totalInvoiced,
      totalGrossSalary,
      totalBuffer,
      avgRate,
      totalHourlyRate,
      count: calculations.length,
      clientCount,
      clientNames: uniqueClientNames,
    };
  }, [calculations]);

  // 1.5 Client-specific Stats
  const clientStats = useMemo(() => {
    const groups: Record<
      string,
      {
        count: number;
        totalInvoiced: number;
        totalBuffer: number;
        avgRate: number;
        totalGross: number;
      }
    > = {};

    calculations.forEach((calc) => {
      const name = calc.client_name || "Unknown Client";
      if (!groups[name]) {
        groups[name] = {
          count: 0,
          totalInvoiced: 0,
          totalBuffer: 0,
          avgRate: 0,
          totalGross: 0,
        };
      }
      groups[name].count += 1;
      groups[name].totalInvoiced += calc.invoiced_amount || 0;
      groups[name].totalBuffer += calc.save_to_buffer || 0;
      groups[name].totalGross += calc.remaining_for_gross_salary || 0;
      groups[name].avgRate += calc.hourly_rate || 0;
    });

    return Object.entries(groups)
      .map(([name, data]) => ({
        name,
        ...data,
        avgRate: data.avgRate / data.count,
      }))
      .sort((a, b) => b.totalInvoiced - a.totalInvoiced);
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

    const avgTotalInvoiced = totalInvoiced / count;
    const avgBuffer = totalBuffer / count;
    const avgGross = totalGross / count;
    const avgSocialPension = totalSocialPension / count;

    return [
      { name: "Invoiced", value: avgTotalInvoiced, color: "#6366f1" }, // brand-500
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

    exportInsightsSummary(stats, monthlyData, distributionData);
    showToast("Insights Summary exported successfully", "success");
  };

  const analyzeStats = async () => {
    try {
      setIsAnalyzing(true);
      const insightStats = {
        total_gross_salary: stats.totalGrossSalary,
        total_invoiced: stats.totalInvoiced,
        hourly_rate: stats.totalHourlyRate,
        total_buffer: stats.totalBuffer,
        count: stats.count,
      };
      const aiResponse = await getInsightStats(insightStats);
      const result = aiResponse.data.response;
      setStatsResult(result);
      localStorage.setItem("ai_insights_cache", result);
    } catch (error) {
      showToast("Failed to analyze stats. Please try again.", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center space-y-4 font-sans transition-colors duration-300">
        <div className="w-12 h-12 border-4 border-slate-100 dark:border-slate-800 border-t-brand-600 rounded-full animate-spin"></div>
        <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs">
          Generating Insights...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans selection:bg-brand-100 pb-20 transition-colors duration-300">
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
            <div className="h-8 w-px bg-slate-100"></div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-600/20">
                <TrendingUp size={20} />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white leading-none">
                  Financial Insights
                </h1>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">
                  Analytics Dashboard
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={analyzeStats}
              disabled={isAnalyzing}
              className="flex items-center space-x-2 px-5 py-2.5 bg-slate-900 dark:bg-brand-600 text-white rounded-2xl font-black text-sm hover:bg-slate-800 dark:hover:bg-brand-500 transition-all shadow-lg shadow-slate-900/10 group active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isAnalyzing ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Sparkles
                  className="text-brand-400 group-hover:text-brand-300 transition-colors"
                  size={18}
                />
              )}
              <span className="hidden sm:block">
                {isAnalyzing ? "Analyzing..." : "AI Financial Review"}
              </span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-2 px-5 py-2.5 bg-brand-600 text-white rounded-2xl font-black text-sm hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 cursor-pointer"
            >
              <FileDown size={18} />
              <span className="hidden sm:block">Export Data</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-8 w-full">
        {calculations.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-20 text-center border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              No data yet
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8 font-medium">
              Create and save simulations to see your financial trends and
              performance metrics here.
            </p>
            <button
              onClick={() => navigate("/home")}
              className="px-8 py-4 bg-brand-600 text-white rounded-2xl font-black hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 active:scale-95 cursor-pointer"
            >
              Start Calculating
            </button>
          </div>
        ) : (
          <>
            {/* HERO STATS - BENTO GRID */}
            {/* AI ANALYSIS SECTION */}
            {(isAnalyzing || statsResult) && (
              <div className="relative overflow-hidden bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-brand-100 dark:border-brand-500/30 rounded-[2.5rem] p-8 mb-8 animate-in fade-in slide-in-from-top-4 duration-700 shadow-xl shadow-brand-500/5 dark:shadow-brand-500/10 group">
                {/* Background Sparkle Decoration */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-500/10 dark:bg-brand-500/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-brand-500/15 transition-colors duration-700"></div>

                <div className="flex flex-col md:flex-row gap-6 relative z-10">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-brand-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-600/30">
                      {isAnalyzing ? (
                        <Loader2 className="animate-spin" size={24} />
                      ) : (
                        <BrainCircuit size={24} />
                      )}
                    </div>
                  </div>

                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                          AI Financial Analyst
                        </h3>
                        <div className="px-2 py-0.5 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-brand-100 dark:border-brand-800/50 italic">
                          80/20 Expert
                        </div>
                      </div>
                      {statsResult && !isAnalyzing && (
                        <button
                          onClick={() => {
                            setStatsResult("");
                            localStorage.removeItem("ai_insights_cache");
                          }}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>

                    {isAnalyzing ? (
                      <div className="space-y-3">
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-[90%] animate-pulse"></div>
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-[70%] animate-pulse"></div>
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-[80%] animate-pulse"></div>
                      </div>
                    ) : (
                      <div className="prose prose-slate dark:prose-invert max-w-none prose-p:mb-4 prose-p:last:mb-0 prose-strong:text-slate-900 dark:prose-strong:text-white prose-strong:font-black prose-ul:list-disc prose-ul:pl-5 prose-li:mb-1">
                        <div
                          className="text-slate-600 dark:text-slate-300 font-medium text-sm leading-relaxed ai-html-content"
                          dangerouslySetInnerHTML={{ __html: statsResult }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="absolute bottom-4 right-8 flex items-center gap-1.5 pointer-events-none opacity-40">
                  <Sparkles size={12} className="text-brand-600" />
                  <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400 italic">
                    Powered by eighty-twenty AI
                  </span>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-2 bg-slate-900 dark:bg-brand-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-slate-900/10 dark:shadow-brand-900/20 group transition-colors duration-300">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="relative z-10">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-brand-200/60 mb-2 block">
                    Accumulated Billing
                  </span>
                  <div className="text-5xl font-black font-mono tracking-tighter mb-4">
                    {CalculationUtils.formatCurrency(stats.totalInvoiced)}
                  </div>
                  <div className="flex items-center text-emerald-400 dark:text-emerald-300 text-xs font-bold space-x-1">
                    <TrendingUp size={14} />
                    <span>Based on {stats.count} saved scenarios</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm hover:border-brand-200 dark:hover:border-brand-500 transition-all flex flex-col justify-between group">
                <div>
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                    <ShieldCheck size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest block mb-1">
                    Total Safety Buffer
                  </span>
                  <p className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                    {CalculationUtils.formatCurrency(stats.totalBuffer)}
                  </p>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-4">
                  Future Reserve
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm hover:border-brand-200 dark:hover:border-brand-500 transition-all flex flex-col justify-between group">
                <div>
                  <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-600 group-hover:text-white transition-all duration-500">
                    <Zap size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest block mb-1">
                    Avg Hourly Rate
                  </span>
                  <p className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                    {CalculationUtils.formatCurrency(Math.round(stats.avgRate))}
                  </p>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-4">
                  Market Position
                </p>
              </div>
            </div>

            {/* CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* REVENUE TREND */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-8 md:p-10 shadow-sm transition-colors duration-300">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl flex items-center justify-center">
                      <BarChart3 size={20} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      Revenue Performance
                    </h3>
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
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
                          stroke={isDark ? "#1e293b" : "#f1f5f9"}
                        />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 10,
                            fontWeight: 700,
                            fill: isDark ? "#475569" : "#64748b",
                          }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 10,
                            fontWeight: 700,
                            fill: isDark ? "#475569" : "#64748b",
                          }}
                          tickFormatter={(value: number) => `${value / 1000}k`}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "16px",
                            backgroundColor: isDark ? "#0f172a" : "#ffffff",
                            border: "none",
                            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                            fontSize: "12px",
                            color: isDark ? "#f1f5f9" : "#0f172a",
                          }}
                          itemStyle={{
                            color: isDark ? "#f1f5f9" : "#0f172a",
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
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-8 md:p-10 shadow-sm flex flex-col transition-colors duration-300">
                <div className="flex items-center space-x-3 mb-10">
                  <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl flex items-center justify-center">
                    <PieChartIcon size={20} />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      80/20 Efficiency
                    </h3>
                    <p className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest mt-0.5">
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
                            backgroundColor: isDark ? "#0f172a" : "#ffffff",
                            border: "none",
                            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                            color: isDark ? "#f1f5f9" : "#0f172a",
                          }}
                          itemStyle={{
                            color: isDark ? "#f1f5f9" : "#0f172a",
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
                    <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">
                      Your Average
                    </span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white mt-1">
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
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          Avg. {item.name}
                        </span>
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-slate-100 font-mono">
                        {CalculationUtils.formatCurrency(item.value)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100/50 dark:border-slate-700/50">
                  <div className="flex items-start space-x-3">
                    <HelpCircle
                      size={14}
                      className="text-slate-400 dark:text-slate-500 mt-0.5 shrink-0"
                    />
                    <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                      This represents your{" "}
                      <span className="text-slate-900 dark:text-white font-bold">
                        typical revenue split
                      </span>
                      . It averages every simulation to show how much actually
                      stays in your pocket vs. overhead and taxes.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CLIENT BREAKDOWN SECTION */}
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-8 md:p-10 shadow-sm transition-colors duration-300">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-xl flex items-center justify-center">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      Client Performance Breakdown
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                      Revenue and metrics grouped by client
                    </p>
                  </div>
                </div>
                <div className="px-4 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700 flex items-center space-x-2">
                  <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></span>
                  <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-tight">
                    {stats.clientCount} Active Clients
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">
                      <th className="px-6 py-4">Client Name</th>
                      <th className="px-6 py-4">Simulations</th>
                      <th className="px-6 py-4">Total Invoiced</th>
                      <th className="px-6 py-4">Avg Rate</th>
                      <th className="px-6 py-4">Contribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientStats.map((client, idx) => (
                      <tr
                        key={idx}
                        className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all rounded-2xl"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-xs group-hover:bg-brand-100 dark:group-hover:bg-brand-900/40 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                              {client.name.charAt(0)}
                            </div>
                            <span className="text-sm font-black text-slate-900 dark:text-white">
                              {client.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-500 dark:text-slate-400">
                          {client.count}
                        </td>
                        <td className="px-6 py-4 text-sm font-black text-slate-900 dark:text-white font-mono">
                          {CalculationUtils.formatCurrency(
                            client.totalInvoiced
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-500 dark:text-slate-400 font-mono">
                          {CalculationUtils.formatCurrency(
                            Math.round(client.avgRate)
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex-grow bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden max-w-[100px]">
                              <div
                                className="bg-brand-500 h-full rounded-full"
                                style={{
                                  width: `${
                                    (client.totalInvoiced /
                                      stats.totalInvoiced) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500">
                              {Math.round(
                                (client.totalInvoiced / stats.totalInvoiced) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* BOTTOM GRID - ADDITIONAL CONTEXT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-brand-50 dark:bg-brand-900/20 rounded-[2.5rem] border border-brand-100/50 dark:border-brand-800/50 flex items-start space-x-6 transition-colors duration-300">
                <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-brand-600 dark:text-brand-400 shadow-sm shrink-0">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white mb-1">
                    Buffer Reliability
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                    Across all clients, your average safety buffer is{" "}
                    <span className="text-brand-600 dark:text-brand-400 font-bold">
                      {CalculationUtils.formatCurrency(
                        Math.round(stats.totalBuffer / (stats.count || 1))
                      )}
                    </span>{" "}
                    per simulation.
                  </p>
                </div>
              </div>

              <div className="p-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-[2.5rem] border border-emerald-100/50 dark:border-emerald-800/50 flex items-start space-x-6 transition-colors duration-300">
                <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm shrink-0">
                  <DollarSign size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white mb-1">
                    Financial Freedom
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                    You have projected a total gross salary of{" "}
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {CalculationUtils.formatCurrency(stats.totalGrossSalary)}
                    </span>{" "}
                    across your simulations.
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
