import React, { useCallback, useEffect, useId } from "react";
import { Form, Input, Modal } from "antd";
import type { ApplicationFormValues } from "@/api/types";

type WorkflowDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: ApplicationFormValues) => void;
  mode: "create" | "edit";
  initialApplicationName?: string | null;
};

export const WorkflowDialog: React.FC<WorkflowDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  mode,
  initialApplicationName,
}) => {
  const formId = useId();
  const [form] = Form.useForm();
  const isEdit = mode === "edit";

  const resetForm = useCallback(() => {
    if (isEdit && initialApplicationName) {
      form.setFieldsValue({ applicationName: initialApplicationName });
    } else {
      form.resetFields();
    }
  }, [form, isEdit, initialApplicationName]);

  useEffect(() => {
    if (isOpen) resetForm();
  }, [isOpen, resetForm]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch {
      // Validation errors are shown by the form
    }
  };

  return (
    <Modal
      open={isOpen}
      title={isEdit ? "Application name" : "Create application"}
      onOk={handleSubmit}
      onCancel={onClose}
      okText={isEdit ? "OK" : "Create"}
      cancelText="Cancel"
      destroyOnClose={false}
      afterClose={resetForm}
    >
      <Form
        form={form}
        layout="vertical"
        name={formId}
        preserve={false}
        initialValues={
          isEdit && initialApplicationName
            ? { applicationName: initialApplicationName }
            : undefined
        }
      >
        <Form.Item
          name="applicationName"
          label="Application name"
          rules={[
            { required: true, message: "Please enter an application name" },
            {
              pattern: /^[A-Za-z0-9_.-]+$/,
              message: "Use letters, numbers, dot, underscore, hyphen",
            },
          ]}
        >
          <Input disabled={isEdit} placeholder="e.g. MY_APP" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
