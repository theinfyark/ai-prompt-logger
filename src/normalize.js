/**
 * Normalize provider-specific usage objects.
 *
 * @param {'openai' | 'azure-openai' | 'anthropic' | 'gemini' | string} provider
 * @param {Record<string, unknown> | null | undefined} usage
 * @returns {{ promptTokens: number, completionTokens: number, totalTokens: number }}
 */
export function normalizeUsage(provider, usage = {}) {
  const u = usage || {};

  if (provider === "anthropic") {
    const promptTokens = Number(u.input_tokens ?? u.promptTokens ?? 0);
    const completionTokens = Number(u.output_tokens ?? u.completionTokens ?? 0);
    return {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    };
  }

  if (provider === "gemini") {
    const promptTokens = Number(
      u.promptTokenCount ?? u.prompt_tokens ?? u.promptTokens ?? 0,
    );
    const completionTokens = Number(
      u.candidatesTokenCount ?? u.completion_tokens ?? u.completionTokens ?? 0,
    );
    const totalTokens = Number(
      u.totalTokenCount ?? promptTokens + completionTokens,
    );
    return { promptTokens, completionTokens, totalTokens };
  }

  // OpenAI + Azure OpenAI (+ compatible)
  const promptTokens = Number(u.prompt_tokens ?? u.promptTokens ?? u.input_tokens ?? 0);
  const completionTokens = Number(
    u.completion_tokens ?? u.completionTokens ?? u.output_tokens ?? 0,
  );
  const totalTokens = Number(
    u.total_tokens ?? u.totalTokens ?? promptTokens + completionTokens,
  );
  return { promptTokens, completionTokens, totalTokens };
}

/**
 * Flatten chat messages / string prompt into a loggable string.
 * @param {unknown} prompt
 * @returns {string}
 */
export function stringifyPrompt(prompt) {
  if (prompt == null) return "";
  if (typeof prompt === "string") return prompt;
  try {
    return JSON.stringify(prompt);
  } catch {
    return String(prompt);
  }
}
