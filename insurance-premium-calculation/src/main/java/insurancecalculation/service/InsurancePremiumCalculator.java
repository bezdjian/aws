package insurancecalculation.service;

import com.amazonaws.services.lambda.runtime.LambdaLogger;
import insurancecalculation.model.InsurancePremiumRequest;
import insurancecalculation.model.InsurancePremiumResponse;
import lombok.experimental.UtilityClass;

import java.math.RoundingMode;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.util.Locale;
import java.util.Map;

@UtilityClass
public class InsurancePremiumCalculator {

    private final String INCOME_INSURANCE = "TRYGG";
    private final String LIFE_INSURANCE = "LIV";

    public InsurancePremiumResponse calculate(InsurancePremiumRequest request,
            Map<String, String> insuranceTypesWithValues, LambdaLogger logger) {

        logger.log("\nCalculate monthly income insurance premium");
        double incomeInsuranceValue = Double.parseDouble(insuranceTypesWithValues.get(INCOME_INSURANCE));
        double monthlyIncomeInsurancePremium = request.getInsurableAmount() * incomeInsuranceValue;

        logger.log("\nCalculate monthly life insurance premium");
        double lifeInsuranceValue = Double.parseDouble(insuranceTypesWithValues.get(LIFE_INSURANCE));
        double monthlyLifeInsurancePremium = request.getLoanAmount() * lifeInsuranceValue;

        logger.log("\nCalculate total monthly premium\n");
        double totalMonthlyPremium = monthlyLifeInsurancePremium + monthlyIncomeInsurancePremium;

        DecimalFormat formatter = createDecimalFormatter();

        String monthlyLifeInsurancePremiumFormatted = formatter.format(monthlyLifeInsurancePremium);

        return InsurancePremiumResponse.builder()
                .monthlyLifeInsurancePremium(Double.valueOf(monthlyLifeInsurancePremiumFormatted))
                .monthlyIncomeInsurancePremium(Double.valueOf(formatter.format(monthlyIncomeInsurancePremium)))
                .totalMonthlyPremium(Double.valueOf(formatter.format(totalMonthlyPremium)))
                .build();
    }

    private DecimalFormat createDecimalFormatter() {
        NumberFormat nf = NumberFormat.getNumberInstance(Locale.US);
        DecimalFormat formatter = (DecimalFormat) nf;
        formatter.applyPattern("#.##");
        formatter.setRoundingMode(RoundingMode.HALF_UP);
        return formatter;
    }
}
