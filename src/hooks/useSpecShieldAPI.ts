import { useCallback } from "react";

type GenResponse = {
  status?: string;
  executionId?: string;
  message?: string;
  [k: string]: any;
};

type RawExecutionDetail = {
  id?: string;
  timestamp?: string;
  scenario?: string;
  expectedResult?: string;
  result?: string;
  resultDetails?: string;
  contractPath?: string;
  fullRequestPath?: string;
  httpMethod?: string;
  requestDetails?: {
    headers?: Record<string, string>;
    payload?: Record<string, any>;
    curl?: string;
    [k: string]: any;
  };
  [k: string]: any;
};

type RawReportResponse = {
  executionDetails?: RawExecutionDetail[];
  overview?: {
    errors?: number;
    executionTime?: string;
    pending?: number;
    successful?: number;
    total?: number;
    warnings?: number;
    [k: string]: any;
  };
  reportTimestamp?: string;
  [k: string]: any;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Local shapes matching Dashboard's expected ProcessingResult / ExecutionDetail.
 */
type ExecutionDetailMapped = {
  id: string;
  timestamp: string;
  scenario: string;
  expectedResult: string;
  result: string;
  resultDetails: string;
  contractPath: string;
  fullRequestPath: string;
  httpMethod: string;
  requestDetails: {
    headers: Record<string, string>;
    payload: Record<string, any>;
    curl: string;
  };
};

type ProcessingResultMapped = {
  success: number;
  failure: number;
  total: number;
  reportTimestamp?: string;
  executionTime?: string;
  executionDetails?: ExecutionDetailMapped[];
};

const transformReport = (raw: RawReportResponse): ProcessingResultMapped => {
  const overview = raw.overview ?? {};
  const executionDetailsRaw = raw.executionDetails ?? [];

  const executionDetails: ExecutionDetailMapped[] = executionDetailsRaw.map((d) => ({
    id: d.id ?? "unknown",
    timestamp: d.timestamp ?? "",
    scenario: d.scenario ?? "",
    expectedResult: d.expectedResult ?? "",
    result: d.result ?? "",
    resultDetails: d.resultDetails ?? "",
    contractPath: d.contractPath ?? "",
    fullRequestPath: d.fullRequestPath ?? "",
    httpMethod: d.httpMethod ?? "",
    requestDetails: {
      headers: d.requestDetails?.headers ?? {},
      payload: d.requestDetails?.payload ?? {},
      curl: d.requestDetails?.curl ?? "",
    },
  }));

  return {
    success: overview.successful ?? 0,
    failure: overview.errors ?? 0,
    total: overview.total ?? executionDetails.length,
    reportTimestamp: raw.reportTimestamp ?? new Date().toUTCString(),
    executionTime: overview.executionTime ?? undefined,
    executionDetails,
  };
};

export function useSpecShieldAPI() {
  const callAPI = useCallback(
    async (
      selectedTenant: string,
      baseUrl: string,
      opts?: {
        pollIntervalMs?: number;
        maxAttempts?: number;
        onProgress?: (pending: number, total: number) => void;
      }
    ) => {
      const pollIntervalMs = opts?.pollIntervalMs ?? 500;
      const maxAttempts = opts?.maxAttempts ?? 240;
      const onProgress = opts?.onProgress;

      // POST to start execution
      const genResp = await fetch("http://localhost:9000/specshield/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-id": selectedTenant,
          "x-client-privileges": '{"root":["root"]}',
          "x-user-name": "test",
        },
        body: JSON.stringify({ baseUrl }),
      });

      if (!genResp.ok) {
        const text = await genResp.text().catch(() => "");
        throw new Error(`Generate API failed: ${genResp.status} ${text}`);
      }

      const genJson: GenResponse = await genResp.json();

      // If we received an executionId, poll the report endpoint until pending === 0
      if (genJson.executionId) {
        const execId = genJson.executionId;
        const reportUrl = `http://localhost:9000/specshield/report/${execId}?page=0&size=10`;

        let attempts = 0;
        let lastReportJson: RawReportResponse | null = null;

        while (true) {
          attempts += 1;

          const reportResp = await fetch(reportUrl, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "x-tenant-id": selectedTenant,
            },
          });

          if (!reportResp.ok) {
            const text = await reportResp.text().catch(() => "");
            throw new Error(`Report API failed: ${reportResp.status} ${text}`);
          }

          const reportJson: RawReportResponse = await reportResp.json();
          lastReportJson = reportJson;

          const pending = reportJson?.overview?.pending;
          const total = reportJson?.overview?.total ?? 0;

          // Emit progress callback
          try {
            if (typeof pending === "number") {
              onProgress?.(pending, total);
            }
          } catch {
            // ignore progress callback errors
          }

          // If pending is defined and zero => finished
          if (typeof pending === "number" && pending <= 0) {
            const transformed = transformReport(reportJson);
            return { generate: genJson, report: transformed };
          }

          // If no overview/pending present, return current report transformed
          if (typeof pending !== "number") {
            const transformed = transformReport(reportJson);
            return { generate: genJson, report: transformed };
          }

          // If exceeded max attempts, return last-known transformed report
          if (attempts >= maxAttempts) {
            const transformed = transformReport(lastReportJson as RawReportResponse);
            return { generate: genJson, report: transformed };
          }

          // wait before next attempt
          await sleep(pollIntervalMs);
        }
      }

      // no executionId -> return gen response only
      return { generate: genJson, report: null };
    },
    []
  );

  const fetchReportPage = useCallback(
    async (selectedTenant: string, execId: string, page = 0, size = 10) => {
      const reportUrl = `http://localhost:9000/specshield/report/${execId}?page=${page}&size=${size}`;

      const reportResp = await fetch(reportUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-id": selectedTenant,
        },
      });

      if (!reportResp.ok) {
        const text = await reportResp.text().catch(() => "");
        throw new Error(`Report page fetch failed: ${reportResp.status} ${text}`);
      }

      const reportJson: RawReportResponse = await reportResp.json();
      const transformed = transformReport(reportJson);
      return transformed;
    },
    []
  );

  return { callAPI, fetchReportPage };
}