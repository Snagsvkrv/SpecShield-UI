import { useState } from "react";
import { UrlInput } from "./UrlInput";
import { ProgressBar } from "./ProgressBar";
import { ResultsChart } from "./ResultChart";
import { FullReportAccordion } from "./FullReportAccordion";
import { TenantSelection } from "./TenantSelection";
import { mockProcessingResult } from "../mocks/mockResult";
import { useSpecShieldAPI } from "../hooks/useSpecShieldAPI";

export interface ExecutionDetail {
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
}

export interface ProcessingResult {
  success: number;
  failure: number;
  total: number;
  reportTimestamp?: string;
  executionTime?: string;
  executionDetails?: ExecutionDetail[];
}

export function Dashboard() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [selectedTenant, setSelectedTenant] = useState("IMS_KENYA");
  const { callAPI, fetchReportPage } = useSpecShieldAPI();
  const [executionId, setExecutionId] = useState<string | null>(null);

  const handleSubmit = async (inputUrl: string) => {
    if (!inputUrl || !selectedTenant) return;

    setIsProcessing(true);
    setProgress(0);
    setResult(null);

    try {
      const { generate, report } = await callAPI(selectedTenant, inputUrl, {
        pollIntervalMs: 500,
        maxAttempts: 240,
        onProgress: (pending: number, total: number) => {
          // compute percent from total and pending
          const pct =
            total && total > 0
              ? Math.round(((total - pending) / total) * 100)
              : 0;
          // keep it <100 while polling so the UI waits for finalization step
          setProgress(Math.min(99, Math.max(0, pct)));
        },
      });

      setExecutionId(generate?.executionId ?? null);

      if (report) {
        setResult(report);
      } else {
        setResult(mockProcessingResult);
      }
    } catch (err) {
      console.error("API/report error:", err);
      setResult(mockProcessingResult);
    } finally {
      setProgress(100);
      // small delay for nicer UX
      setTimeout(() => setIsProcessing(false), 300);
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-8">
      <div className="rounded-lg bg-white p-8 shadow-lg">
        {/* <h1 className="mb-8 font-bold text-xl">
          API Automation Test Dashboard
        </h1> */}
        <div className="mb-8 flex items-center gap-2">
          <img src="/logo.png" alt="SpecShield logo" className="h-20 w-auto" />
          <h1 className="font-bold text-xl">API Automation Test Dashboard</h1>
        </div>

        <div className="mb-6 flex flex-col gap-4">
          <div className="flex-1">
            <UrlInput onSubmit={handleSubmit} disabled={isProcessing} />
          </div>
          <div className="w-64">
            <TenantSelection
              onTenantChange={setSelectedTenant}
              disabled={isProcessing}
            />
          </div>
        </div>

        {isProcessing && (
          <div className="mt-8">
            <ProgressBar progress={progress} />
          </div>
        )}

        {result && !isProcessing && (
          <div className="mt-8 space-y-8">
            <ResultsChart data={result} />
            {result.executionDetails && (
              <FullReportAccordion
                executionDetails={result.executionDetails}
                total={result.total}
                pageSize={10}
                executionId={executionId}
                tenant={selectedTenant}
                fetchReportPage={fetchReportPage}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
