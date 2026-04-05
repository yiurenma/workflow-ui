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
      <Form.Item name="description" label="Description">
        <Input placeholder="Step description (shown as node label)" />
      </Form.Item>

      <Form.Item label="Rules">
        <Form.List name="ruleList">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...rest }) => (
                <Space key={key} align="baseline" className="flex mb-2">
                  <Form.Item {...rest} name={[name, "key"]} className="!mb-0" style={{ flex: 1 }}>
                    <Input placeholder="JSONPath rule expression" style={{ width: 180 }} />
                  </Form.Item>
                  <Form.Item {...rest} name={[name, "remark"]} className="!mb-0">
                    <Input placeholder="Remark" style={{ width: 100 }} />
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
      </Form.Item>

      <Typography.Text type="secondary" className="text-xs">Logic Configuration</Typography.Text>
      <Form.Item name="provider" label="Provider">
        <Input placeholder="e.g. SYSTEM" />
      </Form.Item>
      <Form.Item name="type" label="Type">
        <Input disabled />
      </Form.Item>
      <Form.Item name="remark" label="Remark">
        <Input.TextArea rows={2} placeholder="Step remark" />
      </Form.Item>
      <Form.Item name="elseLogic" label="Logic / Else Logic (JSON)">
        <Input.TextArea rows={9} placeholder='{"key": "value"}' />
      </Form.Item>
    </Form>
  );
};

export default LogicForm;
