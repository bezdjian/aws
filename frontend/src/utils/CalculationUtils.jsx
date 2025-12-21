class CalculationUtils {

    static calculateRemainingSalary(formData) {
        const { hourly_rate, hours_worked, save_to_buffer } = formData;
        const invoiced = hourly_rate * hours_worked;
        const afterDed = invoiced * 0.8;
        const gross = afterDed - save_to_buffer;
        const calculatedTotalCosts = CalculationUtils.calculateTotalCosts(formData);
        const remainingSalary = gross - calculatedTotalCosts;
        return remainingSalary;
    }

    static calculateRemainingForGrossSalary(formData) {
        const { hourly_rate, hours_worked, save_to_buffer } = formData;
        const invoiced = hourly_rate * hours_worked;
        const afterDed = invoiced * 0.8;
        const gross = afterDed - save_to_buffer;
        const calculatedTotalCosts = CalculationUtils.calculateTotalCosts(formData);
        const remainingSalary = gross - calculatedTotalCosts;
        const remainingForGrossSalary = remainingSalary / 1.3142;
        return remainingForGrossSalary;
    }

    static calculateEmployerFee(formData) {
        const { hourly_rate, hours_worked, save_to_buffer } = formData;
        const invoiced = hourly_rate * hours_worked;
        const afterDed = invoiced * 0.8;
        const gross = afterDed - save_to_buffer;
        const calculatedTotalCosts = CalculationUtils.calculateTotalCosts(formData);
        const remainingSalary = gross - calculatedTotalCosts;
        const remainingForGrossSalary = remainingSalary / 1.3142;
        const employerFee = remainingForGrossSalary * 0.3142;
        return employerFee;
    }

    static calculateInvoicedAmount(formData) {
        const { hourly_rate, hours_worked } = formData;
        const invoiced = hourly_rate * hours_worked;
        return invoiced;
    }

    static calculateAfterDeduction(formData) {
        const { hourly_rate, hours_worked } = formData;
        const invoiced = hourly_rate * hours_worked;
        const afterDed = invoiced * 0.8;
        return afterDed;
    }

    static calculateGrossSalary(formData) {
        const { hourly_rate, hours_worked, save_to_buffer } = formData;
        const invoiced = hourly_rate * hours_worked;
        const afterDed = invoiced * 0.8;
        const gross = afterDed - save_to_buffer;
        return gross;
    }
    static calculateTotalCosts(formData) {
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
}

export default CalculationUtils;