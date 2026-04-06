import { createFileRoute } from "@tanstack/react-router";
import { ReactFlowProvider } from "@xyflow/react";
import { Layout, Spin, Result, Button } from "antd";
import { Content } from "antd/es/layout/layout";
import { WorkflowSider } from "./-components/workflow-sider";
import { useState, useCallback, useRef } from "react";
import WorkflowEditor from "./-components/worflow-canvas";
import WorkflowHeader from "./-components/workflow-header";
import { useWorkflowQuery } from "@/api/hooks/workflow";
import { Link } from "@tanstack/react-router";
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
  const { data: workFlow, isLoading, isError } =
    useWorkflowQuery(applicationName);

  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);

  const handleWorkflowChange = useCallback((nodes: Node[], edges: Edge[]) => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, []);

  const handleSave = useCallback((): WorkFlow | null => {
    if (workFlow == null) return null;
    const nodes = nodesRef.current;
    const edges = edgesRef.current;
    return mergeCanvasIntoWorkFlow(workFlow, nodes, edges);
  }, [workFlow]);

  if (isLoading) {
    return (
      <Spin spinning={true}>
        <div className="h-screen" />
      </Spin>
    );
  }

  if (isError || workFlow == null) {
    return (
      <Result
        status="404"
        title="Application not found"
        subTitle="No workflow for this application name, or the request failed."
        extra={
          <Link to="/workflows">
            <Button type="primary">Back to applications</Button>
          </Link>
        }
      />
    );
  }

  return (
    <ReactFlowProvider>
      <Layout className="h-full">
        {!isMobile && (
          <WorkflowSider collapsed={collapsed} setCollapsed={setCollapsed} />
        )}
        <Layout className="h-full">
          <WorkflowHeader
            applicationName={applicationName}
            workFlow={workFlow}
            onSave={handleSave}
          />
          <Content className="h-full overflow-hidden">
            <WorkflowEditor
              applicationName={applicationName}
              workFlow={workFlow}
              onWorkflowChange={handleWorkflowChange}
            />
          </Content>
        </Layout>
      </Layout>
    </ReactFlowProvider>
  );
}
