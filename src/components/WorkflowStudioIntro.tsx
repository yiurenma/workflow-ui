import React from 'react';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

/**
 * Workflow Studio Introduction Component
 * Displays product overview on the home screen (applications list)
 */
export const WorkflowStudioIntro: React.FC = () => {
  return (
    <div
      style={{
        padding: '32px 0',
        marginBottom: '24px',
        borderBottom: '1px solid #e0e0e0',
      }}
    >
      <Title
        level={2}
        style={{
          fontSize: '28px',
          fontWeight: 400,
          color: '#161616',
          marginBottom: '12px',
          fontFamily: 'IBM Plex Sans, sans-serif',
        }}
      >
        Workflow Studio
      </Title>

      <Paragraph
        style={{
          fontSize: '16px',
          lineHeight: '24px',
          color: '#525252',
          marginBottom: '20px',
          maxWidth: '800px',
          fontFamily: 'IBM Plex Sans, sans-serif',
          letterSpacing: '0.16px',
        }}
      >
        Workflow Studio enables configurable message enrichment, conditional logic, and multi-channel delivery without writing custom backend code.
      </Paragraph>

      <div style={{ marginBottom: '20px' }}>
        <Title
          level={5}
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#161616',
            marginBottom: '8px',
            fontFamily: 'IBM Plex Sans, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.32px',
          }}
        >
          Who it's for
        </Title>
        <Paragraph
          style={{
            fontSize: '14px',
            lineHeight: '20px',
            color: '#525252',
            marginBottom: '0',
            fontFamily: 'IBM Plex Sans, sans-serif',
            letterSpacing: '0.16px',
          }}
        >
          Integration engineers, application developers, QA/operations teams, and business analysts
        </Paragraph>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <Title
          level={5}
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#161616',
            marginBottom: '8px',
            fontFamily: 'IBM Plex Sans, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.32px',
          }}
        >
          Key Benefits
        </Title>
        <ul
          style={{
            fontSize: '14px',
            lineHeight: '20px',
            color: '#525252',
            marginBottom: '0',
            paddingLeft: '20px',
            fontFamily: 'IBM Plex Sans, sans-serif',
            letterSpacing: '0.16px',
          }}
        >
          <li>Speed vs code-only integration — visual editor, no deploy cycle for config changes</li>
          <li>Shared business/engineering view — non-technical stakeholders can understand workflows</li>
          <li>Rules as guardrails — JSONPath conditions prevent invalid data flow</li>
          <li>Records as observability — execution history for debugging and auditing</li>
        </ul>
      </div>

      <div>
        <Title
          level={5}
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#161616',
            marginBottom: '8px',
            fontFamily: 'IBM Plex Sans, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.32px',
          }}
        >
          Features
        </Title>
        <ul
          style={{
            fontSize: '14px',
            lineHeight: '20px',
            color: '#525252',
            marginBottom: '0',
            paddingLeft: '20px',
            fontFamily: 'IBM Plex Sans, sans-serif',
            letterSpacing: '0.16px',
          }}
        >
          <li><strong>Applications</strong> — Manage workflow configurations with versioning and rollback</li>
          <li><strong>Canvas</strong> — Visual workflow editor with nodes, rules (JSONPath), and actions</li>
          <li><strong>Run</strong> — Test workflows with sample data before deploying</li>
          <li><strong>Records</strong> — View execution history and drill into individual runs</li>
          <li><strong>Explain</strong> — AI-powered workflow documentation</li>
          <li><strong>Generate</strong> — AI-powered workflow creation from natural language</li>
          <li><strong>JsonPath tool</strong> — Validate JSONPath expressions against sample data</li>
          <li><strong>Mobile experience</strong> — Full-featured mobile UI for on-the-go access</li>
        </ul>
      </div>
    </div>
  );
};
