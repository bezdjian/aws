import React, { useState, useEffect } from "react";
import {
  Calculator,
  Calendar,
  Coins,
  Clock,
  PiggyBank,
  TrendingUp,
} from "lucide-react";
import CalculationUtils from "./utils/CalculationUtils";
import { SalaryCalculation } from "./types";
import Login from "./components/Login";
import { useUser } from "./context/UserContext";
import { useNavigate } from "react-router-dom";

const LandingPage: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/home", { replace: true });
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState<SalaryCalculation>({
    hourly_rate: 800,
    hours_worked: 160,
    invoiced_amount: 128000,
    after_deduction: 102400,
    save_to_buffer: 10000,
    gross_salary: 92400,
    pension_saving: 3000,
    remaining_salary: 0,
    remaining_for_gross_salary: 0,
    employer_fee: 0,
    date: new Date().toISOString().split("T")[0],
  });

  // Derived calculations
  useEffect(() => {
    // Core Billing Calculations
    const invoiced = CalculationUtils.calculateInvoicedAmount(formData);
    const afterDed = CalculationUtils.calculateAfterDeduction(formData);
    const gross = afterDed - formData.save_to_buffer;

    // Calculate remaining salary and employer fee
    const remainingSalary = CalculationUtils.calculateRemainingSalary(formData);
    const remainingForGrossSalary =
      CalculationUtils.calculateRemainingForGrossSalary(formData);
    const employerFee = CalculationUtils.calculateEmployerFee(formData);

    // Update state once with all derived values
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submission Data:", formData);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* LEFT SECTION: Branding & Auth */}
      <section className="md:w-[42%] bg-white p-8 md:p-16 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-50 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-100 rounded-full blur-3xl opacity-40"></div>

        <header className="relative z-10 flex items-center space-x-3 mb-16">
          <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
            <Calculator size={22} strokeWidth={2.5} />
          </div>
          <span className="font-extrabold text-2xl tracking-tighter text-slate-800">
            EightyTwenty.
          </span>
        </header>

        <div className="relative z-10 max-w-md">
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-8 leading-[1.1] tracking-tight">
            Finance for the <span className="text-brand-600">Free.</span>
          </h1>
          <p className="text-xl text-slate-500 mb-12 leading-relaxed font-medium">
            The all-in-one terminal for consultants. Automate your tax buffers,
            calculate your real take-home pay with the 80/20 model.
          </p>

          <div className="space-y-4">
            <Login />
            {/*<button className="btn-outline group p-4">
              <img
                src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png"
                alt="Google"
                className="w-5 h-5"
              />
              <span>Sign in with Google</span>
              <ArrowRight
                size={18}
                className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
              />
            </button>
            <p className="text-slate-500 text-xs">
              Sign in with your organisation's Google account
            </p>*/}
          </div>
        </div>

        <footer className="relative z-10 mt-10 pt-2 border-t border-slate-100 hidden md:block">
          <div className="flex space-x-6 grayscale opacity-40">
            <span className="font-medium text-sm text-slate-700">
              By EightyTwenty AB.
            </span>
          </div>
        </footer>
      </section>

      {/* RIGHT SECTION: Calculation Form */}
      <section className="md:w-[58%] bg-white p-8 md:p-16 flex flex-col">
        <div className="w-full max-w-2xl">
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-50">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Guest Mode • Figures in SEK
              </h2>
            </div>
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
              <Calendar size={20} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Input Fields */}
              <div className="space-y-1">
                <label className="input-label flex items-center">
                  <Coins size={12} className="mr-1" /> Hourly Rate (SEK)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="hourly_rate"
                    value={formData.hourly_rate}
                    onChange={handleChange}
                    className="input-field font-mono"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="input-label flex items-center">
                  <Clock size={12} className="mr-1" /> Monthly Hours
                </label>
                <input
                  type="number"
                  name="hours_worked"
                  value={formData.hours_worked}
                  onChange={handleChange}
                  className="input-field font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="input-label flex items-center">
                  <PiggyBank size={12} className="mr-1" /> Buffer Savings
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="save_to_buffer"
                    value={formData.save_to_buffer}
                    onChange={handleChange}
                    className="input-field font-mono text-brand-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="input-label flex items-center">
                  <TrendingUp size={12} className="mr-1" /> Pension Saving
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="pension_saving"
                    value={formData.pension_saving}
                    onChange={handleChange}
                    className="input-field font-mono text-slate-500"
                  />
                </div>
              </div>

              {/* Dynamic Stats Row */}
              <div className="col-span-full grid grid-cols-3 gap-4 pt-4">
                <div className="p-5 rounded-2xl bg-brand-50 text-brand-700 border border-brand-100">
                  <span className="text-[10px] font-black uppercase text-brand-400 block mb-1">
                    Invoiced Amount
                  </span>
                  <div className="text-xl font-bold font-mono leading-none">
                    {CalculationUtils.formatCurrency(formData.invoiced_amount)}
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-slate-100 text-slate-900 border border-slate-200">
                  <span className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                    After Deduction (80%)
                  </span>
                  <div className="text-xl font-bold font-mono text-slate-400 leading-none">
                    {CalculationUtils.formatCurrency(formData.after_deduction)}
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-brand-50 text-brand-700 border border-brand-100">
                  <span className="text-[10px] font-black uppercase text-brand-400 block mb-1">
                    Gross Salary Basis
                  </span>
                  <div className="text-xl font-bold font-mono leading-none">
                    {CalculationUtils.formatCurrency(formData.gross_salary)}
                  </div>
                </div>
              </div>

              {/* Total Costs Results */}
              <div className="p-5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                <span className="text-[10px] font-black uppercase text-emerald-500 block mb-1">
                  Remaining Salary after fixed costs
                </span>
                <div className="text-xl font-bold font-mono leading-none">
                  {CalculationUtils.formatCurrency(formData.remaining_salary)}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-100 text-slate-900 border border-slate-200">
                <span className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                  Employer Fee
                </span>
                <div className="text-xl font-bold font-mono text-slate-400 leading-none">
                  {CalculationUtils.formatCurrency(formData.employer_fee)}
                </div>
              </div>

              <div className="col-span-full grid grid-cols-1 gap-4 pt-4">
                <div className="p-5 rounded-2xl text-center bg-emerald-50 text-emerald-700 border border-emerald-100 w-full">
                  <span className="text-[10px] font-black uppercase text-emerald-500 block mb-1">
                    Remaining Salary for Gross Salary
                  </span>
                  <div className="text-xl font-bold font-mono leading-none">
                    {CalculationUtils.formatCurrency(
                      formData.remaining_for_gross_salary
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">
            Precision Financial Modeling v1.0
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
