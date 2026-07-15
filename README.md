# ai-prompt-logger

Trendy **AI prompt logger** for production LLM apps.

> `ai-logger` is already taken on npm, so this ships as **`ai-prompt-logger`**.

```bash
npm install ai-prompt-logger
```

## Logs

- Tokens (prompt / completion / total)
- Prompt + response
- Estimated cost (USD)
- Latency / response time

## Providers

OpenAI · Azure OpenAI · Anthropic · Gemini

## Quick start

```js
import { createAILogger } from "ai-prompt-logger";

const ai = createAILogger({ provider: "openai" });

ai.log({
  model: "gpt-4o-mini",
  prompt: "Write a haiku about Node.js",
  response: "...",
  usage: { prompt_tokens: 12, completion_tokens: 28 },
  latencyMs: 340,
});
```

Pretty output:

```text
[ai:openai] gpt-4o-mini tokens=40 (in=12 out=28) cost=$0.000019 latency=340ms
```

## Track an API call

```js
const result = await ai.track(async () => {
  const started = Date.now();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: "Hello" }],
  });

  return {
    model: completion.model,
    prompt: [{ role: "user", content: "Hello" }],
    response: completion.choices[0].message.content,
    usage: completion.usage,
    latencyMs: Date.now() - started,
  };
});

console.log(result.__log.costUsd, result.__log.tokens);
```

## Anthropic / Gemini / Azure

Usage fields are normalized automatically:

```js
// Anthropic
ai.log({
  provider: "anthropic",
  model: "claude-3-5-haiku-latest",
  prompt: "Hi",
  response: "Hello!",
  usage: { input_tokens: 10, output_tokens: 20 },
  latencyMs: 200,
});

// Gemini
ai.log({
  provider: "gemini",
  model: "gemini-2.0-flash",
  prompt: "Hi",
  response: "Hello!",
  usage: { promptTokenCount: 10, candidatesTokenCount: 20 },
  latencyMs: 180,
});

// Azure OpenAI
ai.log({
  provider: "azure-openai",
  model: "gpt-4o",
  prompt: "Hi",
  response: "Hello!",
  usage: { prompt_tokens: 10, completion_tokens: 20 },
  latencyMs: 220,
});
```

## Custom sink (Datadog, file, DB…)

```js
const ai = createAILogger({
  pretty: false,
  onLog: (entry) => {
    // send to your observability stack
    analytics.track("llm_call", entry);
  },
});
```

## Entry shape

```json
{
  "provider": "openai",
  "model": "gpt-4o-mini",
  "prompt": "...",
  "response": "...",
  "tokens": { "promptTokens": 12, "completionTokens": 28, "totalTokens": 40 },
  "costUsd": 0.0000186,
  "latencyMs": 340,
  "responseTime": 340,
  "timestamp": "2026-07-15T16:50:00.000Z"
}
```

Costs are **estimates** from a built-in pricing table — tune or disable with `pricing: false`.

## Zero dependencies

## License

MIT
