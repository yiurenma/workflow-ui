import React, { useEffect, useState } from "react";
import { Form, Input, Button, Space } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Node } from "@xyflow/react";
import type { BackendPlugin, BackendWorkflowType, BackendWorkflowRule } from "@/api/types/operation";
import NodeSection from "../NodeSection";
import { tryFormatJson, useJsonFormat } from "../useJsonFormat";
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

const LogicForm: React.FC<LogicFormProps> = ({ selectedNode, onValuesChange }) => {
  const [form] = Form.useForm<LogicFormValues>();
  const formatOnBlur = useJsonFormat(form, onValuesChange);
  const [ruleKeyErrors, setRuleKeyErrors] = useState<Record<number, string>>({});

  useEffect(() => {
    if (selectedNode?.data) {
      const bp = selectedNode.data.backendPlugin as BackendPlugin | undefined;
      const action = bp?.action as BackendWorkflowType | undefined;
      form.setFieldsValue({
        description: (bp?.description as string | undefined) ?? "",
        ruleList: bp?.ruleList?.map((r: BackendWorkflowRule) => ({ key: r.key, remark: r.remark })) ?? [],
        provider: action?.provider as string | undefined,
        type: action?.type as string | undefined,
        remark: action?.remark as string | undefined,
        elseLogic: tryFormatJson(action?.elseLogic as string | undefined),
      });
    }
  }, [selectedNode, form]);

  const handleValuesChange = (_: unknown, all: LogicFormValues) => {
    onValuesChange?.(all);
  };

  return (
    <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>

      {/* Panel 1 — Node Description */}
      <NodeSection
        title="Node Description"
        subtitle="The name shown on the canvas. What is this step called?"
        headingTooltip="Persisted as: plugin.description"
      >
        <Form.Item
          name="description"
          label="Step Name"
          tooltip="The name displayed on the canvas node. Keep it short and descriptive."
        >
          <Input placeholder="Step description (shown as node label)" />
        </Form.Item>
      </NodeSection>

      {/* Panel 2 — Rules */}
      <NodeSection
        title="Rules"
        subtitle="Run only when… — conditions that must all match before this step executes."
        headingTooltip="Persisted as: plugin.ruleList[].key + ruleList[].remark"
      >
        <Form.List name="ruleList">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...rest }) => (
                <div key={key} className="mb-2">
                  <Space align="baseline" className="flex">
                    <Form.Item
                      {...rest}
                      name={[name, "key"]}
                      className="!mb-0"
                      tooltip='e.g. $.messageInformation[?(@.customerId =~ /.+?/)] — evaluates to true when the path returns a result'
                      validateStatus={ruleKeyErrors[name] ? 'error' : undefined}
                    >
                      <Input
                        placeholder='$.messageInformation[?(@.field == "value")]'
                        style={{ width: 200 }}
                        onBlur={(e) => {
                          const result = validateRuleKey(e.target.value);
                          if (!result.valid) {
                            setRuleKeyErrors({ ...ruleKeyErrors, [name]: result.error! });
                          } else {
                            const { [name]: _, ...rest } = ruleKeyErrors;
                            setRuleKeyErrors(rest);
                          }
                        }}
                      />
                    </Form.Item>
                    <Form.Item {...rest} name={[name, "remark"]} className="!mb-0">
                      <Input placeholder="Human-readable explanation" style={{ width: 120 }} />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                  {ruleKeyErrors[name] && (
                    <div className="text-red-600 text-xs mt-1">{ruleKeyErrors[name]}</div>
                  )}
                </div>
              ))}
              <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                Add rule
              </Button>
            </>
          )}
        </Form.List>
      </NodeSection>

      {/* Panel 3 — Action */}
      <NodeSection
        title="Action"
        variant="inset"
        subtitle="What the system does when this step runs."
        headingTooltip="Persisted as: plugin.action (type, provider, httpRequest*, elseLogic, …)"
      >
        <Form.Item
          name="provider"
          label="Provider"
          tooltip="Use 'SYSTEM' for built-in logic steps, or a class name for Java reflection steps."
        >
          <Input placeholder="SYSTEM" />
        </Form.Item>
        <Form.Item
          name="type"
          label="Plugin Type"
          tooltip="Auto-populated. Read-only."
        >
          <Input disabled />
        </Form.Item>
        <Form.Item name="remark" label="Step Note">
          <Input.TextArea rows={2} placeholder="Step remark" />
        </Form.Item>
        <Form.Item
          name="elseLogic"
          label="Logic / Payload"
          tooltip='For IF_ELSE: JSON object to merge into the runtime payload when the rule matches. e.g. {"messageInformation": {"channel": "SMS"}}. For FUNCTION_V2/V3: JSON FunctionObject defining the Java class and method to call.'
        >
          <Input.TextArea
            rows={12}
            placeholder='{"key": "value"}'
            className="font-mono text-xs"
            onBlur={formatOnBlur("elseLogic")}
          />
        </Form.Item>
      </NodeSection>

    </Form>
  );
};

export default LogicForm;
