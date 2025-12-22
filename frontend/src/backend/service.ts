import axios from "axios";
import { SalaryCalculation } from "../types";

const BASE_URL = process.env.VITE_BACKEND_API_URL || "http://localhost:8000";

export const verifyToken = async (token: string) => {
    try {
        const response = await axios.post(`${BASE_URL}/auth/verify`, {
            token: token,
        });
        return response.data;
    } catch (error) {
        console.error("Error validating token:", error);
        throw error;
    }
}

export const getClientId = async (): Promise<string> => {
    try {
        const response = await axios.get(`${BASE_URL}/auth/client_id`);
        return response.data;
    } catch (error) {
        console.error("Error fetching client ID:", error);
        throw error;
    }
}

export const getAllCalculations = () => {
    return axios.get<SalaryCalculation[]>(`${BASE_URL}/calculations`);
}

export const getCalculationById = (calculation_id: string) => {
    return axios.get<SalaryCalculation>(`${BASE_URL}/calculations/${calculation_id}`);
}

export const createCalculation = (calculation: SalaryCalculation) => {
    return axios.post(`${BASE_URL}/calculations`, calculation);
}

export const updateCalculation = (id: string, calculation: SalaryCalculation) => {
    return axios.put(`${BASE_URL}/calculations/${id}`, calculation);
}

export const deleteCalculation = (id: string) => {
    return axios.delete(`${BASE_URL}/calculations/${id}`);
}