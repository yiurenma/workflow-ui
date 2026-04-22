import { callCopilotChat } from "./githubCopilotService";

export interface AIProvider {
  name: string;
  call(prompt: string, maxTokens?: number): Promise<string>;
}

const MAX_TOKENS = 8192;

class AnthropicProvider implements AIProvider {
  name = "Anthropic";

  constructor(private token: string) {}

  async call(prompt: string, maxTokens = MAX_TOKENS): Promise<string> {
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

class GitHubCopilotProvider implements AIProvider {
  name = "GitHub Copilot";

  constructor(private githubToken: string) {}

  async call(prompt: string, maxTokens = MAX_TOKENS): Promise<string> {
    return callCopilotChat(this.githubToken, [{ role: "user", content: prompt }], maxTokens);
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
    return new GitHubCopilotProvider(token);
  }

  throw new Error(
    "Unrecognised token format. Use an Anthropic key (sk-ant-…) or a GitHub token (ghp_…, github_pat_…, gho_…)."
  );
}

export async function callAI(token: string, prompt: string, maxTokens = MAX_TOKENS): Promise<string> {
  const provider = createAIProvider(token);
  return provider.call(prompt, maxTokens);
}
