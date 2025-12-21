import axios from "axios";

class CalculationService {
    static BASE_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:8000";

    static getAllCalculations() {
        return axios.get(`${this.BASE_URL}/calculations`);
    }

    static getCalculationById(calculation_id) {
        return axios.get(`${this.BASE_URL}/calculations/${calculation_id}`);
    }

    static createCalculation(calculation) {
        return axios.post(`${this.BASE_URL}/calculations`, calculation);
    }

    static updateCalculation(id, calculation) {
        return axios.put(`${this.BASE_URL}/calculations/${id}`, calculation);
    }

    static deleteCalculation(id) {
        return axios.delete(`${this.BASE_URL}/calculations/${id}`);
    }
}

export default CalculationService;