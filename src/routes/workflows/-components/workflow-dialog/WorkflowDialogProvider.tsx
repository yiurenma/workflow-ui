import React, { createContext, useContext, useState, ReactNode } from "react";
import { WorkflowDialog } from "./index";
import type { ApplicationFormValues } from "@/api/types";
import { useCreateApplication } from "@/api/hooks/workflow";
import { useNavigate } from "@tanstack/react-router";
import { message } from "antd";

type DialogMode = "create" | "edit";

interface WorkflowDialogContextType {
  openCreateDialog: () => void;
  openEditDialog: (applicationName: string) => void;
  closeDialog: () => void;
}

const WorkflowDialogContext = createContext<
  WorkflowDialogContextType | undefined
>(undefined);

export const useWorkflowDialog = () => {
  const context = useContext(WorkflowDialogContext);
  if (!context) {
    throw new Error(
      "useWorkflowDialog must be used within a WorkflowDialogProvider"
    );
  }
  return context;
};

interface WorkflowDialogProviderProps {
  children: ReactNode;
}

export const WorkflowDialogProvider: React.FC<WorkflowDialogProviderProps> = ({
  children,
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<DialogMode>("create");
  const [selectedName, setSelectedName] = useState<string | null>(null);

  const createApplication = useCreateApplication();

  const openCreateDialog = () => {
    setMode("create");
    setSelectedName(null);
    setIsOpen(true);
  };

  const openEditDialog = (applicationName: string) => {
    setMode("edit");
    setSelectedName(applicationName);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  const handleSubmit = async (data: ApplicationFormValues) => {
    try {
      if (mode === "create") {
        await createApplication.mutateAsync(data.applicationName);
        message.success("Application created");
        closeDialog();
        navigate({
          to: "/workflows/$applicationName",
          params: {
            applicationName: data.applicationName,
          },
        });
      }
    } catch (error) {
      message.error("Could not create application");
    }
  };

  return (
    <WorkflowDialogContext.Provider
      value={{
        openCreateDialog,
        openEditDialog,
        closeDialog,
      }}
    >
      {children}
      <WorkflowDialog
        isOpen={isOpen}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        mode={mode}
        initialApplicationName={selectedName}
      />
    </WorkflowDialogContext.Provider>
  );
};
