import { useState } from "react";
import { UrlInput } from "./UrlInput";
import { ProgressBar } from "./ProgressBar";
import { ResultsChart } from "./ResultChart";
import { FullReportAccordion } from "./FullReportAccordion";

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

  const handleSubmit = async (url: string) => {
    setIsProcessing(true);
    setProgress(0);
    setResult(null);

    // Simulate backend processing with progress updates
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 300);

    // Simulate API call
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);

      // Mock result data based on the backend response format
      const mockResult: ProcessingResult = {
        reportTimestamp: new Date().toUTCString(),
        executionTime: "4m45s",
        total: 2714,
        success: 2182,
        failure: 532,
        executionDetails: [
          {
            id: "Test 1",
            timestamp: "Thu, 3 Aug 2023 20:17:24 +0300",
            scenario:
              "Send [values containing zalgo text] in request fields: field [name], value [PREFIX with...], is required [FALSE]",
            expectedResult: "Should return [2XX]",
            result: "error",
            resultDetails: "Unexpected behaviour: expected [200, 201, 202, 204], actual [400]",
            contractPath: "/admin/users",
            fullRequestPath: "http://localhost:8091/admin/users",
            httpMethod: "post",
            requestDetails: {
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              payload: {
                name: "F̷̢V̸͝F̶o̵7̸c̷S̵",
                email: "YYmuScool.cats@cats.io",
              },
              curl: 'curl -X POST \'http://localhost:8091/admin/users\' -H \'Content-Type: application/json\' -d \'{"name":"F̷̢V̸͝F̶o̵7̸c̷S̵","email":"YYmuScool.cats@cats.io"}\'',
            },
          },
          {
            id: "Test 2",
            timestamp: "Thu, 3 Aug 2023 20:17:30 +0300",
            scenario:
              "Send [valid values] in request fields: field [name], value [John Doe], is required [TRUE]",
            expectedResult: "Should return [2XX]",
            result: "success",
            resultDetails: "Response matched expected: actual [201]",
            contractPath: "/admin/users",
            fullRequestPath: "http://localhost:8091/admin/users",
            httpMethod: "post",
            requestDetails: {
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              payload: {
                name: "John Doe",
                email: "johndoe@cats.io",
              },
              curl: 'curl -X POST \'http://localhost:8091/admin/users\' -H \'Content-Type: application/json\' -d \'{"name":"John Doe","email":"johndoe@cats.io"}\'',
            },
          },
          {
            id: "Test 3",
            timestamp: "Thu, 3 Aug 2023 20:17:35 +0300",
            scenario: "Send [empty string] in required field [email]",
            expectedResult: "Should return [4XX]",
            result: "success",
            resultDetails: "Response matched expected: actual [400]",
            contractPath: "/admin/users",
            fullRequestPath: "http://localhost:8091/admin/users",
            httpMethod: "post",
            requestDetails: {
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              payload: {
                name: "Test User",
                email: "",
              },
              curl: 'curl -X POST \'http://localhost:8091/admin/users\' -H \'Content-Type: application/json\' -d \'{"name":"Test User","email":""}\'',
            },
          },
          {
            id: "Test 4",
            timestamp: "Thu, 3 Aug 2023 20:17:40 +0300",
            scenario: "Send [SQL injection] in field [name]",
            expectedResult: "Should return [2XX] or [4XX]",
            result: "error",
            resultDetails: "Server error: actual [500]",
            contractPath: "/admin/users",
            fullRequestPath: "http://localhost:8091/admin/users",
            httpMethod: "post",
            requestDetails: {
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              payload: {
                name: "'; DROP TABLE users; --",
                email: "hacker@cats.io",
              },
              curl: 'curl -X POST \'http://localhost:8091/admin/users\' -H \'Content-Type: application/json\' -d \'{"name":"\'; DROP TABLE users; --","email":"hacker@cats.io"}\'',
            },
          },
        ],
      };

      setTimeout(() => {
        setResult(mockResult);
        setIsProcessing(false);
      }, 500);
    }, 5000);
  };

  return (
    <div className="mx-auto max-w-6xl p-8">
      <div className="rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-8 font-bold text-xl">API Automation Test Dashboard</h1>

        <UrlInput onSubmit={handleSubmit} disabled={isProcessing} />

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
