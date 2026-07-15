import { estimateCost } from "./pricing.js";
import { normalizeUsage, stringifyPrompt } from "./normalize.js";

/**
 * @typedef {'openai' | 'azure-openai' | 'anthropic' | 'gemini'} Provider
 */

/**
 * @typedef {object} AILogInput
 * @property {Provider | string} [provider]
 * @property {string} [model]
 * @property {unknown} [prompt]
 * @property {unknown} [response]
 * @property {Record<string, unknown>} [usage]
 * @property {number} [latencyMs]
 * @property {number} [responseTime]
 * @property {Record<string, unknown>} [meta]
 */

/**
 * Create an AI prompt logger.
 *
 * @param {{
 *   provider?: Provider | string,
 *   onLog?: (entry: object) => void,
 *   pretty?: boolean,
 *   pricing?: boolean
 * }} [options]
 */
export function createAILogger(options = {}) {
  const defaultProvider = options.provider ?? "openai";
  const pricingEnabled = options.pricing !== false;
  const pretty = options.pretty ?? true;
  const onLog =
    options.onLog ??
    ((entry) => {
      if (pretty) {
        const cost =
          entry.costUsd == null ? "n/a" : `$${entry.costUsd.toFixed(6)}`;
        console.log(
          [
            `[ai:${entry.provider}]`,
            entry.model,
            `tokens=${entry.tokens.totalTokens}`,
            `(in=${entry.tokens.promptTokens} out=${entry.tokens.completionTokens})`,
            `cost=${cost}`,
            `latency=${entry.latencyMs}ms`,
          ].join(" "),
        );
      } else {
        console.log(JSON.stringify(entry));
      }
    });

  /**
   * Build and emit a structured log entry.
   * @param {AILogInput} input
   */
  function log(input) {
    const provider = input.provider ?? defaultProvider;
    const model = input.model ?? "unknown";
    const tokens = normalizeUsage(provider, input.usage);
    const latencyMs = Number(input.latencyMs ?? input.responseTime ?? 0);
    const costUsd = pricingEnabled
      ? estimateCost(provider, model, tokens)
      : null;

    const entry = {
      provider,
      model,
      prompt: stringifyPrompt(input.prompt),
      response:
        typeof input.response === "string"
          ? input.response
          : stringifyPrompt(input.response),
      tokens,
      costUsd,
      latencyMs,
      responseTime: latencyMs,
      meta: input.meta ?? {},
      timestamp: new Date().toISOString(),
    };

    onLog(entry);
    return entry;
  }

  /**
   * Time an async LLM call and log the result.
   *
   * `fn` must resolve to an object with optional
   * `{ provider, model, prompt, response, usage }`.
   *
   * @template T
   * @param {() => Promise<T & Partial<AILogInput>>} fn
   * @param {Partial<AILogInput>} [defaults]
   * @returns {Promise<T & { __log: object }>}
   */
  async function track(fn, defaults = {}) {
    const started = Date.now();
    const result = await fn();
    const latencyMs = Date.now() - started;
    const entry = log({
      ...defaults,
      ...result,
      latencyMs: result.latencyMs ?? latencyMs,
    });
    return Object.assign(result, { __log: entry });
  }

  return { log, track };
}

/** Default shared logger */
export const aiLogger = createAILogger();
