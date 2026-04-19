import { callAI } from "./aiService";
import { getStoredToken, isValidToken } from "@/utils/tokenStorage";

const MAX_CONTINUATIONS = 5;
const MAX_TOKENS = 8192;
const CONTINUE_MSG =
  "Continue the JSON exactly where you stopped. Output only the continuation — no repetition, no preamble, no explanation.";

export async function callAIForGenerator(
  prompt: string,
  onProgress?: (msg: string) => void
): Promise<string> {
  const token = getStoredToken();
  if (!isValidToken(token)) throw new Error("No valid AI token");

  const isAnthropic = token!.startsWith("sk-ant-");
  let accumulated = "";

  for (let i = 0; i <= MAX_CONTINUATIONS; i++) {
    if (i === 0) {
      onProgress?.("Generating…");
    } else {
      onProgress?.(`Response incomplete — fetching part ${i + 1}…`);
    }

    let part: string;
    if (i === 0) {
      part = await callAI(token!, prompt, MAX_TOKENS);
    } else {
      const messages = [
        { role: "user", content: prompt },
        { role: "assistant", content: accumulated },
        { role: "user", content: CONTINUE_MSG },
      ];

      if (isAnthropic) {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": token!,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true",
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: MAX_TOKENS,
            messages,
          }),
        });
        if (!res.ok) throw new Error(`Anthropic API error ${res.status}: ${await res.text()}`);
        const data = await res.json();
        part = data.content?.[0]?.text ?? "";
      } else {
        const res = await fetch("https://models.inference.ai.azure.com/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token!}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages,
            max_tokens: MAX_TOKENS,
          }),
        });
        if (!res.ok) throw new Error(`GitHub Models API error ${res.status}: ${await res.text()}`);
        const data = await res.json();
        part = data.choices?.[0]?.message?.content ?? "";
      }
    }

    accumulated += part;

    const stripped = accumulated
      .trim()
      .replace(/^```(?:json5?|javascript|js)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();
    if (stripped.endsWith("}")) {
      onProgress?.("Generating…");
      return accumulated;
    }

    if (i === MAX_CONTINUATIONS) {
      throw new Error(
        `Response still incomplete after ${MAX_CONTINUATIONS} continuations. ` +
          "Try describing a simpler workflow with fewer steps."
      );
    }
  }

  return accumulated;
}
