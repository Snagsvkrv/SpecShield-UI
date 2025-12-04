// import { useCallback } from "react";

// type GenResponse = {
//   status?: string;
//   executionId?: string;
//   message?: string;
//   [k: string]: any;
// };

// type ReportResponse = {
//   executionDetails?: any[];
//   overview?: {
//     errors?: number;
//     executionTime?: string;
//     pending?: number;
//     successful?: number;
//     total?: number;
//     warnings?: number;
//     [k: string]: any;
//   };
//   reportTimestamp?: string;
//   [k: string]: any;
// };

// function sleep(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// export function useSpecShieldAPI() {
//   const callAPI = useCallback(
//     async (selectedTenant: string, baseUrl: string, opts?: { pollIntervalMs?: number; maxAttempts?: number }) => {
//       const pollIntervalMs = opts?.pollIntervalMs ?? 500;
//       const maxAttempts = opts?.maxAttempts ?? 240; // default ~2 minutes

//       // POST to start execution
//       const genResp = await fetch("http://localhost:9000/specshield/generate", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "x-tenant-id": selectedTenant,
//           "x-client-privileges": '{"root":["root"]}',
//           "x-user-name": "test",
//         },
//         body: JSON.stringify({ baseUrl }),
//       });

//       if (!genResp.ok) {
//         const text = await genResp.text().catch(() => "");
//         throw new Error(`Generate API failed: ${genResp.status} ${text}`);
//       }

//       const genJson: GenResponse = await genResp.json();

//       // If we received an executionId, poll the report endpoint until pending === 0
//       if (genJson.executionId) {
//         const execId = genJson.executionId;
//         const reportUrl = `http://localhost:9000/specshield/report/${execId}?page=0&size=10`;

//         let attempts = 0;
//         while (true) {
//           attempts += 1;

//           const reportResp = await fetch(reportUrl, {
//             method: "GET",
//             headers: {
//               "Content-Type": "application/json",
//               "x-tenant-id": selectedTenant,
//             },
//           });

//           if (!reportResp.ok) {
//             const text = await reportResp.text().catch(() => "");
//             throw new Error(`Report API failed: ${reportResp.status} ${text}`);
//           }

//           const reportJson: ReportResponse = await reportResp.json();

//           const pending = reportJson?.overview?.pending;
//           // If pending is defined and zero => finished
//           if (typeof pending === "number" && pending <= 0) {
//             return { generate: genJson, report: reportJson };
//           }

//           // If no overview/pending present, return the current report (caller can decide)
//           if (typeof pending !== "number") {
//             return { generate: genJson, report: reportJson };
//           }

//           // If exceeded max attempts, return the latest report (or throw if you prefer)
//           if (attempts >= maxAttempts) {
//             // return last-known report so the caller can show partial results/fallback
//             return { generate: genJson, report: reportJson };
//           }

//           // wait before next attempt
//           await sleep(pollIntervalMs);
//         }
//       }

//       // no executionId -> return generate response only
//       return { generate: genJson, report: null };
//     },
//     []
//   );

//   return { callAPI };
// }

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
 * Kept local to avoid coupling with component files.
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

export function useSpecShieldAPI() {
  const callAPI = useCallback(
    async (
      selectedTenant: string,
      baseUrl: string,
      opts?: { pollIntervalMs?: number; maxAttempts?: number }
    ) => {
      const pollIntervalMs = opts?.pollIntervalMs ?? 500;
      const maxAttempts = opts?.maxAttempts ?? 240; // ~2 minutes by default

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

      // Helper to transform a raw report into ProcessingResultMapped
      const transformReport = (raw: RawReportResponse): ProcessingResultMapped => {
        const overview = raw.overview ?? {};
        const executionDetailsRaw = raw.executionDetails ?? [];

        const executionDetails: ExecutionDetailMapped[] = executionDetailsRaw.map((d) => ({
          id: d.id ?? "unknown",
          timestamp: d.timestamp ?? "",
          scenario: d.scenario ?? "",
          expectedResult: d.expectedResult ?? "", // fallback if server doesn't provide
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

          // If pending is defined and zero => finished
          if (typeof pending === "number" && pending <= 0) {
            // transform and return
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

      // no executionId -> return generate response only
      return { generate: genJson, report: null };
    },
    []
  );

  return { callAPI };
}