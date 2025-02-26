
export interface UserStreak {
  id: string;
  created_at: string | null;
  last_visit_date: string;
  current_streak: number;
  weekly_checkins: string[] | null;
  message: string | null;
  user_id: string;
}

export interface MealData {
  id: string;
  created_at: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image_url?: string;
  user_id: string;
}

export interface MacroSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
