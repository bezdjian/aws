package insurancecalculation.service;

import com.amazonaws.services.lambda.runtime.LambdaLogger;
import insurancecalculation.model.InsurancePremiumRequest;
import insurancecalculation.model.InsurancePremiumResponse;
import insurancecalculation.util.InsuranceValues;
import lombok.experimental.UtilityClass;

import java.math.RoundingMode;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.util.Locale;

@UtilityClass
public class InsurancePremiumService {

    public InsurancePremiumResponse calculateInsurancePremium(InsurancePremiumRequest request, LambdaLogger logger) {

        logger.log("Calculate monthly income insurance premium");
        double incomeInsuranceValue = InsuranceValues.getIncomeInsuranceValue(request.getAge());
        double monthlyIncomeInsurancePremium = request.getInsurableAmount() * incomeInsuranceValue;

        logger.log("Calculate monthly life insurance premium");
        double lifeInsuranceValue = InsuranceValues.getLifeInsuranceValue(request.getAge());
        double monthlyLifeInsurancePremium = request.getLoanAmount() * lifeInsuranceValue;

        logger.log("Calculate total monthly premium");
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
