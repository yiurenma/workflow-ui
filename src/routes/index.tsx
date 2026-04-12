import { createFileRoute, Link } from "@tanstack/react-router";
import { Button, Typography } from "antd";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="p-8 max-w-2xl">
      <Typography.Title
        level={1}
        className="!mt-0"
        style={{
          fontFamily: 'IBM Plex Sans',
          fontSize: '42px',
          fontWeight: 300,
          color: '#161616',
        }}
      >
        Workflow Studio
      </Typography.Title>

      <Typography.Paragraph
        style={{
          fontFamily: 'IBM Plex Sans',
          fontSize: '16px',
          color: '#525252',
          marginBottom: '24px',
        }}
      >
        Design, test, and deploy message enrichment workflows with visual orchestration
      </Typography.Paragraph>

      <Typography.Paragraph
        style={{
          fontFamily: 'IBM Plex Sans',
          fontSize: '14px',
          color: '#525252',
          marginBottom: '32px',
        }}
      >
        Build conditional logic flows, enrich transaction data, and route messages
        to multiple channels—all through an intuitive canvas interface. No code required
        for configuration; full visibility into execution records.
      </Typography.Paragraph>

      <Link to="/workflows">
        <Button
          type="primary"
          size="large"
          style={{
            height: '48px',
            borderRadius: 0,
            background: '#0f62fe',
          }}
        >
          Go to Applications
        </Button>
      </Link>
    </div>
  );
}
