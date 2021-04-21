package insurancecalculation.model;

import insurancecalculation.exception.InsuranceException;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InsurancePremiumRequest {
    Long age;
    Long loanAmount;
    Long insurableAmount;

    public void validateRequest() {
        validateAge();
        validateLoanAmount();
        validateInsurableAmount();
    }

    private void validateLoanAmount() {
        if (loanAmount <= 100000 || loanAmount >= 3000000)
            throw new InsuranceException("Loan amount should be either 0 or between 100 000 and 3 000 000");
    }

    private void validateInsurableAmount() {
        if (insurableAmount > 15000)
            throw new InsuranceException("Insurable amount must be less than or equal to 15000");
    }

    private void validateAge() {
        if (age < 18 || age > 64)
            throw new InsuranceException("Age must be between 18 & 64");
    }
}
