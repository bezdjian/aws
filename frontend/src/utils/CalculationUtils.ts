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
        const pensionPlan = Math.round(pension_saving + premiumExemption + healthInsurance);
        const pensionSavingTax = Math.round(pensionPlan * 0.2426);

        return pensionPlan + pensionSavingTax + healthInsuranceKClass + healthCareDocTax;
    }

    static calculateRequiredHourlyRate(targetGrossSalary: number, hoursWorked: number, saveToBuffer: number, pensionSaving: number): number {
        // We use the same fixed costs logic
        const dummyFormData = {
            hourly_rate: 0,
            hours_worked: hoursWorked,
            save_to_buffer: saveToBuffer,
            pension_saving: pensionSaving,
            gross_salary: targetGrossSalary
        } as SalaryCalculation;
        
        const fixedCosts = CalculationUtils.calculateTotalCosts(dummyFormData);
        
        // G = (invoiced * 0.8 - saveToBuffer - fixedCosts) / 1.3142
        // invoiced * 0.8 = G * 1.3142 + saveToBuffer + fixedCosts
        // invoiced = (G * 1.3142 + saveToBuffer + fixedCosts) / 0.8
        
        const requiredInvoiced = (targetGrossSalary * 1.3142 + saveToBuffer + fixedCosts) / 0.8;
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
}

export default CalculationUtils;