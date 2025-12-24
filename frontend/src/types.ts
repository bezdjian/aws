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
  updated_at?: string;
}
