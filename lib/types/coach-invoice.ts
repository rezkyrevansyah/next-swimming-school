// Types untuk fitur invoice pelatih

export type SessionStatus = "hadir" | "izin" | "pengganti";

export interface CoachSessionRow {
  class_id:         string;
  class_name:       string;
  branch_id:        string;
  session_date:     string;  // ISO date 'YYYY-MM-DD'
  day_name:         string;
  status:           SessionStatus;
  eligible:         boolean;
  ineligible_reason?: string;  // untuk tooltip
  rate_per_session: number;
}

export interface CoachInvoiceSummary {
  id:             string;
  coach_id:       string;
  branch_id:      string;
  period_month:   string;
  total_sessions: number;
  total_amount:   number;
  status:         "draft" | "submitted";
  generated_at:   string;
  deleted_at:     string | null;
}

export interface CoachInvoiceItem {
  id:               string;
  invoice_id:       string;
  class_id:         string;
  session_date:     string;
  rate_per_session: number;
  notes:            string | null;
}

export interface CoachRateRow {
  id:               string;
  branch_id:        string;
  class_id:         string | null;
  coach_id:         string | null;
  rate_per_session: number;
  effective_from:   string;
  notes:            string | null;
}

// Level label untuk tampilan UI
export type RateLevel = "spesifik" | "per_kelas" | "per_coach" | "default";

export function getRateLevel(rate: Pick<CoachRateRow, "class_id" | "coach_id">): RateLevel {
  if (rate.coach_id && rate.class_id) return "spesifik";
  if (rate.class_id && !rate.coach_id) return "per_kelas";
  if (rate.coach_id && !rate.class_id) return "per_coach";
  return "default";
}

export const RATE_LEVEL_LABEL: Record<RateLevel, string> = {
  spesifik:  "Coach + Kelas",
  per_kelas: "Per Kelas",
  per_coach: "Per Coach",
  default:   "Default Cabang",
};
