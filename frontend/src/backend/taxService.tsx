import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:8000";

export const calculateTax = async (
  grossSalary: number | undefined,
  birthYear: number = 1987,
  municipalityCode: string = "180"
) => {
  const data = {
    municipality_code: municipalityCode,
    gross_salary: grossSalary,
    birth_year: birthYear,
    type: "L",
  };
  return await axios.post(`${API_URL}/compute-tax`, data);
};

export const getMunicipalities = async () => {
  return await axios.get(`${API_URL}/municipalities`);
};
