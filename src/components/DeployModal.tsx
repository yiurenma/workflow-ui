import { Modal, Form, Input, Button, Typography, Space, message } from "antd";
import { CheckCircleOutlined, LoadingOutlined, CloseCircleOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import type { WorkFlow, WorkflowEntitySettingRow } from "@/api/types";

interface DeployModalProps {
  open: boolean;
  onClose: () => void;
  currentWorkflow: WorkFlow | null;
  currentSettings: WorkflowEntitySettingRow | null;
}

interface DeployFormData {
  baseUrl: string;
  applicationName: string;
  username: string;
  password: string;
  environment: string;
}

interface DeployProgress {
  step: 1 | 2 | 3;
  status: "pending" | "in-progress" | "success" | "error";
  message?: string;
}

export const DeployModal: React.FC<DeployModalProps> = ({
  open,
  onClose,
  currentWorkflow,
  currentSettings,
}) => {
  const [form] = Form.useForm<DeployFormData>();
  const [deploying, setDeploying] = useState(false);
  const [progress, setProgress] = useState<DeployProgress[]>([
    { step: 1, status: "pending" },
    { step: 2, status: "pending" },
    { step: 3, status: "pending" },
  ]);

  const resetProgress = () => {
    setProgress([
      { step: 1, status: "pending" },
      { step: 2, status: "pending" },
      { step: 3, status: "pending" },
    ]);
  };

  const updateProgress = (step: 1 | 2 | 3, status: DeployProgress["status"], message?: string) => {
    setProgress((prev) =>
      prev.map((p) => (p.step === step ? { ...p, status, message } : p))
    );
  };

  const deployToRemote = async (formData: DeployFormData) => {
    if (!currentWorkflow || !currentSettings) {
      message.error("No workflow or settings data available");
      return;
    }

    const auth = btoa(`${formData.username}:${formData.password}`);
    const headers = {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    };

    try {
      // Step 1: Create Application Name
      updateProgress(1, "in-progress");
      const createResponse = await fetch(
        `${formData.baseUrl}/workflow/entity-setting?applicationName=${encodeURIComponent(formData.applicationName)}`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            enabled: true,
            asyncMode: false,
            retry: false,
            tracking: false,
            ignoreDuplicateRecordError: false,
          }),
        }
      );
      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        throw new Error(`Step 1 failed: ${errorText || createResponse.statusText}`);
      }
      updateProgress(1, "success");

      // Step 2: Update Application Name
      updateProgress(2, "in-progress");
      const updateResponse = await fetch(
        `${formData.baseUrl}/workflow/entity-setting?applicationName=${encodeURIComponent(formData.applicationName)}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({
            enabled: currentSettings.enabled,
            asyncMode: currentSettings.asyncMode,
            retry: currentSettings.retry,
            tracking: currentSettings.tracking,
            ignoreDuplicateRecordError: currentSettings.ignoreDuplicateRecordError,
            eimId: currentSettings.eimId,
            defaultServiceAccount: currentSettings.defaultServiceAccount,
            region: currentSettings.region,
            retryProperties: currentSettings.retryProperties,
            description: currentSettings.description || "Deployed from Hub",
          }),
        }
      );
      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        throw new Error(`Step 2 failed: ${errorText || updateResponse.statusText}`);
      }
      updateProgress(2, "success");

      // Step 3: Save Workflow
      updateProgress(3, "in-progress");
      const saveResponse = await fetch(
        `${formData.baseUrl}/workflow?applicationName=${encodeURIComponent(formData.applicationName)}`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(currentWorkflow),
        }
      );
      if (!saveResponse.ok) {
        const errorText = await saveResponse.text();
        throw new Error(`Step 3 failed: ${errorText || saveResponse.statusText}`);
      }
      updateProgress(3, "success");

      message.success("Deployment successful");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      message.error(errorMessage);

      // Mark current step as error
      const failedStep = progress.findIndex((p) => p.status === "in-progress");
      if (failedStep !== -1) {
        updateProgress((failedStep + 1) as 1 | 2 | 3, "error", errorMessage);
      }
      throw error;
    }
  };

  const handleDeploy = async () => {
    try {
      const values = await form.validateFields();

      // Validate HTTPS
      if (values.baseUrl.startsWith("http://")) {
        const confirmed = await new Promise<boolean>((resolve) => {
          Modal.confirm({
            title: "HTTP Warning",
            content: "You are using HTTP instead of HTTPS. Credentials will be sent unencrypted. Continue?",
            okText: "Continue",
            okType: "danger",
            onOk: () => resolve(true),
            onCancel: () => resolve(false),
          });
        });
        if (!confirmed) return;
      }

      setDeploying(true);
      resetProgress();
      await deployToRemote(values);
    } catch (error) {
      // Error already handled in deployToRemote
    } finally {
      setDeploying(false);
    }
  };

  const handleClose = () => {
    if (!deploying) {
      form.resetFields();
      resetProgress();
      onClose();
    }
  };

  const renderStepIcon = (step: DeployProgress) => {
    switch (step.status) {
      case "in-progress":
        return <LoadingOutlined style={{ color: "#0f62fe" }} />;
      case "success":
        return <CheckCircleOutlined style={{ color: "#24a148" }} />;
      case "error":
        return <CloseCircleOutlined style={{ color: "#da1e28" }} />;
      default:
        return <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #c6c6c6" }} />;
    }
  };

  const stepLabels = ["Create Application", "Update Settings", "Save Workflow"];

  return (
    <Modal
      title="Deploy Application"
      open={open}
      onCancel={handleClose}
      footer={
        <Space>
          <Button onClick={handleClose} disabled={deploying}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleDeploy} loading={deploying}>
            Deploy
          </Button>
        </Space>
      }
      width={560}
      maskClosable={!deploying}
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Typography.Paragraph style={{ color: "#525252", fontSize: 14, marginBottom: 16 }}>
          Deploy this application and its workflow to a remote environment. The system will execute three sequential API calls to create the application, update its settings, and save the workflow.
        </Typography.Paragraph>

        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            label="Deploy URL"
            name="baseUrl"
            rules={[
              { required: true, message: "Deploy URL is required" },
              {
                pattern: /^https?:\/\/.+/,
                message: "Must be a valid URL starting with http:// or https://",
              },
            ]}
          >
            <Input placeholder="https://workflow-operation-api-n9sbp.ondigitalocean.app" />
          </Form.Item>

          <Form.Item
            label="Application Name"
            name="applicationName"
            rules={[{ required: true, message: "Application name is required" }]}
          >
            <Input placeholder="my-application" />
          </Form.Item>

          <Form.Item
            label="Service Account Username"
            name="username"
            rules={[{ required: true, message: "Username is required" }]}
          >
            <Input placeholder="service-account" />
          </Form.Item>

          <Form.Item
            label="Service Account Password"
            name="password"
            rules={[{ required: true, message: "Password is required" }]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>

          <Form.Item
            label="Environment"
            name="environment"
            rules={[{ required: true, message: "Environment is required" }]}
          >
            <Input placeholder="UAT" />
          </Form.Item>
        </Form>

        {progress.some((p) => p.status !== "pending") && (
          <div style={{ marginTop: 16, padding: 16, background: "#f4f4f4", borderRadius: 0 }}>
            <Typography.Text strong style={{ fontSize: 12, color: "#161616", marginBottom: 12, display: "block" }}>
              DEPLOYMENT PROGRESS
            </Typography.Text>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              {progress.map((step, index) => (
                <div key={step.step} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {renderStepIcon(step)}
                  <span style={{ fontSize: 14, color: "#161616" }}>
                    Step {step.step}: {stepLabels[index]}
                  </span>
                </div>
              ))}
            </Space>
            {progress.some((p) => p.status === "error") && (
              <Typography.Text type="danger" style={{ fontSize: 12, marginTop: 12, display: "block" }}>
                {progress.find((p) => p.status === "error")?.message}
              </Typography.Text>
            )}
          </div>
        )}
      </Space>
    </Modal>
  );
};
