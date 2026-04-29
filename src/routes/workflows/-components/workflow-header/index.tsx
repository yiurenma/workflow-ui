import { Link } from "@tanstack/react-router";
import type { WorkFlow } from "@/api/types";
import { useSaveWorkflow } from "@/api/hooks/workflow";
import { onlineApi, type StepEvent } from "@/api/services/online";
import React, { useState } from "react";
import { SimpleMarkdown } from "./SimpleMarkdown";
import { JsonPathModal } from "./JsonPathModal";
import { WorkflowGeneratorModal } from "./WorkflowGeneratorModal";
import { ImportWorkflowModal } from "@/components/ImportWorkflowModal";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useAIExplain } from "./useAIExplain";
import { isValidToken, getStoredToken } from "@/utils/tokenStorage";
import { callAIForGenerator } from "@/services/aiGeneratorService";
import { useToast } from "@/contexts/ToastContext";

type WorkflowHeaderProps = {
  applicationName: string;
  workFlow?: WorkFlow;
  isLoading?: boolean;
  onSave?: () => WorkFlow | null;
  onWorkflowGenerated?: (workflow: WorkFlow) => void;
  onWorkflowImported?: (workflow: WorkFlow) => void;
  onStraighten?: () => void;
};

const defaultRunBody = `{\n  "messageInformation": {}\n}`;

