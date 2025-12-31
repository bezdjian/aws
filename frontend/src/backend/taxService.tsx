import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:8000";

export const calculateTax = async (
  grossSalary: number | undefined,
  birthYear: number = 1987,
  skattesats: number = 32
) => {
  const data = {
    tax_rate: skattesats,
    gross_salary: grossSalary,
    birth_year: birthYear,
    type: "L",
  };
  return await axios.post(`${API_URL}/compute-tax`, data);
};

export const getMunicipalities = async () => {
  return await axios.get(`${API_URL}/municipalities`);
};
