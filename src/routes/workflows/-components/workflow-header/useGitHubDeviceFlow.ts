import { useCallback, useEffect, useRef, useState } from "react";

// Public OAuth App client_id — safe to commit (not a secret).
// Replace with your GitHub OAuth App client_id before deploying.
const GITHUB_OAUTH_CLIENT_ID = "Ov23liEP6mlAmOUsuVCn";

// Use app-origin proxy (Vercel rewrite + Vite dev server) so requests are same-origin and not blocked by CORS.
const DEVICE_CODE_URL = "/api/proxy/github/login/device/code";
const ACCESS_TOKEN_URL = "/api/proxy/github/login/oauth/access_token";
const SCOPE = "read:user";
const MAX_NETWORK_RETRIES = 3;

export type DeviceFlowState =
  | { status: "idle" }
  | { status: "requesting" }
  | { status: "awaiting_user"; userCode: string; verificationUri: string }
  | { status: "polling"; userCode: string; verificationUri: string }
  | { status: "success" }
  | { status: "expired" }
  | { status: "denied" }
  | { status: "error"; message: string };

export function useGitHubDeviceFlow(onSuccess: (token: string) => void) {
  const [state, setState] = useState<DeviceFlowState>({ status: "idle" });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const networkRetryRef = useRef(0);
  const cancelledRef = useRef(false);

  const clearPolling = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    clearPolling();
    setState({ status: "idle" });
  }, []);

  const startPolling = useCallback(
    (deviceCode: string, userCode: string, verificationUri: string, intervalSecs: number) => {
      if (cancelledRef.current) return;

      setState({ status: "polling", userCode, verificationUri });
      networkRetryRef.current = 0;

      let currentInterval = intervalSecs * 1000;

      const poll = async () => {
        if (cancelledRef.current) return;

        let response: Response;
        try {
          response = await fetch(ACCESS_TOKEN_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Accept: "application/json",
            },
            body: new URLSearchParams({
              client_id: GITHUB_OAUTH_CLIENT_ID,
              device_code: deviceCode,
              grant_type: "urn:ietf:params:oauth:grant-type:device_code",
            }),
          });
          networkRetryRef.current = 0;
        } catch {
          networkRetryRef.current += 1;
          if (networkRetryRef.current > MAX_NETWORK_RETRIES) {
            clearPolling();
            if (!cancelledRef.current) {
              setState({ status: "error", message: "Network error — could not reach GitHub." });
            }
          }
          // else: keep polling (retry)
          return;
        }

        if (cancelledRef.current) return;

        let data: Record<string, string>;
        try {
          data = await response.json();
        } catch {
          // Malformed response — treat as transient network error
          return;
        }

        if (cancelledRef.current) return;

        if (data.access_token) {
          clearPolling();
          setState({ status: "success" });
          onSuccess(data.access_token);
          return;
        }

        switch (data.error) {
          case "authorization_pending":
            // Keep polling — no state change
            break;

          case "slow_down": {
            // GitHub asks us to slow down; restart interval with new timing
            clearPolling();
            const newIntervalSecs = parseInt(data.interval ?? String(intervalSecs + 5), 10);
            currentInterval = newIntervalSecs * 1000;
            intervalRef.current = setInterval(poll, currentInterval);
            break;
          }

          case "expired_token":
            clearPolling();
            if (!cancelledRef.current) setState({ status: "expired" });
            break;

          case "access_denied":
            clearPolling();
            if (!cancelledRef.current) setState({ status: "denied" });
            break;

          default:
            clearPolling();
            if (!cancelledRef.current) {
              setState({
                status: "error",
                message: data.error_description ?? data.error ?? "Unknown error from GitHub.",
              });
            }
        }
      };

      intervalRef.current = setInterval(poll, currentInterval);
      // Also poll immediately so the user doesn't wait a full interval
      poll();
    },
    [onSuccess],
  );

  const start = useCallback(async () => {
    cancelledRef.current = false;
    clearPolling();
    setState({ status: "requesting" });

    let response: Response;
    try {
      response = await fetch(DEVICE_CODE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams({
          client_id: GITHUB_OAUTH_CLIENT_ID,
          scope: SCOPE,
        }),
      });
    } catch {
      if (!cancelledRef.current) {
        setState({ status: "error", message: "Network error — could not reach GitHub." });
      }
      return;
    }

    if (cancelledRef.current) return;

    let data: Record<string, string | number>;
    try {
      data = await response.json();
    } catch {
      setState({ status: "error", message: "Invalid response from GitHub." });
      return;
    }

    if (cancelledRef.current) return;

    if (!response.ok || !data.device_code) {
      setState({
        status: "error",
        message: String(data.error_description ?? data.error ?? "Failed to start authorization."),
      });
      return;
    }

    const deviceCode = String(data.device_code);
    const userCode = String(data.user_code);
    const verificationUri = String(data.verification_uri ?? "https://github.com/login/device");
    const intervalSecs = typeof data.interval === "number" ? data.interval : 5;

    setState({ status: "awaiting_user", userCode, verificationUri });
    startPolling(deviceCode, userCode, verificationUri, intervalSecs);
  }, [startPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      clearPolling();
    };
  }, []);

  return { state, start, cancel };
}
