package insurancecalculation.model;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.SneakyThrows;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InsurancePremiumResponse {
    private Double monthlyLifeInsurancePremium;
    private Double monthlyIncomeInsurancePremium;
    private Double totalMonthlyPremium;

    @SneakyThrows
    @Override
    public String toString() {
        return new ObjectMapper()
                .writerWithDefaultPrettyPrinter()
                .writeValueAsString(this);
    }
}
