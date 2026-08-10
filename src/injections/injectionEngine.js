import { injectionRules } from "./injectionRules.js";

export function getInjectionRule(query) {
  if (!query) return null;

  const normalizedQuery = query
    .trim()
    .toLowerCase();

  return injectionRules.find((rule) =>
    rule.keywords.some(
      (keyword) =>
        normalizedQuery === keyword.toLowerCase()
    )
  );
}