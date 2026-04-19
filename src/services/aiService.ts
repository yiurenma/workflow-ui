export interface AIProvider {
  name: string;
  call(prompt: string, maxTokens?: number): Promise<string>;
}

class AnthropicProvider implements AIProvider {
  name = "Anthropic";

  constructor(private token: string) {}

  async call(prompt: string, maxTokens = 1024): Promise<string> {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.token,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Anthropic API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    return data.content?.[0]?.text ?? "(no response)";
  }
}

class GitHubModelsProvider implements AIProvider {
  name = "GitHub Models";

  constructor(private token: string) {}

  async call(prompt: string, maxTokens = 1024): Promise<string> {
    const res = await fetch("https://models.inference.ai.azure.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxTokens,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`GitHub Models API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "(no response)";
  }
}

export function createAIProvider(token: string): AIProvider {
  if (token.startsWith("sk-ant-")) {
    return new AnthropicProvider(token);
  }

  if (
    token.startsWith("ghp_") ||
    token.startsWith("github_pat_") ||
    token.startsWith("gho_") ||
    token.startsWith("ghu_") ||
    token.startsWith("ghs_")
  ) {
    return new GitHubModelsProvider(token);
  }

  throw new Error(
    "Unrecognised token format. Use an Anthropic key (sk-ant-…) or a GitHub token (ghp_…, github_pat_…, gho_…)."
  );
}

export async function callAI(token: string, prompt: string, maxTokens = 1024): Promise<string> {
  const provider = createAIProvider(token);
  return provider.call(prompt, maxTokens);
}
