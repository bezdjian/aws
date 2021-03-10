package insurancecalculation.util;

import lombok.experimental.UtilityClass;

@UtilityClass
public class InsuranceValues {

    public double getLifeInsuranceValue(Long age) {
        if (age == 18 || age == 19) {
            return 0.00003304;
        } else if (age == 20) {
            return 0.00003355;
        } else if (age == 21) {
            return 0.00003406;
        } else if (age == 22) {
            return 0.00003506;
        }
        return 0.0;
    }

    public double getIncomeInsuranceValue(Long age) {
        double tariff = 0.0;
        if (age >= 18 && age <= 25) {
            tariff = 0.03475;
        } else if (age >= 26 && age <= 30) {
            tariff = 0.03476;
        } else if (age >= 31 && age <= 35) {
            tariff = 0.03514;
        }
        return tariff;
    }
}
