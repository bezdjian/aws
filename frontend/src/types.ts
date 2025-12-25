export interface SalaryCalculation {
  hourly_rate: number;
  hours_worked: number;
  invoiced_amount: number;
  after_deduction: number;
  save_to_buffer: number;
  gross_salary: number;
  pension_saving: number;
  remaining_salary: number;
  remaining_for_gross_salary: number;
  employer_fee: number;
  date?: string;
  notes?: string;
  email?: string;
  client_name?: string;
  id?: string;
}

export interface UserProfile {
  email: string;
  name: string;
  picture: string;
  userId?: string;
}

export interface UserSettings {
  email: string;
  default_tax_rate: number;
  default_buffer_amount: number;
  default_hourly_rate: number;
  updated_at?: string;
}


export interface InsightStats {
  total_gross_salary: number;
  total_invoiced: number;
  hourly_rate: number;
  total_buffer: number;
  count: number;
}

export interface AIResponse {
  response: string;
}
