// Types correspondant au schéma Supabase (supabase/migrations/0001_initial_schema.sql)

export type TradingStyle = "day" | "swing" | "both";
export type Direction = "long" | "short";
export type TradeStatus = "open" | "closed" | "cancelled";
export type EmotionMoment = "before" | "after";
export type BehaviorFlagType =
  | "overtrading"
  | "revenge_trading"
  | "fomo"
  | "no_stop_loss"
  | "plan_ignored"
  | "other";

export interface Profile {
  id: string;
  full_name: string | null;
  starting_capital: number;
  current_capital: number;
  currency: string;
  trading_style: TradingStyle;
  markets: string[];
  max_risk_per_trade_pct: number;
  max_daily_loss_pct: number;
  dark_mode: boolean;
  created_at: string;
  updated_at: string;
}

export interface TradingAccount {
  id: string;
  user_id: string;
  name: string;
  broker: string | null;
  starting_balance: number;
  currency: string;
  is_active: boolean;
  created_at: string;
}

export interface Strategy {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  entry_criteria: string | null;
  exit_criteria: string | null;
  example_image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Trade {
  id: string;
  user_id: string;
  account_id: string | null;
  strategy_id: string | null;
  symbol: string;
  direction: Direction;
  entry_price: number;
  exit_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  position_size: number;
  entry_time: string;
  exit_time: string | null;
  result_amount: number | null;
  result_pct: number | null;
  status: TradeStatus;
  screenshot_url: string | null;
  notes: string | null;
  emotion_before: string | null;
  emotion_after: string | null;
  followed_plan: boolean | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface TradingPlan {
  id: string;
  user_id: string;
  objectives: string | null;
  rules: string | null;
  risk_management_rules: string | null;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  user_id: string;
  label: string;
  order_index: number;
  created_at: string;
}

export interface DailyRitual {
  id: string;
  user_id: string;
  ritual_date: string;
  morning_checklist_done: boolean;
  morning_notes: string | null;
  evening_done: boolean;
  what_worked: string | null;
  what_didnt_work: string | null;
  plan_respected: boolean | null;
  evening_notes: string | null;
  created_at: string;
}

export interface EmotionLog {
  id: string;
  user_id: string;
  trade_id: string | null;
  logged_at: string;
  moment: EmotionMoment;
  emotion: string;
  intensity: number | null;
  note: string | null;
}

export interface BehaviorFlag {
  id: string;
  user_id: string;
  trade_id: string | null;
  flag_type: BehaviorFlagType;
  note: string | null;
  created_at: string;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  daily_journal_reminder: boolean;
  daily_journal_reminder_time: string;
  evening_debrief_reminder: boolean;
  loss_streak_alert: boolean;
  loss_streak_threshold: number;
}

export interface RiskCalculation {
  id: string;
  user_id: string;
  capital: number;
  risk_pct: number;
  entry_price: number;
  stop_loss: number;
  take_profit: number | null;
  calculated_position_size: number;
  risk_reward_ratio: number | null;
  created_at: string;
}
