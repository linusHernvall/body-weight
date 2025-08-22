export interface Weight {
  id: string;
  user_id: string;
  date: string;
  value: number;
  created_at: string;
}

export interface UserProfile {
  id: string;
  goal_weight: number | null;
  total_change_start_date: string | null;
  created_at: string;
}

export type WeightUnit = "kg" | "lbs";
