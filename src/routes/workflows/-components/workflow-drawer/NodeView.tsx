import React from "react";
import { Node } from "@xyflow/react";
import type { BackendPlugin, BackendWorkflowRule, BackendWorkflowType } from "@/api/types/operation";
import NodeSection from "./NodeSection";

type NodeViewProps = {
  selectedNode: Node;
};

/**
 * Read-only view of node configuration.
 * Displays formatted text and pretty-printed JSON without input boxes.
 */
const NodeView: React.FC<NodeViewProps> = ({ selectedNode }) => {
  const bp = selectedNode?.data?.backendPlugin as BackendPlugin | undefined;
  const action = bp?.action as BackendWorkflowType | undefined;

  const description = (bp?.description as string | undefined) || "No description";
  const ruleList = bp?.ruleList as BackendWorkflowRule[] | undefined;

  const formatJson = (value: unknown): string => {
    if (!value) return "—";
    if (typeof value === "string") {
      try {
        return JSON.stringify(JSON.parse(value), null, 2);
      } catch {
        return value;
      }
    }
    return JSON.stringify(value, null, 2);
  };

  return (
    <div className="space-y-4">
      {/* Panel 1 — Node Description */}
      <NodeSection
        title="Node Description"
        subtitle="The name shown on the canvas. What is this step called?"
      >
        <p className="text-sm" style={{ color: "#161616", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {description}
        </p>
      </NodeSection>

      {/* Panel 2 — Rules */}
      <NodeSection
        title="Rules"
        subtitle="Run only when… — conditions that must all match before this step executes."
      >
        {ruleList && ruleList.length > 0 ? (
          <div className="space-y-2">
            {ruleList.map((rule, index) => (
              <div key={index} className="p-2" style={{ background: "#f4f4f4", border: "1px solid #e0e0e0" }}>
                <div className="text-xs font-semibold mb-1" style={{ color: "#525252" }}>
                  Rule {index + 1}
                </div>
                <div className="text-sm mb-1" style={{ color: "#161616" }}>
                  <strong>Key:</strong> <code className="text-xs">{rule.key || "—"}</code>
                </div>
                {rule.remark && (
                  <div className="text-sm" style={{ color: "#525252" }}>
                    <strong>Remark:</strong> {rule.remark}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: "#525252" }}>No rules defined</p>
        )}
      </NodeSection>

      {/* Panel 3 — Action */}
      <NodeSection
        title="Action"
        subtitle="What the system does when this step runs."
        variant="inset"
      >
        {action ? (
          <div className="space-y-2">
            {action.provider && (
              <div>
                <div className="text-xs font-semibold" style={{ color: "#525252" }}>Provider</div>
                <div className="text-sm" style={{ color: "#161616" }}>{action.provider}</div>
              </div>
            )}
            {action.type && (
              <div>
                <div className="text-xs font-semibold" style={{ color: "#525252" }}>Type</div>
                <div className="text-sm" style={{ color: "#161616" }}>{action.type}</div>
              </div>
            )}
            {action.httpRequestMethod && (
              <div>
                <div className="text-xs font-semibold" style={{ color: "#525252" }}>HTTP Method</div>
                <div className="text-sm" style={{ color: "#161616" }}>{action.httpRequestMethod}</div>
              </div>
            )}
            {action.httpRequestUrlWithQueryParameter && (
              <div>
                <div className="text-xs font-semibold" style={{ color: "#525252" }}>URL</div>
                <div className="text-sm" style={{ color: "#161616", wordBreak: "break-all" }}>
                  {action.httpRequestUrlWithQueryParameter}
                </div>
              </div>
            )}
            {action.httpRequestHeaders && (
              <div>
                <div className="text-xs font-semibold mb-1" style={{ color: "#525252" }}>Headers</div>
                <pre className="text-xs p-2 overflow-x-auto" style={{
                  background: "#ffffff",
                  border: "1px solid #e0e0e0",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all"
                }}>
                  {formatJson(action.httpRequestHeaders)}
                </pre>
              </div>
            )}
            {action.httpRequestBody && (
              <div>
                <div className="text-xs font-semibold mb-1" style={{ color: "#525252" }}>Body</div>
                <pre className="text-xs p-2 overflow-x-auto" style={{
                  background: "#ffffff",
                  border: "1px solid #e0e0e0",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all"
                }}>
                  {formatJson(action.httpRequestBody)}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm" style={{ color: "#525252" }}>No action configured</p>
        )}
      </NodeSection>
    </div>
  );
};

export default NodeView;
