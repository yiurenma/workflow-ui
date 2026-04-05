import React, { useEffect } from "react";
import { Form, Input, Select, Button, Space, Typography } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Node } from "@xyflow/react";
import type { BackendPlugin, BackendWorkflowRule, BackendWorkflowType } from "@/api/types/operation";

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

const HttpCallForm: React.FC<HttpCallFormProps> = ({ selectedNode, onValuesChange }) => {
  const [form] = Form.useForm<HttpCallFormValues>();

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
        httpRequestMethod: (action?.httpRequestMethod as string | undefined) ?? "POST",
        httpRequestUrlWithQueryParameter: action?.httpRequestUrlWithQueryParameter as string | undefined,
        internalHttpRequestUrlWithQueryParameter: action?.internalHttpRequestUrlWithQueryParameter as string | undefined,
        httpRequestHeaders: action?.httpRequestHeaders as string | undefined,
        httpRequestBody: action?.httpRequestBody as string | undefined,
        trackingNumberSchemaInHttpResponse: action?.trackingNumberSchemaInHttpResponse as string | undefined,
      });
    }
  }, [selectedNode, form]);

  const handleValuesChange = (_: unknown, all: HttpCallFormValues) => {
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

      <Typography.Text type="secondary" className="text-xs">HTTP Configuration</Typography.Text>
      <Form.Item name="provider" label="Provider">
        <Input placeholder="e.g. CustomerDataService" />
      </Form.Item>
      <Form.Item name="type" label="Type">
        <Input disabled />
      </Form.Item>
      <Form.Item name="remark" label="Remark">
        <Input.TextArea rows={2} placeholder="Step remark" />
      </Form.Item>
      <Form.Item name="httpRequestMethod" label="HTTP Method">
        <Select options={["GET", "POST", "PUT", "DELETE"].map((v) => ({ value: v, label: v }))} />
      </Form.Item>
      <Form.Item name="httpRequestUrlWithQueryParameter" label="Request URL">
        <Input.TextArea rows={2} placeholder="https://example.com/api/..." />
      </Form.Item>
      <Form.Item name="internalHttpRequestUrlWithQueryParameter" label="Internal Request URL">
        <Input.TextArea rows={2} placeholder="https://internal.example.com/api/..." />
      </Form.Item>
      <Form.Item name="httpRequestHeaders" label="Headers (JSON)">
        <Input.TextArea rows={3} placeholder='{"Content-Type": "application/json"}' />
      </Form.Item>
      <Form.Item name="httpRequestBody" label="Body">
        <Input.TextArea rows={4} placeholder="Request body template" />
      </Form.Item>
      <Form.Item name="trackingNumberSchemaInHttpResponse" label="Response Body / Tracking Schema">
        <Input.TextArea rows={2} placeholder="JSONPath or schema to extract from response" />
      </Form.Item>
    </Form>
  );
};

export default HttpCallForm;
