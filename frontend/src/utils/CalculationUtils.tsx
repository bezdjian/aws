import { SalaryCalculation } from "../types";

class CalculationUtils {
  static calculateRemainingSalary(formData: SalaryCalculation): number {
    const { hourly_rate, hours_worked, save_to_buffer } = formData;
    const invoiced = hourly_rate * hours_worked;
    const afterDed = invoiced * 0.8;
    const gross = afterDed - save_to_buffer;
    const calculatedTotalCosts = CalculationUtils.calculateTotalCosts(formData);
    const remainingSalary = gross - calculatedTotalCosts;
    return remainingSalary;
  }

  static calculateRemainingForGrossSalary(formData: SalaryCalculation): number {
    const { hourly_rate, hours_worked, save_to_buffer } = formData;
    const invoiced = hourly_rate * hours_worked;
    const afterDed = invoiced * 0.8;
    const gross = afterDed - save_to_buffer;
    const calculatedTotalCosts = CalculationUtils.calculateTotalCosts(formData);
    const remainingSalary = gross - calculatedTotalCosts;
    const remainingForGrossSalary = remainingSalary / 1.3142;
    return parseFloat(remainingForGrossSalary.toFixed(0));
  }

  static calculateEmployerFee(formData: SalaryCalculation): number {
    const { hourly_rate, hours_worked, save_to_buffer } = formData;
    const invoiced = hourly_rate * hours_worked;
    const afterDed = invoiced * 0.8;
    const gross = afterDed - save_to_buffer;
    const calculatedTotalCosts = CalculationUtils.calculateTotalCosts(formData);
    const remainingSalary = gross - calculatedTotalCosts;
    const remainingForGrossSalary = remainingSalary / 1.3142;
    const employerFee = remainingForGrossSalary * 0.3142;
    return parseFloat(employerFee.toFixed(0));
  }

  static calculateInvoicedAmount(formData: SalaryCalculation): number {
    const { hourly_rate, hours_worked } = formData;
    const invoiced = hourly_rate * hours_worked;
    return invoiced;
  }

  static calculateAfterDeduction(formData: SalaryCalculation): number {
    const { hourly_rate, hours_worked } = formData;
    const invoiced = hourly_rate * hours_worked;
    const afterDed = invoiced * 0.8;
    return afterDed;
  }

  static calculateGrossSalary(formData: SalaryCalculation): number {
    const { hourly_rate, hours_worked, save_to_buffer } = formData;
    const invoiced = hourly_rate * hours_worked;
    const afterDed = invoiced * 0.8;
    const gross = afterDed - save_to_buffer;
    return gross;
  }

  static calculateTotalCosts(formData: SalaryCalculation): number {
    const { pension_saving } = formData;

    // Swedish Fixed Cost Parameters
    const premiumExemption = 42.27;
    const healthInsurance = 144.87;
    const healthInsuranceKClass = 328;
    const healthCareDoc = 197;

    const healthCareDocTax = Math.round(healthCareDoc * 0.3142);
    const pensionPlan = Math.round(
      pension_saving + premiumExemption + healthInsurance
    );
    const pensionSavingTax = Math.round(pensionPlan * 0.2426);

    return (
      pensionPlan + pensionSavingTax + healthInsuranceKClass + healthCareDocTax
    );
  }

  static calculateRequiredHourlyRate(
    targetGrossSalary: number,
    hoursWorked: number,
    saveToBuffer: number,
    pensionSaving: number
  ): number {
    // We use the same fixed costs logic
    const dummyFormData = {
      hourly_rate: 0,
      hours_worked: hoursWorked,
      save_to_buffer: saveToBuffer,
      pension_saving: pensionSaving,
      gross_salary: targetGrossSalary,
    } as SalaryCalculation;

    const fixedCosts = CalculationUtils.calculateTotalCosts(dummyFormData);

    // G = (invoiced * 0.8 - saveToBuffer - fixedCosts) / 1.3142
    // invoiced * 0.8 = G * 1.3142 + saveToBuffer + fixedCosts
    // invoiced = (G * 1.3142 + saveToBuffer + fixedCosts) / 0.8

    const requiredInvoiced =
      (targetGrossSalary * 1.3142 + saveToBuffer + fixedCosts) / 0.8;
    const requiredHourlyRate = requiredInvoiced / hoursWorked;

    return Math.ceil(requiredHourlyRate);
  }

  static formatCurrency(amount?: number) {
    if (amount === undefined) return "0 SEK";
    return new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency: "SEK",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  static calculateVacationReadiness(
    totalBuffer: number,
    desiredGrossSalary: number,
    avgPension: number,
    targetVacationWeeks: number,
    publicHolidays: number
  ) {
    const fixedCosts = CalculationUtils.calculateTotalCosts({
      pension_saving: avgPension || 3000,
    } as any);

    const totalMonthlyCost = desiredGrossSalary * 1.3142 + fixedCosts;
    const totalDailyCost = totalMonthlyCost / 21.67;

    const targetVacationDays = targetVacationWeeks * 5;
    const totalHolidayDays = targetVacationDays + publicHolidays;

    const annualVacationCost = totalHolidayDays * totalDailyCost;

    const fundedVacationDays = Math.min(
      totalBuffer / totalDailyCost,
      totalHolidayDays
    );
    const progress = (fundedVacationDays / totalHolidayDays) * 100;

    const vacationMonths = totalHolidayDays / 21.67;
    const workingMonths = 12 - vacationMonths;
    const requiredMonthlyBufferSaving = annualVacationCost / workingMonths;

    return {
      fundedVacationWeeks: fundedVacationDays / 5,
      targetVacationWeeks,
      fundedVacationDays,
      totalHolidayDays,
      progress,
      monthlySurcharge: requiredMonthlyBufferSaving,
      annualVacationCost,
      totalDailyCost,
    };
  }

  static calculateTaxEfficiency(grossSalary: number) {
    // 2025 Swedish Tax Thresholds (approximate)
    const STATE_TAX_THRESHOLD_MONTHLY = 52750; // 633,000 / 12
    const PENSION_MAX_THRESHOLD_MONTHLY = 51000; // Roughly 8.07 * IBB

    const isOverThreshold = grossSalary > STATE_TAX_THRESHOLD_MONTHLY;
    const diffToThreshold = STATE_TAX_THRESHOLD_MONTHLY - grossSalary;

    let status: "optimal" | "warning" | "danger" = "optimal";
    let message = "";

    if (isOverThreshold) {
      status = "danger";
      message = `You are ${CalculationUtils.formatCurrency(
        -diffToThreshold
      )} over the state tax threshold. You pay 20% extra tax on the portion above ${CalculationUtils.formatCurrency(
        STATE_TAX_THRESHOLD_MONTHLY
      )}.`;
    } else if (Math.abs(diffToThreshold) < 3000) {
      status = "warning";
      message = `You are very close to the state tax threshold (${CalculationUtils.formatCurrency(
        STATE_TAX_THRESHOLD_MONTHLY
      )}). Consider increasing buffer savings or pension to stay in the safe zone.`;
    } else {
      status = "optimal";
      message = `Your salary is in the "Safe Zone". You are ${CalculationUtils.formatCurrency(
        diffToThreshold
      )} below the state tax threshold.`;
    }

    return {
      status,
      message,
      threshold: STATE_TAX_THRESHOLD_MONTHLY,
      pensionThreshold: PENSION_MAX_THRESHOLD_MONTHLY,
      isOverThreshold,
      diffToThreshold,
    };
  }
}

export default CalculationUtils;
