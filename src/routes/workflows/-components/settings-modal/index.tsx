import React, { useEffect } from "react";
import { Form, Input, Modal, Switch, message } from "antd";
import { usePatchEntitySetting } from "@/api/hooks/workflow";
import type { WorkflowEntitySettingRow } from "@/api/types";

type SettingsModalProps = {
  open: boolean;
  record: WorkflowEntitySettingRow | null;
  onClose: () => void;
};

const SettingsModal: React.FC<SettingsModalProps> = ({ open, record, onClose }) => {
  const [form] = Form.useForm();
  const patchSetting = usePatchEntitySetting();

  useEffect(() => {
    if (open && record) {
      form.setFieldsValue({
        newApplicationName: record.applicationName ?? "",
        description: record.description ?? "",
        enabled: record.enabled ?? true,
        asyncMode: record.asyncMode ?? true,
        retry: record.retry ?? false,
        tracking: record.tracking ?? false,
        ignoreDuplicateRecordError: record.ignoreDuplicateRecordError ?? false,
        eimId: record.eimId ?? "",
        defaultServiceAccount: record.defaultServiceAccount ?? "",
        region: record.region ?? "",
        retryProperties: record.retryProperties ?? "",
      });
    }
  }, [open, record, form]);

  const handleOk = async () => {
    try {
      const { newApplicationName, description, ...rest } = await form.validateFields();
      const patch = { ...rest, description } as Parameters<typeof patchSetting.mutateAsync>[0]['patch'];
      // Only send newApplicationName if it differs from current
      if (newApplicationName && newApplicationName.trim() !== record!.applicationName) {
        patch.newApplicationName = newApplicationName.trim();
      }
      await patchSetting.mutateAsync({
        applicationName: record!.applicationName,
        patch,
      });
      message.success("Settings updated");
      onClose();
    } catch {
      message.error("Failed to update settings");
    }
  };

  return (
    <Modal
      title={`Edit Settings — ${record?.applicationName ?? ""}`}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={patchSetting.isPending}
      width={520}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          name="newApplicationName"
          label="Application Name (rename)"
          rules={[{ required: true, whitespace: true, message: "Application name is required" }]}
        >
          <Input placeholder="New application name" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={2} placeholder="Human-readable description of this workflow" />
        </Form.Item>
        <div className="grid grid-cols-2 gap-x-4">
          <Form.Item name="enabled" label="Enabled" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="asyncMode" label="Async Mode" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="retry" label="Retry" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="tracking" label="Tracking" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="ignoreDuplicateRecordError" label="Ignore Duplicate Error" valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>
        <Form.Item name="eimId" label="EIM ID">
          <Input placeholder="Enterprise identity ID" />
        </Form.Item>
        <Form.Item name="defaultServiceAccount" label="Default Service Account">
          <Input placeholder="Service account name" />
        </Form.Item>
        <Form.Item name="region" label="Region">
          <Input placeholder="e.g. prod, dev" />
        </Form.Item>
        <Form.Item name="retryProperties" label="Retry Properties (JSON)">
          <Input.TextArea rows={4} placeholder='{"maxAttempts": 3, "retryErrorCodes": ["500"]}' />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SettingsModal;
