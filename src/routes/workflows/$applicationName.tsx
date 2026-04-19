import { createFileRoute, Link } from "@tanstack/react-router";
import { ReactFlowProvider } from "@xyflow/react";
import { WorkflowSider } from "./-components/workflow-sider";
import { useState, useCallback, useRef } from "react";
import WorkflowEditor from "./-components/worflow-canvas";
import WorkflowHeader from "./-components/workflow-header";
import { useWorkflowQuery } from "@/api/hooks/workflow";
import { Node, Edge } from "@xyflow/react";
import type { WorkFlow } from "@/api/types";
import { mergeCanvasIntoWorkFlow } from "@/api/mappers/workFlowMapper";
import { useIsMobile } from "@/hooks/useIsMobile";

export const Route = createFileRoute("/workflows/$applicationName")({
  component: RouteComponent,
});

function RouteComponent() {
  const { applicationName: applicationNameParam } = Route.useParams();
  let applicationName = applicationNameParam;
  try {
    applicationName = decodeURIComponent(applicationNameParam);
  } catch {
    /* keep raw */
  }
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const { data: workFlow, isLoading, isError } = useWorkflowQuery(applicationName);

  const [generatedWorkflow, setGeneratedWorkflow] = useState<WorkFlow | null>(null);

  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const straightenRef = useRef<(() => void) | null>(null);
  const effectiveWorkflowRef = useRef<WorkFlow | null>(null);

  const handleWorkflowChange = useCallback((nodes: Node[], edges: Edge[]) => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, []);

  const handleSave = useCallback((): WorkFlow | null => {
    const base = effectiveWorkflowRef.current;
    if (base == null) return null;
    return mergeCanvasIntoWorkFlow(base, nodesRef.current, edgesRef.current);
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#525252", fontSize: 14 }}>
        Loading…
      </div>
    );
  }

  if (isError || workFlow == null) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16 }}>
        <div style={{ fontSize: 48, color: "#c6c6c6" }}>⚠</div>
        <div style={{ fontSize: 20, fontWeight: 400, color: "#161616" }}>Application not found</div>
        <div style={{ fontSize: 14, color: "#525252" }}>No workflow for this application name, or the request failed.</div>
        <Link to="/workflows">
          <button className="btn btn-primary">Back to applications</button>
        </Link>
      </div>
    );
  }

  const effectiveWorkflow: WorkFlow = generatedWorkflow ?? workFlow;
  effectiveWorkflowRef.current = effectiveWorkflow;

  return (
    <ReactFlowProvider>
      <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
        {!isMobile && (
          <WorkflowSider collapsed={collapsed} setCollapsed={setCollapsed} />
        )}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          <WorkflowHeader
            applicationName={applicationName}
            workFlow={effectiveWorkflow}
            onSave={handleSave}
            onStraighten={() => straightenRef.current?.()}
            onWorkflowGenerated={(wf) => setGeneratedWorkflow(wf)}
            onWorkflowImported={(wf) => setGeneratedWorkflow(wf)}
          />
          <div style={{ flex: 1, overflow: "hidden" }}>
            <WorkflowEditor
              applicationName={applicationName}
              workFlow={effectiveWorkflow}
              onWorkflowChange={handleWorkflowChange}
              straightenRef={straightenRef}
            />
          </div>
        </div>
      </div>
    </ReactFlowProvider>
  );
}
