import { getMunicipalities } from "./taxService";

export interface Municipality {
  namn: string;
  kod: string;
}

export const municipalities = async (): Promise<Municipality[]> => {
  try {
    const response = await getMunicipalities();
    return response.data.map((m: any) => ({
      namn: m.namn,
      kod: m.kod,
    }));
  } catch (error) {
    console.error("Error fetching municipalities:", error);
    return [];
  }
};
