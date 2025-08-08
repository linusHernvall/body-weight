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
  created_at: string;
}

export interface WeeklyAverage {
  week_start: string;
  week_end: string;
  average: number;
  count: number;
}

export interface DashboardStats {
  current_weight: number | null;
  weight_change_week: number | null;
  total_change: number | null;
  weekly_average: number | null;
}

export interface WeightFormData {
  date: string;
  value: number;
}

export interface GoalWeightFormData {
  goal_weight: number;
}

export interface AuthFormData {
  email: string;
  password: string;
}
