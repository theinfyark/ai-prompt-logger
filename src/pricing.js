/**
 * Approximate USD pricing per 1M tokens.
 * Update as vendors change rates — treated as estimates.
 *
 * Format: { input: $/1M, output: $/1M }
 */
export const PRICING = {
  openai: {
    "gpt-4o": { input: 2.5, output: 10 },
    "gpt-4o-mini": { input: 0.15, output: 0.6 },
    "gpt-4.1": { input: 2.0, output: 8.0 },
    "gpt-4.1-mini": { input: 0.4, output: 1.6 },
    "o3-mini": { input: 1.1, output: 4.4 },
    default: { input: 0.5, output: 1.5 },
  },
  "azure-openai": {
    "gpt-4o": { input: 2.5, output: 10 },
    "gpt-4o-mini": { input: 0.15, output: 0.6 },
    default: { input: 0.5, output: 1.5 },
  },
  anthropic: {
    "claude-3-5-haiku-latest": { input: 0.8, output: 4 },
    "claude-3-5-sonnet-latest": { input: 3, output: 15 },
    "claude-3-7-sonnet-latest": { input: 3, output: 15 },
    "claude-sonnet-4-20250514": { input: 3, output: 15 },
    "claude-opus-4-20250514": { input: 15, output: 75 },
    default: { input: 3, output: 15 },
  },
  gemini: {
    "gemini-2.0-flash": { input: 0.1, output: 0.4 },
    "gemini-2.5-flash": { input: 0.15, output: 0.6 },
    "gemini-1.5-pro": { input: 1.25, output: 5 },
    default: { input: 0.15, output: 0.6 },
  },
};

/**
 * @param {string} provider
 * @param {string} model
 * @returns {{ input: number, output: number }}
 */
export function getPricing(provider, model) {
  const table = PRICING[provider] || PRICING.openai;
  if (table[model]) return table[model];

  // Fuzzy match: find a pricing key contained in the model id
  const key = Object.keys(table).find(
    (k) => k !== "default" && (model.includes(k) || k.includes(model)),
  );
  return table[key] || table.default;
}

/**
 * Estimate USD cost from token usage.
 *
 * @param {string} provider
 * @param {string} model
 * @param {{ promptTokens: number, completionTokens: number }} usage
 * @returns {number}
 */
export function estimateCost(provider, model, usage) {
  const rates = getPricing(provider, model);
  const input = (usage.promptTokens / 1_000_000) * rates.input;
  const output = (usage.completionTokens / 1_000_000) * rates.output;
  return Number((input + output).toFixed(8));
}
