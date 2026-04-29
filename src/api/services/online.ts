import {
  defaultHeaders,
  handleApiError,
  joinApiUrl,
  ONLINE_API_BASE,
} from '../config';

export type OnlineWorkflowRequest = {
  applicationName: string;
  confirmationNumber?: string;
  channelKind?: string;
  body: string;
  contentType?: string;
};

export type StepEvent = {
  name: string;
  data: string;
  timestamp: number;
};

function randomCorrelationId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `corr-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const onlineApi = {
  /**
   * Streams the workflow execution via SSE (X-Stream-Response: true).
   * Calls onStep for each step_complete event, onError on error events or fetch failures,
   * and onDone when the stream closes.  Returns an AbortController so callers can cancel.
   */
  postWorkflowStream: (
    req: OnlineWorkflowRequest,
    onStep: (event: StepEvent) => void,
    onDone: () => void,
    onError: (msg: string) => void
  ): AbortController => {
    const controller = new AbortController();
    const sp = new URLSearchParams({ applicationName: req.applicationName });
    if (req.confirmationNumber) sp.set('confirmationNumber', req.confirmationNumber);
    if (req.channelKind) sp.set('channelKind', req.channelKind);

    const headers: Record<string, string> = {
      ...defaultHeaders,
      'X-Request-Correlation-Id': randomCorrelationId(),
      'X-Stream-Response': 'true',
      Accept: 'text/event-stream',
      ...(req.contentType ? { 'Content-Type': req.contentType } : {}),
    };

    (async () => {
      try {
        const response = await fetch(
          joinApiUrl(ONLINE_API_BASE, `/workflow?${sp.toString()}`),
          { method: 'POST', headers, body: req.body, signal: controller.signal }
        );
        if (!response.ok || !response.body) {
          const text = await response.text().catch(() => response.statusText);
          onError(text || `HTTP ${response.status}`);
          onDone();
          return;
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop() ?? '';
          for (const block of parts) {
            let eventName = 'step_complete';
            let data = '';
            for (const line of block.split('\n')) {
              if (line.startsWith('event:')) eventName = line.slice(6).trim();
              else if (line.startsWith('data:')) data = line.slice(5).trim();
            }
            if (data) {
              if (eventName === 'error') {
                onError(data);
              } else {
                onStep({ name: eventName, data, timestamp: Date.now() });
              }
            }
          }
        }
        onDone();
      } catch (e: unknown) {
        if ((e as Error).name !== 'AbortError') {
          onError(e instanceof Error ? e.message : String(e));
        }
        onDone();
      }
    })();

    return controller;
  },

  postWorkflow: async (req: OnlineWorkflowRequest): Promise<Response> => {
    const sp = new URLSearchParams({ applicationName: req.applicationName });
    if (req.confirmationNumber) sp.set('confirmationNumber', req.confirmationNumber);
    if (req.channelKind) sp.set('channelKind', req.channelKind);

    const headers: Record<string, string> = {
      ...defaultHeaders,
      'X-Request-Correlation-Id': randomCorrelationId(),
      ...(req.contentType ? { 'Content-Type': req.contentType } : {}),
    };

    const response = await fetch(
      joinApiUrl(ONLINE_API_BASE, `/workflow?${sp.toString()}`),
      {
        method: 'POST',
        headers,
        body: req.body,
      }
    );

    if (!response.ok) {
      return handleApiError(response);
    }
    return response;
  },
};
