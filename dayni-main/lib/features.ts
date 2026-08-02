export type Plan = "free" | "basic" | "pro";

export type Feature =
  | "basic_charts"
  | "advanced_charts"
  | "advanced_reports"
  | "aging_report"
  | "cashflow_forecast"
  | "collection_performance"
  | "export_data"
  | "notifications";

export const FEATURE_MATRIX: Record<Plan, Feature[]> = {
  free: [],

  basic: [
    "basic_charts",
    "export_data",
  ],

  pro: [
    "basic_charts",
    "advanced_charts",
    "advanced_reports",
    "aging_report",
    "cashflow_forecast",
    "collection_performance",
    "export_data",
    "notifications",
  ],
};