import { X, Copy, Check } from "lucide-react";
import { useState } from "react";

interface Assertion {
  condition: string;
  expectedValue: string | null;
  jsonPath: string | null;
  max: number | null;
  min: number | null;
  type: string;
}

interface TestCaseDetail {
  contractPath: string;
  expectedResult: {
    assertions: Assertion[];
    responseSchema: string;
    statusCode: number;
  };
  fullRequestPath: string;
  httpMethod: string;
  id: string;
  requestDetails: {
    curl: string;
    headers: Record<string, string>;
    payload: string;
  };
  responseDetails: {
    responseBody: string;
    responseHeaders: Record<string, string>;
    responseStatus: number;
  };
  result: string;
  resultDetails: string;
  scenario: string;
  testKey: string;
  timestamp: string;
}

interface TestCaseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  testCaseData: TestCaseDetail | null;
}

export function TestCaseDrawer({
  isOpen,
  onClose,
  testCaseData,
}: TestCaseDrawerProps) {
  const [copiedCurl, setCopiedCurl] = useState(false);

  if (!isOpen || !testCaseData) return null;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(testCaseData.requestDetails.curl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const formatJson = (jsonString: string) => {
    try {
      return JSON.stringify(JSON.parse(jsonString), null, 2);
    } catch {
      return jsonString;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-3xl bg-white shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-gray-900">Test Case Details</h2>
            <p className="text-sm text-gray-600 mt-1">{testCaseData.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-900" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Overview */}
          <section>
            <h3 className="mb-3 text-gray-900">Overview</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Scenario:</span>
                <span className="text-gray-900">{testCaseData.scenario}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">HTTP Method:</span>
                <span className="uppercase text-gray-900">
                  {testCaseData.httpMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Timestamp:</span>
                <span className="text-gray-900">
                  {new Date(testCaseData.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Test Key:</span>
                <span className="font-mono text-sm text-gray-900">
                  {testCaseData.testKey}
                </span>
              </div>
            </div>
          </section>

          {/* Result */}
          <section>
            <h3 className="mb-3 text-gray-900">Result</h3>
            <div
              className={`rounded-lg p-4 border-2 ${
                testCaseData.result === "success"
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={
                    testCaseData.result === "success"
                      ? "text-green-700"
                      : "text-red-700"
                  }
                >
                  {testCaseData.result === "success" ? "✓ Success" : "✗ Error"}
                </span>
              </div>
              <p className="text-sm text-gray-900">
                {testCaseData.resultDetails}
              </p>
            </div>
          </section>

          {/* Request Details */}
          <section>
            <h3 className="mb-3 text-gray-900">Request Details</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Endpoint
                </label>
                <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm break-all text-gray-900">
                  {testCaseData.fullRequestPath}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Headers
                </label>
                <div className="bg-gray-50 rounded-lg p-3">
                  <pre className="text-sm overflow-x-auto text-gray-900">
                    {JSON.stringify(
                      testCaseData.requestDetails.headers,
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Payload
                </label>
                <div className="bg-gray-50 rounded-lg p-3">
                  <pre className="text-sm overflow-x-auto text-gray-900">
                    {formatJson(testCaseData.requestDetails.payload)}
                  </pre>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm text-gray-600">cURL Command</label>
                  <button
                    onClick={handleCopyCurl}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    {copiedCurl ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-gray-900 text-gray-100 rounded-lg p-3 font-mono text-sm overflow-x-auto">
                  {testCaseData.requestDetails.curl}
                </div>
              </div>
            </div>
          </section>

          {/* Expected Result */}
          <section>
            <h3 className="mb-3 text-gray-900">Expected Result</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Status Code
                </label>
                <div className="bg-gray-50 rounded-lg p-3 text-gray-900">
                  {testCaseData.expectedResult.statusCode}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Assertions
                </label>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  {testCaseData.expectedResult.assertions.map(
                    (assertion, index) => (
                      <div
                        key={index}
                        className="border-b border-gray-200 pb-2 last:border-0"
                      >
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <span className="text-gray-600">Type:</span>
                          <span className="text-gray-900">
                            {assertion.type}
                          </span>
                          <span className="text-gray-600">Condition:</span>
                          <span className="text-gray-900">
                            {assertion.condition}
                          </span>
                          {assertion.jsonPath && (
                            <>
                              <span className="text-gray-600">JSON Path:</span>
                              <span className="font-mono text-gray-900">
                                {assertion.jsonPath}
                              </span>
                            </>
                          )}
                          {(assertion.min !== null ||
                            assertion.max !== null) && (
                            <>
                              <span className="text-gray-600">Range:</span>
                              <span className="text-gray-900">
                                {assertion.min} - {assertion.max}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Response Schema
                </label>
                <div className="bg-gray-50 rounded-lg p-3">
                  <pre className="text-sm overflow-x-auto text-gray-900">
                    {formatJson(testCaseData.expectedResult.responseSchema)}
                  </pre>
                </div>
              </div>
            </div>
          </section>

          {/* Response Details */}
          <section>
            <h3 className="mb-3 text-gray-900">Response Details</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Status Code
                </label>
                <div
                  className={`rounded-lg p-3 ${
                    testCaseData.responseDetails.responseStatus >= 200 &&
                    testCaseData.responseDetails.responseStatus < 300
                      ? "bg-green-50 text-green-700"
                      : testCaseData.responseDetails.responseStatus >= 400
                        ? "bg-red-50 text-red-700"
                        : "bg-gray-50 text-gray-900"
                  }`}
                >
                  {testCaseData.responseDetails.responseStatus}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Response Headers
                </label>
                <div className="bg-gray-50 rounded-lg p-3">
                  <pre className="text-sm overflow-x-auto text-gray-900">
                    {JSON.stringify(
                      testCaseData.responseDetails.responseHeaders,
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Response Body
                </label>
                <div className="bg-gray-50 rounded-lg p-3">
                  <pre className="text-sm overflow-x-auto text-gray-900">
                    {formatJson(testCaseData.responseDetails.responseBody)}
                  </pre>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
