export function hasFeature(plan: string | null, feature: string): boolean {
  if (!plan) return false;

  const features = {
    free: ["basic_reports", "customer_management"],
    basic: [
      "basic_reports",
      "customer_management",
      "export_data",
      "advanced_reports",
      "smart_notifications",
      "fast_support",
    ],
    pro: [
      "basic_reports",
      "customer_management",
      "export_data",
      "advanced_reports",
      "smart_notifications",
      "fast_support",
      "advanced_analytics",
      "multi_user",
    ],
  };

  return features[plan as keyof typeof features]?.includes(feature) || false;
}