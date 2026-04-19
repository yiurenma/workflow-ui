import type { WorkFlow } from "@/api/types";

function truncate(value: unknown, maxLen = 500): string {
  if (value === undefined || value === null) return "(none)";
  const s = typeof value === "string" ? value : JSON.stringify(value, null, 2);
  return s.length > maxLen ? s.slice(0, maxLen) + " …[truncated]" : s;
}

export function buildExplainPrompt(applicationName: string, workFlow: WorkFlow): string {
  const steps = (workFlow.pluginList ?? []).map((plugin, i) => {
    const action = plugin.action;
    const type = action?.type ?? "UNKNOWN";
    const desc = plugin.description ?? `Step ${i + 1}`;
    const provider = action?.provider ?? "(none)";
    const method = action?.httpRequestMethod ?? "";
    const url = action?.httpRequestUrlWithQueryParameter
      ? truncate(action.httpRequestUrlWithQueryParameter, 300)
      : "";
    const body = action?.httpRequestBody ? truncate(action.httpRequestBody) : "";
    const elseLogic = action?.elseLogic ? truncate(action.elseLogic) : "";

    const rulesBlock =
      (plugin.ruleList ?? []).length === 0
        ? "    (no rules — always executes)"
        : (plugin.ruleList ?? [])
            .map(
              (r, ri) =>
                `    ${ri + 1}. JSONPath: ${r.key ?? "(empty)"}${r.remark ? `\n       Meaning: ${r.remark}` : ""}`
            )
            .join("\n");

    const actionBlock = [
      `    type: ${type}`,
      `    provider: ${provider}`,
      method ? `    method: ${method}` : "",
      url ? `    url: ${url}` : "",
      body ? `    request body: ${body}` : "",
      elseLogic ? `    logic/payload: ${elseLogic}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    return `### Step ${i + 1} — ${desc}

  Rules (all must match for this step to execute):
${rulesBlock}

  Action:
${actionBlock}`;
  });

  return `You are an expert software architect. Explain the following workflow pipeline to a developer or business analyst.

Application: "${applicationName}"
Total steps: ${steps.length}

${steps.join("\n\n") || "  (no steps configured yet)"}

---

Please provide the following, formatted in Markdown with ## headings and bullet lists:

## Summary
One sentence describing what this workflow does end-to-end.

## Step-by-Step Explanation
For each step:
- Explain what it does in plain English
- Explain what each **rule** means — what condition must be true for this step to run
- Explain what the **action** does — what system it calls, what data it sends or transforms, what the payload/logic achieves

## Data Flow
How data flows through the steps — what gets enriched, transformed, or routed.

## Observations
Any notable patterns, potential concerns, or suggestions you notice.

Use plain language. Avoid jargon. Format each step as a ## heading.`;
}
