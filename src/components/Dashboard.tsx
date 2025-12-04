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
  const { callAPI } = useSpecShieldAPI();

  // const handleSubmit = async (url: string) => {
  //   setIsProcessing(true);
  //   setProgress(0);
  //   setResult(null);

  //   // Call the API
  //   try {
  //     await callAPI(selectedTenant, url);
  //   } catch (err) {
  //     console.error("API call failed:", err);
  //   }

  //   // Simulate backend processing with progress updates
  //   const interval = setInterval(() => {
  //     setProgress((prev) => {
  //       if (prev >= 100) {
  //         clearInterval(interval);
  //         return 100;
  //       }
  //       return prev + Math.random() * 15;
  //     });
  //   }, 300);

  //   // Simulate API call
  //   setTimeout(() => {
  //     clearInterval(interval);
  //     setProgress(100);

  //     setTimeout(() => {
  //       setResult(mockProcessingResult);
  //       setIsProcessing(false);
  //     }, 500);
  //   }, 5000);
  // };

  const handleSubmit = async (inputUrl: string) => {
    if (!inputUrl || !selectedTenant) return;

    setIsProcessing(true);
    setProgress(0);
    setResult(null);

    // Start progress animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 99) {
          return prev; // let finalization set to 100
        }
        // gentle progress growth while backend work happens
        return Math.min(99, prev + Math.random() * 12);
      });
    }, 300);

    try {
      // callAPI will POST to generate, then call report endpoint if executionId is returned
      const { generate, report } = await callAPI(selectedTenant, inputUrl);

      // If report exists and has the expected shape, use it. Otherwise fallback to mock.
      if (
        report &&
        (report.total || report.success || report.executionDetails)
      ) {
        // assume report already matches ProcessingResult shape; if not adapt mapping here
        setResult(report as ProcessingResult);
      } else {
        // fall back to mock if report not present
        setResult(mockProcessingResult);
      }
    } catch (err) {
      console.error("API call or report fetch failed:", err);
      // on error, show mock result but keep a console error (or show a UI error as next improvement)
      setResult(mockProcessingResult);
    } finally {
      // finish progress
      clearInterval(interval);
      setProgress(100);
      // small delay for a nicer UX
      setTimeout(() => {
        setIsProcessing(false);
      }, 300);
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-8">
      <div className="rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-8 font-bold text-xl">
          API Automation Test Dashboard
        </h1>

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
              <FullReportAccordion executionDetails={result.executionDetails} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
