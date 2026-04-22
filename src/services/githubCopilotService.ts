import {
  getCopilotToken,
  saveCopilotToken,
  isCopilotTokenValid,
} from "@/utils/tokenStorage";

const COPILOT_TOKEN_URL = "https://api.github.com/copilot_internal/v2/token";
const COPILOT_MODELS_URL = "/api/proxy/copilot/models";
const COPILOT_CHAT_URL = "/api/proxy/copilot/chat/completions";
const DEFAULT_COPILOT_MODEL = "gpt-4o";

const COPILOT_HEADERS = {
  "Editor-Version": "vscode/1.106.3",
  "editor-plugin-version": "copilot/1.388.0",
  "Copilot-Integration-Id": "vscode-chat",
};

interface CopilotModel {
  id: string;
  name?: string;
}

let cachedModelId: string | null = null;

async function refreshCopilotToken(githubToken: string): Promise<string | null> {
  try {
    const res = await fetch(COPILOT_TOKEN_URL, {
      method: "GET",
      headers: {
        Authorization: `token ${githubToken}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (data.token && data.expires_at) {
      saveCopilotToken(data.token, data.expires_at);
      return data.token;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getCopilotTokenOrRefresh(githubToken: string): Promise<string | null> {
  if (isCopilotTokenValid()) {
    const data = getCopilotToken();
    return data?.token ?? null;
  }

  return refreshCopilotToken(githubToken);
}

async function getAvailableCopilotModel(copilotToken: string): Promise<string> {
  if (cachedModelId) return cachedModelId;

  try {
    const res = await fetch(COPILOT_MODELS_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${copilotToken}`,
        Accept: "application/json",
        ...COPILOT_HEADERS,
      },
    });

    if (res.ok) {
      const data = await res.json();
      const models: CopilotModel[] = data.data ?? [];
      const preferred = models.find((m) => m.id.includes(DEFAULT_COPILOT_MODEL));
      cachedModelId = preferred?.id ?? models[0]?.id ?? DEFAULT_COPILOT_MODEL;
    }
  } catch {
    cachedModelId = DEFAULT_COPILOT_MODEL;
  }

  return cachedModelId || DEFAULT_COPILOT_MODEL;
}

export async function callCopilotChat(
  githubToken: string,
  messages: Array<{ role: string; content: string }>,
  maxTokens = 1024
): Promise<string> {
  const copilotToken = await getCopilotTokenOrRefresh(githubToken);
  if (!copilotToken) {
    throw new Error("Failed to obtain GitHub Copilot token");
  }

  const model = await getAvailableCopilotModel(copilotToken);

  const res = await fetch(COPILOT_CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${copilotToken}`,
      ...COPILOT_HEADERS,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub Copilot API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "(no response)";
}
