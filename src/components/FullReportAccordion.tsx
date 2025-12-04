import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle, XCircle } from "lucide-react";
import type { ExecutionDetail } from "./Dashboard";

interface FullReportAccordionProps {
  executionDetails: ExecutionDetail[];
}

export function FullReportAccordion({ executionDetails }: FullReportAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between bg-gray-50 px-6 py-4 transition-colors hover:bg-gray-100"
      >
        <span className="flex items-center gap-2">
          <span>Full Report</span>
          <span className="text-sm text-gray-500">({executionDetails.length} test cases)</span>
        </span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-600" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-600" />
        )}
      </button>

      {isOpen && (
        <div className="overflow-x-auto bg-white p-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="bg-gray-50 px-4 py-3 text-left">Test Case ID</th>
                <th className="bg-gray-50 px-4 py-3 text-left">Description</th>
                <th className="bg-gray-50 px-4 py-3 text-left">Expected Result</th>
                <th className="bg-gray-50 px-4 py-3 text-left">Result</th>
                <th className="bg-gray-50 px-4 py-3 text-left">Details</th>
              </tr>
            </thead>
            <tbody>
              {executionDetails.map((test, index) => (
                <tr
                  key={test.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  }`}
                >
                  <td className="px-4 py-3">{test.id}</td>
                  <td className="max-w-md px-4 py-3">
                    <div className="text-sm">{test.scenario}</div>
                    <div className="mt-1 text-xs text-gray-500">
                      {test.httpMethod.toUpperCase()} {test.contractPath}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">{test.expectedResult}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {test.result === "success" ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="text-green-600">Success</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-red-600" />
                          <span className="text-red-600">Error</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-700">{test.resultDetails}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
