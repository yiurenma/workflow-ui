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

      {/* Section 2 — HTTP Configuration */}
      <div className="border border-zinc-100 rounded-lg p-3 bg-zinc-50 mt-2">
        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3">HTTP Configuration</p>
        <Form.Item
          name="provider"
          label="Provider Name"
          tooltip="Logical name for this service (e.g. CRMService, LoyaltyAPI). Used for logging and tracking."
        >
          <Input placeholder="e.g. CustomerDataService" />
        </Form.Item>
        <Form.Item
          name="type"
          label="Plugin Type"
          tooltip="Auto-populated from the node type. Read-only."
        >
          <Input disabled />
        </Form.Item>
        <Form.Item
          name="remark"
          label="Step Note"
          tooltip="Internal documentation note for this step."
        >
          <Input.TextArea rows={2} placeholder="Step remark" />
        </Form.Item>
        <Form.Item name="httpRequestMethod" label="HTTP Method">
          <Select options={["GET", "POST", "PUT", "DELETE"].map((v) => ({ value: v, label: v }))} />
        </Form.Item>
        <Form.Item
          name="httpRequestUrlWithQueryParameter"
          label="External URL"
          tooltip="The public/external endpoint URL. Supports <<<$.path>>> variable substitution from the runtime payload."
        >
          <Input.TextArea rows={2} placeholder="https://example.com/api/..." />
        </Form.Item>
        <Form.Item
          name="internalHttpRequestUrlWithQueryParameter"
          label="Internal URL"
          tooltip="Internal service URL (used when running inside a private network). Falls back to External URL if empty."
        >
          <Input.TextArea rows={2} placeholder="https://internal.example.com/api/..." />
        </Form.Item>
        <Form.Item
          name="httpRequestHeaders"
          label="Request Headers"
          tooltip='JSON object of HTTP headers. e.g. {"Authorization": "Bearer token", "Content-Type": "application/json"}'
        >
          <Input.TextArea rows={3} placeholder='{"Content-Type": "application/json"}' />
        </Form.Item>
        <Form.Item
          name="httpRequestBody"
          label="Request Body"
          tooltip='JSON body template. Use <<<$.field>>> to inject runtime values. e.g. {"customerId": "<<<$.messageInformation.customerId>>>"}'
        >
          <Input.TextArea rows={5} placeholder="Request body template" />
        </Form.Item>
        <Form.Item
          name="trackingNumberSchemaInHttpResponse"
          label="Response Extraction Schema"
          tooltip='JSON template to extract values from the HTTP response. Use <<<$.field>>> JSONPath. e.g. {"reference": "<<<$.data.id>>>"}. Leave as {} to skip extraction.'
        >
          <Input.TextArea rows={3} placeholder="JSONPath or schema to extract from response" />
        </Form.Item>
      </div>
    </Form>
  );
};

export default HttpCallForm;
