import axios from "axios";
import { SalaryCalculation } from "../types";

const BASE_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:8000";

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
};

export const getClientId = async (): Promise<string> => {
  try {
    const response = await axios.get(`${BASE_URL}/auth/client_id`);
    return response.data;
  } catch (error) {
    console.error("Error fetching client ID:", error);
    throw error;
  }
};

export const deleteUserToken = async (userId: string) => {
  try {
    console.log("Not Implemented:Deleting user token for user ID: " + userId);
  } catch (error) {
    console.error("Error deleting user token:", error);
  }
};

export const getAllCalculations = async () => {
  return axios.get<SalaryCalculation[]>(`${BASE_URL}/calculations`);
};

export const getCalculationsByEmail = async (email: string) => {
  return axios.get<SalaryCalculation[]>(
    `${BASE_URL}/calculations/email/${email}`
  );
};

export const checkDuplicateCalculation = async (
  email: string,
  clientName: string
) => {
  return axios.get(`${BASE_URL}/calculations/check-duplicate`, {
    params: { email, client_name: clientName },
  });
};

export const getCalculationById = async (calculation_id: string) => {
  return axios.get<SalaryCalculation>(
    `${BASE_URL}/calculations/${calculation_id}`
  );
};

export const createCalculation = async (calculation: SalaryCalculation) => {
  console.log("Creating calculation:", calculation);
  return axios.post(`${BASE_URL}/calculations`, calculation);
};

export const updateCalculation = async (
  id: string,
  calculation: SalaryCalculation
) => {
  return axios.put(`${BASE_URL}/calculations/${id}`, calculation);
};

export const deleteCalculation = async (id: string) => {
  return axios.delete(`${BASE_URL}/calculations/${id}`);
};
