import React, { useEffect, useState } from "react";
import { Node } from "@xyflow/react";
import type { BackendPlugin, BackendWorkflowType, BackendWorkflowRule } from "@/api/types/operation";
import NodeSection from "../NodeSection";
import { tryFormatJson } from "../useJsonFormat";
import { validateRuleKey } from "@/utils/validateRuleKey";

export type LogicFormValues = {
  description?: string;
  ruleList?: { key?: string; remark?: string }[];
  provider?: string;
  type?: string;
  remark?: string;
  elseLogic?: string;
};

type LogicFormProps = {
  selectedNode: Node;
  onValuesChange?: (values: LogicFormValues) => void;
};

function RulesList({
  rules,
  onChange,
}: {
  rules: { key?: string; remark?: string }[];
  onChange: (rules: { key?: string; remark?: string }[]) => void;
}) {
  const [keyErrors, setKeyErrors] = useState<Record<number, string>>({});

  const add = () => onChange([...rules, { key: "", remark: "" }]);
  const remove = (i: number) => {
    onChange(rules.filter((_, idx) => idx !== i));
    const { [i]: _, ...rest } = keyErrors;
    setKeyErrors(rest);
  };
  const setField = (i: number, k: string, v: string) =>
    onChange(rules.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)));

  return (
    <div>
      {rules.map((rule, i) => (
        <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 6 }}>
          <div style={{ flex: 1 }}>
            <input
              className="cds-input"
              placeholder='$.messageInformation[?(@.field == "value")]'
              value={rule.key ?? ""}
              onChange={(e) => setField(i, "key", e.target.value)}
              onBlur={(e) => {
                const result = validateRuleKey(e.target.value);
                if (!result.valid) setKeyErrors({ ...keyErrors, [i]: result.error! });
                else { const { [i]: _, ...rest } = keyErrors; setKeyErrors(rest); }
              }}
              style={{ marginBottom: 4, fontFamily: '"IBM Plex Mono",monospace', fontSize: 12, borderColor: keyErrors[i] ? "#da1e28" : undefined }}
            />
            {keyErrors[i] && <div style={{ fontSize: 11, color: "#da1e28", marginBottom: 4 }}>{keyErrors[i]}</div>}
            <input
              className="cds-input"
              placeholder="Human-readable explanation"
              value={rule.remark ?? ""}
              onChange={(e) => setField(i, "remark", e.target.value)}
              style={{ fontSize: 12 }}
            />
          </div>
          <button
            onClick={() => remove(i)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#da1e28", fontSize: 18, marginTop: 6, flexShrink: 0 }}
            title="Remove rule"
          >
            −
          </button>
        </div>
      ))}
      <button
        onClick={add}
        style={{ width: "100%", padding: 6, background: "none", border: "1px dashed #c6c6c6", cursor: "pointer", fontSize: 12, color: "#525252", fontFamily: "inherit", marginTop: 4, borderRadius: 0 }}
      >
        ＋ Add rule
      </button>
    </div>
  );
}

const LogicForm: React.FC<LogicFormProps> = ({ selectedNode, onValuesChange }) => {
  const bp = selectedNode?.data?.backendPlugin as BackendPlugin | undefined;
  const action = bp?.action as BackendWorkflowType | undefined;

  const getInitial = (bp2: BackendPlugin | undefined, action2: BackendWorkflowType | undefined): LogicFormValues => ({
    description: (bp2?.description as string | undefined) ?? "",
    ruleList: (bp2?.ruleList as BackendWorkflowRule[] | undefined)?.map((r) => ({ key: r.key, remark: r.remark })) ?? [],
    provider: action2?.provider as string | undefined,
    type: action2?.type as string | undefined,
    remark: action2?.remark as string | undefined,
    elseLogic: tryFormatJson(action2?.elseLogic as string | undefined),
  });

  const [values, setValues] = useState<LogicFormValues>(() => getInitial(bp, action));

  useEffect(() => {
    if (selectedNode?.data) {
      const bp2 = selectedNode.data.backendPlugin as BackendPlugin | undefined;
      const action2 = bp2?.action as BackendWorkflowType | undefined;
      setValues(getInitial(bp2, action2));
    }
  }, [selectedNode?.id]);

  const set = (k: keyof LogicFormValues, v: unknown) => {
    setValues((prev) => {
      const next = { ...prev, [k]: v };
      onValuesChange?.(next);
      return next;
    });
  };

  const tryFmtBlur = () => {
    const formatted = tryFormatJson(values.elseLogic);
    if (formatted !== values.elseLogic) set("elseLogic", formatted);
    onValuesChange?.(values);
  };

  return (
    <div>
      <NodeSection title="Node Description" subtitle="The name shown on the canvas. What is this step called?">
        <label className="cds-label">Step Name</label>
        <input
          className="cds-input"
          placeholder="Step description (shown as node label)"
          value={values.description ?? ""}
          onChange={(e) => set("description", e.target.value)}
        />
      </NodeSection>

      <NodeSection title="Rules" subtitle="Run only when… — conditions that must all match before this step executes.">
        <RulesList
          rules={values.ruleList ?? []}
          onChange={(v) => set("ruleList", v)}
        />
      </NodeSection>

      <NodeSection title="Action" subtitle="What the system does when this step runs." variant="inset">
        <div className="form-group">
          <label className="cds-label">Provider</label>
          <input className="cds-input" placeholder="SYSTEM" value={values.provider ?? ""} onChange={(e) => set("provider", e.target.value)} />
        </div>
        <div className="form-group">
          <label className="cds-label">Plugin Type</label>
          <input className="cds-input" value={values.type ?? ""} disabled style={{ opacity: 0.6 }} />
        </div>
        <div className="form-group">
          <label className="cds-label">Step Note</label>
          <textarea className="cds-input" rows={2} placeholder="Step remark" value={values.remark ?? ""} onChange={(e) => set("remark", e.target.value)} style={{ resize: "none" }} />
        </div>
        <div className="form-group">
          <label className="cds-label">Logic / Payload</label>
          <textarea
            className="cds-input"
            rows={12}
            placeholder='{"key": "value"}'
            value={values.elseLogic ?? ""}
            onChange={(e) => set("elseLogic", e.target.value)}
            onBlur={tryFmtBlur}
            style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 12, resize: "vertical" }}
          />
        </div>
      </NodeSection>
    </div>
  );
};

export default LogicForm;
