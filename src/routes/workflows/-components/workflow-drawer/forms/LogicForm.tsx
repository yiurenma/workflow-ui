import React, { useEffect } from "react";
import { Form, Input, Button, Space, Typography } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Node } from "@xyflow/react";
import type { BackendPlugin, BackendWorkflowType, BackendWorkflowRule } from "@/api/types/operation";

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
        elseLogic: action?.elseLogic as string | undefined,
      });
    }
  }, [selectedNode, form]);

  const handleValuesChange = (_: unknown, all: LogicFormValues) => {
    onValuesChange?.(all);
  };

  return (
    <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
      {/* Section 1 — Node Identity */}
      <Form.Item
        name="description"
        label="Step Name"
        tooltip="The name displayed on the canvas node. Keep it short and descriptive."
      >
        <Input placeholder="Step description (shown as node label)" />
      </Form.Item>

      <div className="mb-2">
        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1">Trigger Rules</p>
        <Typography.Text type="secondary" className="text-xs block mb-2">
          All rules must match for this step to execute. Use JSONPath expressions against the runtime payload.
        </Typography.Text>
        <Form.List name="ruleList">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...rest }) => (
                <Space key={key} align="baseline" className="flex mb-2">
                  <Form.Item
                    {...rest}
                    name={[name, "key"]}
                    className="!mb-0"
                    tooltip='e.g. $.messageInformation[?(@.customerId =~ /.+?/)] — evaluates to true when the path returns a result'
                  >
                    <Input
                      placeholder='$.messageInformation[?(@.field == "value")]'
                      style={{ width: 200 }}
                    />
                  </Form.Item>
                  <Form.Item {...rest} name={[name, "remark"]} className="!mb-0">
                    <Input placeholder="Human-readable explanation" style={{ width: 120 }} />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                Add rule
              </Button>
            </>
          )}
        </Form.List>
      </div>

      {/* Section 2 — Logic Configuration */}
      <div className="border border-zinc-100 rounded-lg p-3 bg-zinc-50 mt-2">
        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3">Logic Configuration</p>
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
          <Input.TextArea rows={12} placeholder='{"key": "value"}' className="font-mono text-xs" />
        </Form.Item>
      </div>
    </Form>
  );
};

export default LogicForm;
