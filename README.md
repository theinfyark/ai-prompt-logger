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

## Introduction

**ai-prompt-logger** helps you ship reliable Node.js / TypeScript applications with a small, focused API.

## Why this package exists

Popular stacks need small, trustworthy utilities with excellent DX. **ai-prompt-logger** exists to solve one problem well: clear APIs, strong typing, minimal dependencies, and production-ready defaults — without the overhead of larger frameworks.

## Installation

```bash
npm install ai-prompt-logger
# or
pnpm add ai-prompt-logger
yarn add ai-prompt-logger
```

Requires Node.js 18+.

## API Reference

See the exports from `ai-prompt-logger` and the inline TypeScript types for the full surface area. Primary entry points are documented in **Quick Start** and **Examples** above.

## Examples

Minimal usage is shown in **Quick Start**. Prefer copying those snippets first, then expand into your app’s error handling and configuration patterns.

## Advanced Examples

- Combine with environment validation, logging, and health checks in production services
- Prefer dependency injection / custom `fetch` / client injection in tests
- Keep configuration explicit; avoid hidden global state

## Framework Integration

Works with Express, Fastify, Hono, NestJS, and plain Node HTTP servers. Import ESM (or CJS where published) and call the documented APIs from route handlers, middleware, or background jobs.

## TypeScript Usage

```ts
import { /* symbols */ } from "ai-prompt-logger";
```

Types ship with the package (`types` / `exports.types`). Enable `strict` in your `tsconfig` for the best DX.

## Error Handling

- Fail fast with typed / named errors where provided
- Never swallow errors silently in production paths
- Prefer returning structured error payloads in HTTP layers
- Surface actionable messages (what failed + how to fix)

## Performance

- Minimal runtime work on the hot path
- Avoid unnecessary allocations and dependencies
- Tree-shakeable ESM entry points
- Prefer streaming / lazy work when dealing with large payloads

## Best Practices

- Pin major versions with SemVer ranges you trust
- Validate configuration at process startup
- Add health checks and observability around I/O
- Write tests for failure modes (timeouts, bad input, missing credentials)

## FAQ

**Does it work with ESM and CommonJS?**  
Yes where the package publishes dual exports. Prefer ESM for new projects.

**Is it production-ready?**  
Yes — tests, types, and SemVer releases are part of the maintenance model.

**How do I report a bug?**  
Open a GitHub issue using the bug template.

## Migration Guide

### From 0.x / early drafts
This package follows SemVer. Breaking changes land in major releases and are called out in `CHANGELOG.md`.

### Upgrading patch/minor
Patch and minor releases are backward compatible. Run your test suite after upgrading.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `ERR_MODULE_NOT_FOUND` | Wrong Node version / bad import path | Use Node 18+ and package `exports` |
| Types not resolving | Old moduleResolution | Use `bundler` or `node16`+ |
| Auth / network failures | Missing env or blocked egress | Check credentials and firewall |
| Unexpected runtime errors | Invalid input | Validate options; read error message |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). PRs with tests and docs are welcome.

