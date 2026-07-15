export type Provider = "openai" | "azure-openai" | "anthropic" | "gemini";

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface ModelPricing {
  input: number;
  output: number;
}

export type ProviderPricing = Record<string, ModelPricing> & {
  default: ModelPricing;
};

export declare const PRICING: {
  openai: ProviderPricing;
  "azure-openai": ProviderPricing;
  anthropic: ProviderPricing;
  gemini: ProviderPricing;
};

export interface AILogInput {
  provider?: Provider | string;
  model?: string;
  prompt?: unknown;
  response?: unknown;
  usage?: Record<string, unknown>;
  latencyMs?: number;
  responseTime?: number;
  meta?: Record<string, unknown>;
}

export interface AILogEntry {
  provider: Provider | string;
  model: string;
  prompt: string;
  response: string;
  tokens: TokenUsage;
  costUsd: number | null;
  latencyMs: number;
  responseTime: number;
  meta: Record<string, unknown>;
  timestamp: string;
}

export interface AILoggerOptions {
  provider?: Provider | string;
  onLog?: (entry: AILogEntry) => void;
  pretty?: boolean;
  pricing?: boolean;
}

export interface AILogger {
  log(input: AILogInput): AILogEntry;
  track<T>(
    fn: () => Promise<T & Partial<AILogInput>>,
    defaults?: Partial<AILogInput>,
  ): Promise<T & { __log: AILogEntry }>;
}

export function createAILogger(options?: AILoggerOptions): AILogger;
export declare const aiLogger: AILogger;

export function getPricing(
  provider: string,
  model: string,
): ModelPricing;

export function estimateCost(
  provider: string,
  model: string,
  usage: Pick<TokenUsage, "promptTokens" | "completionTokens">,
): number;

export function normalizeUsage(
  provider: Provider | string,
  usage?: Record<string, unknown> | null,
): TokenUsage;

export function stringifyPrompt(prompt: unknown): string;