const WorkflowHeader: React.FC<WorkflowHeaderProps> = ({
  applicationName,
  workFlow,
  isLoading,
  onSave,
  onWorkflowGenerated,
  onWorkflowImported,
  onStraighten,
}) => {
  const isMobile = useIsMobile();
  const { showToast } = useToast();
  const saveWorkflow = useSaveWorkflow();
  const [runOpen, setRunOpen] = useState(false);
  const [runBody, setRunBody] = useState(defaultRunBody);
  const [confirmationNumber, setConfirmationNumber] = useState("test-confirmation");
  const [runResult, setRunResult] = useState<string | null>(null);
  const [runLoading, setRunLoading] = useState(false);
  const [streamEnabled, setStreamEnabled] = useState(false);
  const [streamEvents, setStreamEvents] = useState<(StepEvent & { expanded: boolean })[]>([]);
  const [streamDone, setStreamDone] = useState(false);
  const streamAbortRef = React.useRef<AbortController | null>(null);
  const [jsonPathOpen, setJsonPathOpen] = useState(false);
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deviceFlowModalContent, setDeviceFlowModalContent] = useState<"device" | "token" | null>(null);

  const aiExplain = useAIExplain({
    onError: (msg) => showToast(msg, "error"),
    onInfo: (msg) => showToast(msg, "info"),
  });

  const saveFlow = async () => {
    if (!workFlow) {
      showToast("No workflow data to save", "error");
      return;
    }
    try {
      const merged = onSave ? onSave() : null;
      const payload = merged ?? workFlow;
      await saveWorkflow.mutateAsync({ applicationName, workFlow: payload });
      showToast("Workflow saved successfully", "success");
    } catch {
      showToast("Failed to save workflow", "error");
    }
  };

  const executeRun = async () => {
    if (streamEnabled) {
      setStreamEvents([]);
      setStreamDone(false);
      setRunLoading(true);
      const ctrl = onlineApi.postWorkflowStream(
        { applicationName, confirmationNumber, body: runBody },
        (event) => setStreamEvents((prev) => [...prev, { ...event, expanded: prev.length === 0 }]),
        () => { setRunLoading(false); setStreamDone(true); showToast("Stream complete", "success"); },
        (msg) => { showToast(msg, "error"); }
      );
      streamAbortRef.current = ctrl;
    } else {
      setRunLoading(true);
      setRunResult(null);
      try {
        const res = await onlineApi.postWorkflow({ applicationName, confirmationNumber, body: runBody });
        const text = await res.text();
        setRunResult(text.slice(0, 8000));
        showToast("Request completed", "success");
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setRunResult(msg);
        showToast("Online API request failed", "error");
      } finally {
        setRunLoading(false);
      }
    }
  };

  const cancelStream = () => {
    streamAbortRef.current?.abort();
    streamAbortRef.current = null;
    setRunLoading(false);
    setStreamDone(true);
  };

  const toggleStepExpanded = (index: number) => {
    setStreamEvents((prev) =>
      prev.map((e, i) => (i === index ? { ...e, expanded: !e.expanded } : e))
    );
  };

  const formatJson = (raw: string) => {
    try { return JSON.stringify(JSON.parse(raw), null, 2); } catch { return raw; }
  };

  const getWorkflow = () => (onSave ? onSave() : workFlow) ?? null;

  const handleGeneratorNeedToken = () => {
    setGeneratorOpen(false);
    aiExplain.setDeviceFlowOpen(true);
    aiExplain.deviceFlow.start();
  };

  const openGitHub = (verificationUri: string) => {
    const opened = window.open(verificationUri, "_blank");
    if (!opened) showToast(`Please open ${verificationUri} in your browser`, "info");
  };

  const renderDeviceFlowContent = () => {
    const { state } = aiExplain.deviceFlow;
    if (state.status === "requesting") {
      return <div style={{ padding: "32px 0", textAlign: "center", color: "#525252", fontSize: 13 }}>Contacting GitHub…</div>;
    }
    if (state.status === "awaiting_user" || state.status === "polling") {
      const { userCode, verificationUri } = state;
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontSize: 13, color: "#525252" }}>Enter the code below on GitHub to authorize access to GitHub Models.</p>
          <div style={{ background: "#fdf6ec", border: "1px solid #f8d89c", padding: "16px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 24, fontFamily: '"IBM Plex Mono",monospace', fontWeight: 700, letterSpacing: "0.2em", color: "#b45309", userSelect: "all" }}>{userCode}</div>
          </div>
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => openGitHub(verificationUri)}>Open GitHub to authorize</button>
          {state.status === "polling" && <div style={{ textAlign: "center", fontSize: 12, color: "#525252" }}>Waiting for authorization…</div>}
        </div>
      );
    }
    if (state.status === "expired") {
      return <div style={{ textAlign: "center" }}><span style={{ color: "#da1e28", fontSize: 13 }}>Authorization timed out — please try again.</span><br /><button className="btn btn-ghost" style={{ marginTop: 12 }} onClick={() => aiExplain.deviceFlow.start()}>Try again</button></div>;
    }
    if (state.status === "denied") {
      return <div style={{ textAlign: "center" }}><span style={{ color: "#da1e28", fontSize: 13 }}>Authorization was denied on GitHub.</span></div>;
    }
    if (state.status === "error") {
      return <div style={{ textAlign: "center" }}><span style={{ color: "#da1e28", fontSize: 13 }}>{state.message}</span><br /><button className="btn btn-ghost" style={{ marginTop: 12 }} onClick={() => aiExplain.deviceFlow.start()}>Try again</button></div>;
    }
    return null;
  };

  return (
    <>
      <div
        style={{
          height: 44, background: "#fff", borderBottom: "1px solid #c6c6c6",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 16px", flexShrink: 0,
        }}
      >
        {/* Left side */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link to="/workflows" style={{ display: "flex", alignItems: "center", color: "#525252", textDecoration: "none", fontSize: 13 }}>
            ←
          </Link>
          <span style={{ color: "#c6c6c6", fontSize: 13 }}>/</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#161616", letterSpacing: "0.16px" }}>
            {isLoading ? "Loading…" : applicationName}
          </span>
        </div>

        {/* Right side */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {isMobile ? (
            <>
              {/* Mobile: ellipsis menu */}
              <div style={{ position: "relative" }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setMobileMenuOpen((v) => !v)}
                  aria-label="More actions"
                >
                  ⋯
                </button>
                {mobileMenuOpen && (
                  <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 998 }} onClick={() => setMobileMenuOpen(false)} />
                    <div style={{
                      position: "absolute", right: 0, top: "100%", zIndex: 999,
                      background: "#fff", border: "1px solid #c6c6c6",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.3)", minWidth: 160,
                    }}>
                      {[
                        { label: "Straighten", action: () => { onStraighten?.(); setMobileMenuOpen(false); }, disabled: !!isLoading },
                        { label: "💡 Explain", action: () => { aiExplain.explainFlow(getWorkflow, applicationName); setMobileMenuOpen(false); }, disabled: !!isLoading },
                        { label: "🤖 Generate", action: () => { setGeneratorOpen(true); setMobileMenuOpen(false); } },
                        { label: "⬇ Import", action: () => { setImportOpen(true); setMobileMenuOpen(false); } },
                        { label: "JsonPath", action: () => { setJsonPathOpen(true); setMobileMenuOpen(false); } },
                        { label: "Run", action: () => { setRunOpen(true); setMobileMenuOpen(false); }, disabled: !!isLoading },
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={item.action}
                          disabled={item.disabled}
                          style={{
                            display: "block", width: "100%", padding: "10px 16px",
                            background: "none", border: "none", textAlign: "left",
                            fontSize: 13, fontFamily: "inherit", cursor: item.disabled ? "not-allowed" : "pointer",
                            color: item.disabled ? "#8d8d8d" : "#161616",
                          }}
                          onMouseEnter={(e) => { if (!item.disabled) (e.currentTarget as HTMLButtonElement).style.background = "#f4f4f4"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = ""; }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <button className="btn btn-primary btn-sm" onClick={saveFlow} disabled={isLoading || saveWorkflow.isPending}>
                {saveWorkflow.isPending ? "Saving…" : "Save"}
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => onStraighten?.()} disabled={!!isLoading}>Straighten</button>
              <button className="btn btn-ghost btn-sm" style={{ color: "#0f62fe", borderColor: "#0f62fe" }} onClick={() => aiExplain.explainFlow(getWorkflow, applicationName)} disabled={!!isLoading}>💡 Explain</button>
              <button className="btn btn-ghost btn-sm" style={{ color: "#0f62fe", borderColor: "#0f62fe" }} onClick={() => setGeneratorOpen(true)}>🤖 Generate</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setImportOpen(true)}>⬇ Import</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setJsonPathOpen(true)}>JsonPath</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setRunOpen(true)} disabled={!!isLoading}>Run</button>
              <button className="btn btn-primary btn-sm" onClick={saveFlow} disabled={isLoading || saveWorkflow.isPending}>
                {saveWorkflow.isPending ? "Saving…" : "Save"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* GitHub Device Flow Modal */}
      {aiExplain.deviceFlowOpen && (
        <div className="modal-overlay fade-in" onClick={(e) => e.target === e.currentTarget && aiExplain.cancelDeviceFlow()}>
          <div className="modal-box slide-up" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <span className="modal-title">Authorize with GitHub</span>
              <button className="modal-close" onClick={aiExplain.cancelDeviceFlow}>✕</button>
            </div>
            <div className="modal-body">{renderDeviceFlowContent()}</div>
            <div className="modal-footer" style={{ justifyContent: "space-between" }}>
              <button className="btn-link" style={{ fontSize: 12 }} onClick={aiExplain.openManualTokenModal}>Paste a token manually</button>
              <button className="btn btn-ghost" onClick={aiExplain.cancelDeviceFlow}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Token prompt Modal */}
      {aiExplain.tokenPromptOpen && (
        <div className="modal-overlay fade-in" onClick={(e) => e.target === e.currentTarget && aiExplain.setTokenPromptOpen(false)}>
          <div className="modal-box slide-up" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <span className="modal-title">Set AI Token</span>
              <button className="modal-close" onClick={() => aiExplain.setTokenPromptOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 13, color: "#525252", marginBottom: 16, lineHeight: 1.6 }}>
                Enter an <strong>Anthropic API key</strong> (<code style={{ fontFamily: '"IBM Plex Mono",monospace', background: "#f4f4f4", padding: "1px 4px" }}>sk-ant-…</code>) or a{" "}
                <strong>GitHub token</strong> (PAT <code style={{ fontFamily: '"IBM Plex Mono",monospace', background: "#f4f4f4", padding: "1px 4px" }}>ghp_…</code>) with GitHub Models access. Stored in <code style={{ fontFamily: '"IBM Plex Mono",monospace', background: "#f4f4f4", padding: "1px 4px" }}>localStorage</code> — never sent to this server.
              </p>
              <input
                type="password"
                className="cds-input"
                placeholder="sk-ant-… or ghp_… / gho_…"
                value={aiExplain.tokenInput}
                onChange={(e) => aiExplain.setTokenInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && aiExplain.saveTokenAndExplain(getWorkflow, applicationName)}
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => aiExplain.setTokenPromptOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => aiExplain.saveTokenAndExplain(getWorkflow, applicationName)}>Save & Explain</button>
            </div>
          </div>
        </div>
      )}

      {/* AI Explain Modal */}
      {aiExplain.explainOpen && (
        <div className="modal-overlay fade-in" onClick={(e) => e.target === e.currentTarget && aiExplain.setExplainOpen(false)}>
          <div className="modal-box slide-up" style={{ maxWidth: 680 }}>
            <div className="modal-header">
              <span className="modal-title">💡 AI Workflow Explainer — {applicationName}</span>
              <button className="modal-close" onClick={() => aiExplain.setExplainOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              {aiExplain.explainLoading ? (
                <div style={{ padding: "40px 0", textAlign: "center", color: "#525252", fontSize: 13 }}>Analysing workflow with AI…</div>
              ) : aiExplain.explainResult ? (
                <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
                  <SimpleMarkdown content={aiExplain.explainResult} />
                </div>
              ) : null}
            </div>
            <div className="modal-footer" style={{ justifyContent: "space-between" }}>
              <button className="btn-link" style={{ fontSize: 12 }} onClick={aiExplain.clearToken}>Clear token</button>
              <button className="btn btn-ghost" onClick={() => aiExplain.setExplainOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Run Modal */}
      {runOpen && (
        <div className="modal-overlay fade-in" onClick={(e) => e.target === e.currentTarget && !runLoading && setRunOpen(false)}>
          <div className="modal-box slide-up" style={{ maxWidth: 680 }}>
            <div className="modal-header">
              <span className="modal-title">Run — {applicationName}</span>
              <button className="modal-close" onClick={() => { if (!runLoading) { cancelStream(); setRunOpen(false); } }}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ fontSize: 12, color: "#525252", background: "#f4f4f4", padding: "10px 12px", marginBottom: 16, lineHeight: 1.6 }}>
                Sends <span className="inline-code">POST</span> to the online service with <span className="inline-code">applicationName</span> and optional <span className="inline-code">confirmationNumber</span>.
              </div>
              <div className="form-group">
                <label className="cds-label">Confirmation Number</label>
                <input className="cds-input" value={confirmationNumber} onChange={(e) => setConfirmationNumber(e.target.value)} disabled={runLoading} />
              </div>
              <div className="form-group">
                <label className="cds-label">Request Body (JSON or XML)</label>
                <textarea
                  className="cds-input"
                  rows={6}
                  value={runBody}
                  onChange={(e) => setRunBody(e.target.value)}
                  style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 12, resize: "vertical" }}
                  disabled={runLoading}
                />
              </div>
              {/* Stream toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <input
                  type="checkbox"
                  id="stream-toggle"
                  checked={streamEnabled}
                  onChange={(e) => { setStreamEnabled(e.target.checked); setStreamEvents([]); setStreamDone(false); setRunResult(null); }}
                  disabled={runLoading}
                  style={{ cursor: "pointer" }}
                />
                <label htmlFor="stream-toggle" style={{ fontSize: 13, color: "#161616", cursor: "pointer" }}>
                  Stream per-step responses (SSE)
                </label>
              </div>

              {/* Normal (non-stream) result */}
              {!streamEnabled && runResult && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.32px", color: "#24a148", marginBottom: 6 }}>✓ Response</div>
                  <pre style={{ background: "#f4f4f4", padding: 12, fontSize: 12, fontFamily: '"IBM Plex Mono",monospace', overflow: "auto", maxHeight: 160, border: "1px solid #e0e0e0" }}>{runResult}</pre>
                </div>
              )}

              {/* SSE stream results */}
              {streamEnabled && (streamEvents.length > 0 || runLoading) && (
                <div style={{ marginTop: 4 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.32px", color: "#161616", marginBottom: 8 }}>
                    Steps {streamDone ? `— ${streamEvents.length} complete` : runLoading ? "— streaming…" : ""}
                  </div>
                  <div style={{ maxHeight: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
                    {streamEvents.map((evt, i) => (
                      <div key={i} style={{ border: "1px solid #e0e0e0", background: "#fafafa" }}>
                        <button
                          onClick={() => toggleStepExpanded(i)}
                          style={{
                            width: "100%", padding: "8px 12px", background: "none", border: "none",
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            cursor: "pointer", fontFamily: "inherit", fontSize: 12,
                          }}
                        >
                          <span style={{ color: "#0f62fe", fontWeight: 600 }}>Step {i + 1}</span>
                          <span style={{ color: "#525252", fontSize: 11 }}>
                            {new Date(evt.timestamp).toLocaleTimeString()} {evt.expanded ? "▲" : "▼"}
                          </span>
                        </button>
                        {evt.expanded && (
                          <pre style={{
                            margin: 0, padding: "8px 12px 12px",
                            fontSize: 11, fontFamily: '"IBM Plex Mono",monospace',
                            background: "#f4f4f4", overflowX: "auto", maxHeight: 200,
                            borderTop: "1px solid #e0e0e0", whiteSpace: "pre-wrap", wordBreak: "break-all",
                          }}>
                            {formatJson(evt.data)}
                          </pre>
                        )}
                      </div>
                    ))}
                    {runLoading && (
                      <div style={{ padding: "10px 12px", fontSize: 12, color: "#525252", background: "#f4f4f4", border: "1px solid #e0e0e0" }}>
                        Waiting for next step…
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {runLoading && streamEnabled
                ? <button className="btn btn-ghost" onClick={cancelStream}>Cancel Stream</button>
                : <button className="btn btn-ghost" onClick={() => { cancelStream(); setRunOpen(false); }}>Close</button>
              }
              <button className="btn btn-primary" onClick={executeRun} disabled={runLoading}>
                {runLoading ? (streamEnabled ? "Streaming…" : "Sending…") : "Send POST /api/workflow"}
              </button>
            </div>
          </div>
        </div>
      )}

      <JsonPathModal open={jsonPathOpen} onClose={() => setJsonPathOpen(false)} />

      <WorkflowGeneratorModal
        open={generatorOpen}
        onClose={() => setGeneratorOpen(false)}
        onGenerated={(wf) => { onWorkflowGenerated?.(wf); }}
        callAI={callAIForGenerator}
        isTokenAvailable={isValidToken(getStoredToken())}
        onNeedToken={handleGeneratorNeedToken}
      />

      <ImportWorkflowModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onApply={(wf) => {
          onWorkflowImported?.(wf);
          showToast("Workflow imported to canvas", "success");
        }}
        hasExistingWorkflow={!!workFlow && (workFlow.pluginList?.length ?? 0) > 0}
      />
    </>
  );
};

export default WorkflowHeader;
