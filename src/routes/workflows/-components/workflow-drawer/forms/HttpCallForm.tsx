import React, { useEffect, useState } from "react";
import { Node } from "@xyflow/react";
import type { BackendPlugin, BackendWorkflowRule, BackendWorkflowType } from "@/api/types/operation";
import NodeSection from "../NodeSection";
import { tryFormatJson } from "../useJsonFormat";
import { validateRuleKey } from "@/utils/validateRuleKey";

export type HttpCallFormValues = {
  description?: string;
  ruleList?: { key?: string; remark?: string }[];
  provider?: string;
  type?: string;
  remark?: string;
  httpRequestMethod?: string;
  httpRequestUrlWithQueryParameter?: string;
  internalHttpRequestUrlWithQueryParameter?: string;
  httpRequestHeaders?: string;
  httpRequestBody?: string;
  trackingNumberSchemaInHttpResponse?: string;
};

type HttpCallFormProps = {
  selectedNode: Node;
  onValuesChange?: (values: HttpCallFormValues) => void;
};

// Simple hook to manage form state
function useFormState(initial: HttpCallFormValues, onChange?: (v: HttpCallFormValues) => void) {
  const [values, setValues] = useState(initial);
  const set = (k: keyof HttpCallFormValues, v: unknown) => {
    setValues((prev) => {
      const next = { ...prev, [k]: v };
      onChange?.(next);
      return next;
    });
  };
  return { values, set, setValues };
}

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

const HttpCallForm: React.FC<HttpCallFormProps> = ({ selectedNode, onValuesChange }) => {
  const bp = selectedNode?.data?.backendPlugin as BackendPlugin | undefined;
  const action = bp?.action as BackendWorkflowType | undefined;

  const initial: HttpCallFormValues = {
    description: (bp?.description as string | undefined) ?? "",
    ruleList: (bp?.ruleList as BackendWorkflowRule[] | undefined)?.map((r) => ({ key: r.key, remark: r.remark })) ?? [],
    provider: action?.provider as string | undefined,
    type: action?.type as string | undefined,
    remark: action?.remark as string | undefined,
    httpRequestMethod: (action?.httpRequestMethod as string | undefined) ?? "POST",
    httpRequestUrlWithQueryParameter: action?.httpRequestUrlWithQueryParameter as string | undefined,
    internalHttpRequestUrlWithQueryParameter: action?.internalHttpRequestUrlWithQueryParameter as string | undefined,
    httpRequestHeaders: tryFormatJson(action?.httpRequestHeaders as string | undefined),
    httpRequestBody: tryFormatJson(action?.httpRequestBody as string | undefined),
    trackingNumberSchemaInHttpResponse: tryFormatJson(action?.trackingNumberSchemaInHttpResponse as string | undefined),
  };

  const { values, set, setValues } = useFormState(initial, onValuesChange);

  useEffect(() => {
    if (selectedNode?.data) {
      const bp2 = selectedNode.data.backendPlugin as BackendPlugin | undefined;
      const action2 = bp2?.action as BackendWorkflowType | undefined;
      const next: HttpCallFormValues = {
        description: (bp2?.description as string | undefined) ?? "",
        ruleList: (bp2?.ruleList as BackendWorkflowRule[] | undefined)?.map((r) => ({ key: r.key, remark: r.remark })) ?? [],
        provider: action2?.provider as string | undefined,
        type: action2?.type as string | undefined,
        remark: action2?.remark as string | undefined,
        httpRequestMethod: (action2?.httpRequestMethod as string | undefined) ?? "POST",
        httpRequestUrlWithQueryParameter: action2?.httpRequestUrlWithQueryParameter as string | undefined,
        internalHttpRequestUrlWithQueryParameter: action2?.internalHttpRequestUrlWithQueryParameter as string | undefined,
        httpRequestHeaders: tryFormatJson(action2?.httpRequestHeaders as string | undefined),
        httpRequestBody: tryFormatJson(action2?.httpRequestBody as string | undefined),
        trackingNumberSchemaInHttpResponse: tryFormatJson(action2?.trackingNumberSchemaInHttpResponse as string | undefined),
      };
      setValues(next);
    }
  }, [selectedNode?.id]);

  const tryFmtBlur = (field: keyof HttpCallFormValues) => () => {
    const val = values[field] as string | undefined;
    const formatted = tryFormatJson(val);
    if (formatted !== val) set(field, formatted);
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
          <label className="cds-label">Provider Name</label>
          <input className="cds-input" placeholder="e.g. CustomerDataService" value={values.provider ?? ""} onChange={(e) => set("provider", e.target.value)} />
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
          <label className="cds-label">HTTP Method</label>
          <div style={{ position: "relative" }}>
            <select className="cds-select" value={values.httpRequestMethod ?? "POST"} onChange={(e) => set("httpRequestMethod", e.target.value)}>
              {["GET", "POST", "PUT", "DELETE"].map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="cds-label">External URL</label>
          <textarea className="cds-input" rows={2} placeholder="https://example.com/api/..." value={values.httpRequestUrlWithQueryParameter ?? ""} onChange={(e) => set("httpRequestUrlWithQueryParameter", e.target.value)} style={{ resize: "none" }} />
        </div>
        <div className="form-group">
          <label className="cds-label">Internal URL</label>
          <textarea className="cds-input" rows={2} placeholder="https://internal.example.com/api/..." value={values.internalHttpRequestUrlWithQueryParameter ?? ""} onChange={(e) => set("internalHttpRequestUrlWithQueryParameter", e.target.value)} style={{ resize: "none" }} />
        </div>
        <div className="form-group">
          <label className="cds-label">Request Headers</label>
          <textarea className="cds-input" rows={3} placeholder='{"Content-Type": "application/json"}' value={values.httpRequestHeaders ?? ""} onChange={(e) => set("httpRequestHeaders", e.target.value)} onBlur={tryFmtBlur("httpRequestHeaders")} style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 12, resize: "none" }} />
        </div>
        <div className="form-group">
          <label className="cds-label">Request Body</label>
          <textarea className="cds-input" rows={5} placeholder="Request body template" value={values.httpRequestBody ?? ""} onChange={(e) => set("httpRequestBody", e.target.value)} onBlur={tryFmtBlur("httpRequestBody")} style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 12, resize: "none" }} />
        </div>
        <div className="form-group">
          <label className="cds-label">Response Extraction Schema</label>
          <textarea className="cds-input" rows={3} placeholder="JSONPath or schema to extract from response" value={values.trackingNumberSchemaInHttpResponse ?? ""} onChange={(e) => set("trackingNumberSchemaInHttpResponse", e.target.value)} onBlur={tryFmtBlur("trackingNumberSchemaInHttpResponse")} style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 12, resize: "none" }} />
        </div>
      </NodeSection>
    </div>
  );
};

export default HttpCallForm;
