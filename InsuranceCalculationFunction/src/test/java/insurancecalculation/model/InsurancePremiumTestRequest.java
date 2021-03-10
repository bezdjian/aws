package insurancecalculation.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InsurancePremiumTestRequest {
    Long age;
    Long loanAmount;
    Long insurableAmount;
}
