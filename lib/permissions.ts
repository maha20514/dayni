import { Plan, Feature, FEATURE_MATRIX } from "./features";

export function hasFeature(plan: Plan, feature: Feature): boolean {
  return FEATURE_MATRIX[plan]?.includes(feature) ?? false;
}

export function getPermissions(plan: Plan) {
  return {
    isFree: plan === "free",
    isBasic: plan === "basic",
    isPro: plan === "pro",

    charts: {
      basic: hasFeature(plan, "basic_charts"),
      advanced: hasFeature(plan, "advanced_charts"),
    },

    reports: {
      advanced: hasFeature(plan, "advanced_reports"),
      aging: hasFeature(plan, "aging_report"),
      cashflow: hasFeature(plan, "cashflow_forecast"),
      collection: hasFeature(plan, "collection_performance"),
    },

    export: hasFeature(plan, "export_data"),

    can: (feature: Feature) => hasFeature(plan, feature),
  };
}

