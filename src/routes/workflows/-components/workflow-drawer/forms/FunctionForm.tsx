import React, { useEffect, useState } from "react";
import { Node } from "@xyflow/react";
import {
  FunctionFormValues,
  FunctionPluginFormProps,
} from "@/types/plugin-form";

const FunctionForm: React.FC<FunctionPluginFormProps> = ({
  selectedNode,
  onValuesChange,
}) => {
  const [values, setValues] = useState<FunctionFormValues>({
    provider: "",
    type: "",
    remark: "",
    logic: "",
  });

  // Initialize form with node data
  useEffect(() => {
    if (selectedNode && selectedNode.data) {
      setValues({
        provider: (selectedNode.data.provider as string | undefined) ?? "",
        type: (selectedNode.data.label as string | undefined) ?? "",
        remark: (selectedNode.data.remark as string | undefined) ?? "",
        logic: (selectedNode.data.logic as string | undefined) ?? "",
      });
    }
  }, [selectedNode?.id]);

  const set = (k: keyof FunctionFormValues, v: string) => {
    setValues((prev) => {
      const next = { ...prev, [k]: v };
      onValuesChange?.(next);
      return next;
    });
  };

  return (
    <div>
      <div className="form-group">
        <label className="cds-label">Provider</label>
        <input
          className="cds-input"
          placeholder="Enter provider"
          value={values.provider ?? ""}
          onChange={(e) => set("provider", e.target.value)}
        />
      </div>
      <div className="form-group">
        <label className="cds-label">Type</label>
        <input
          className="cds-input"
          value={values.type ?? ""}
          disabled
          style={{ opacity: 0.6 }}
        />
      </div>
      <div className="form-group">
        <label className="cds-label">Remark</label>
        <textarea
          className="cds-input"
          rows={4}
          placeholder="Enter remark"
          value={values.remark ?? ""}
          onChange={(e) => set("remark", e.target.value)}
          style={{ resize: "none" }}
        />
      </div>
      <div className="form-group">
        <label className="cds-label">Logic</label>
        <textarea
          className="cds-input"
          rows={9}
          placeholder="Enter logic"
          value={values.logic ?? ""}
          onChange={(e) => set("logic", e.target.value)}
          style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 12, resize: "vertical" }}
        />
      </div>
    </div>
  );
};

export default FunctionForm;
