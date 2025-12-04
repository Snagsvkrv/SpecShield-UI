// import { useEffect, useState } from "react";
// import { ChevronDown, ChevronUp, CheckCircle, XCircle } from "lucide-react";
// import type { ExecutionDetail } from "./Dashboard";

// interface FullReportAccordionProps {
//   executionDetails: ExecutionDetail[]; // initial page (page 0)
//   total?: number; // overall total count
//   pageSize?: number; // defaults to 10
//   executionId?: string | null;
//   tenant?: string;
//   fetchReportPage?: (
//     tenant: string,
//     execId: string,
//     page: number,
//     size: number
//   ) => Promise<any>;
// }

// export function FullReportAccordion({
//   executionDetails,
//   total = 0,
//   pageSize = 10,
//   executionId,
//   tenant,
//   fetchReportPage,
// }: FullReportAccordionProps) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [page, setPage] = useState(0);
//   const [currentRows, setCurrentRows] =
//     useState<ExecutionDetail[]>(executionDetails);
//   const [loadingPage, setLoadingPage] = useState(false);

//   useEffect(() => {
//     // reset when new executionDetails arrive
//     setCurrentRows(executionDetails);
//     setPage(0);
//   }, [executionDetails]);

//   const totalPages = Math.max(
//     1,
//     Math.ceil((total ?? currentRows.length) / pageSize)
//   );

//   const loadPage = async (p: number) => {
//     if (p < 0 || p >= totalPages) return;
//     if (!fetchReportPage || !executionId || !tenant) {
//       // just show sliced data if we don't have a fetch function
//       // (fallback)
//       const start = p * pageSize;
//       setCurrentRows(executionDetails.slice(start, start + pageSize));
//       setPage(p);
//       return;
//     }

//     try {
//       setLoadingPage(true);
//       const pageResult = await fetchReportPage(
//         tenant,
//         executionId,
//         p,
//         pageSize
//       );
//       // fetchReportPage returns ProcessingResult-shaped object
//       setCurrentRows(pageResult.executionDetails ?? []);
//       setPage(p);
//     } catch (err) {
//       console.error("Failed to fetch report page:", err);
//     } finally {
//       setLoadingPage(false);
//     }
//   };

//   const renderPagination = () => {
//     if ((total ?? 0) <= pageSize) return null;

//     // show a compact range of pages around current page
//     const windowSize = 5;
//     const pages: number[] = [];
//     let start = Math.max(0, page - Math.floor(windowSize / 2));
//     let end = start + windowSize - 1;
//     if (end >= totalPages) {
//       end = totalPages - 1;
//       start = Math.max(0, end - (windowSize - 1));
//     }

//     for (let i = start; i <= end; i++) pages.push(i);

//     return (
//       <div className="mt-4 flex items-center justify-between">
//         <div className="text-sm text-gray-600">
//           Showing page <strong>{page + 1}</strong> of{" "}
//           <strong>{totalPages}</strong> — {total} items
//         </div>

//         <div className="flex items-center gap-2">
//           <button
//             onClick={() => loadPage(page - 1)}
//             disabled={page === 0 || loadingPage}
//             className={`px-3 py-1 rounded-md border ${page === 0 ? "border-gray-200 text-gray-400" : "border-gray-300 text-gray-700"} bg-white`}
//           >
//             Prev
//           </button>

//           {pages.map((p) => (
//             <button
//               key={p}
//               onClick={() => loadPage(p)}
//               disabled={p === page || loadingPage}
//               className={`min-w-[36px] px-3 py-1 rounded-md border ${
//                 p === page
//                   ? "bg-blue-600 text-white border-blue-600"
//                   : "bg-white text-gray-700 border-gray-300"
//               }`}
//             >
//               {p + 1}
//             </button>
//           ))}

//           <button
//             onClick={() => loadPage(page + 1)}
//             disabled={page === totalPages - 1 || loadingPage}
//             className={`px-3 py-1 rounded-md border ${page === totalPages - 1 ? "border-gray-200 text-gray-400" : "border-gray-300 text-gray-700"} bg-white`}
//           >
//             Next
//           </button>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="overflow-hidden rounded-lg border border-gray-200">
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="flex w-full items-center justify-between bg-gray-50 px-6 py-4 transition-colors hover:bg-gray-100"
//       >
//         <span className="flex items-center gap-2">
//           <span>Full Report</span>
//           <span className="text-sm text-gray-500">
//             ({total ?? executionDetails.length} test cases)
//           </span>
//         </span>
//         {isOpen ? (
//           <ChevronUp className="h-5 w-5 text-gray-600" />
//         ) : (
//           <ChevronDown className="h-5 w-5 text-gray-600" />
//         )}
//       </button>

//       {isOpen && (
//         <div className="bg-white p-6">
//           <div className="overflow-x-auto">
//             <table className="w-full border-collapse">
//               <thead>
//                 <tr className="border-b border-gray-200">
//                   <th className="bg-gray-50 px-4 py-3 text-left">
//                     Test Case ID
//                   </th>
//                   <th className="bg-gray-50 px-4 py-3 text-left">
//                     Description
//                   </th>
//                   <th className="bg-gray-50 px-4 py-3 text-left">Result</th>
//                   <th className="bg-gray-50 px-4 py-3 text-left">Details</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {currentRows.length === 0 ? (
//                   <tr>
//                     <td
//                       colSpan={4}
//                       className="px-4 py-6 text-center text-sm text-gray-500"
//                     >
//                       {loadingPage
//                         ? "Loading..."
//                         : "No test cases available for this page."}
//                     </td>
//                   </tr>
//                 ) : (
//                   currentRows.map((test, index) => (
//                     <tr
//                       key={test.id ?? index}
//                       className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${
//                         index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
//                       }`}
//                     >
//                       <td className="px-4 py-3">{test.id}</td>
//                       <td className="max-w-md px-4 py-3">
//                         <div className="text-sm">{test.scenario}</div>
//                         <div className="mt-1 text-xs text-gray-500">
//                           {test.httpMethod?.toUpperCase?.() ?? ""}{" "}
//                           {test.contractPath}
//                         </div>
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className="flex items-center gap-2">
//                           {test.result === "success" ? (
//                             <>
//                               <CheckCircle className="h-5 w-5 text-green-600" />
//                               <span className="text-green-600">Success</span>
//                             </>
//                           ) : (
//                             <>
//                               <XCircle className="h-5 w-5 text-red-600" />
//                               <span className="text-red-600">Error</span>
//                             </>
//                           )}
//                         </div>
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className="text-sm text-gray-700">
//                           {test.resultDetails}
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {renderPagination()}
//         </div>
//       )}
//     </div>
//   );
// }

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle, XCircle } from "lucide-react";
import type { ExecutionDetail } from "./Dashboard";

interface FullReportAccordionProps {
  executionDetails: ExecutionDetail[]; // initial page (page 0)
  total?: number; // overall total count
  pageSize?: number; // defaults to 10
  executionId?: string | null;
  tenant?: string;
  fetchReportPage?: (
    tenant: string,
    execId: string,
    page: number,
    size: number
  ) => Promise<any>;
}

export function FullReportAccordion({
  executionDetails,
  total = 0,
  pageSize = 10,
  executionId,
  tenant,
  fetchReportPage,
}: FullReportAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [currentRows, setCurrentRows] =
    useState<ExecutionDetail[]>(executionDetails);
  const [loadingPage, setLoadingPage] = useState(false);

  // ref to the table wrapper — we'll scroll this into view when page changes
  const tableRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // reset when new executionDetails arrive
    setCurrentRows(executionDetails);
    setPage(0);
  }, [executionDetails]);

  useEffect(() => {
    // Scroll the table heading into view when page changes, only if accordion is open
    if (isOpen && tableRef.current) {
      try {
        tableRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch {
        // ignore if scrollIntoView not supported
      }
    }
  }, [page, isOpen]);

  const totalPages = Math.max(
    1,
    Math.ceil((total ?? currentRows.length) / pageSize)
  );

  const loadPage = async (p: number) => {
    if (p < 0 || p >= totalPages) return;
    if (!fetchReportPage || !executionId || !tenant) {
      // fallback: slice the provided executionDetails
      const start = p * pageSize;
      setCurrentRows(executionDetails.slice(start, start + pageSize));
      setPage(p);
      return;
    }

    try {
      setLoadingPage(true);
      const pageResult = await fetchReportPage(
        tenant,
        executionId,
        p,
        pageSize
      );
      // fetchReportPage returns ProcessingResult-shaped object
      setCurrentRows(pageResult.executionDetails ?? []);
      setPage(p);
    } catch (err) {
      console.error("Failed to fetch report page:", err);
    } finally {
      setLoadingPage(false);
    }
  };

  const renderPagination = () => {
    if ((total ?? 0) <= pageSize) return null;

    const windowSize = 5;
    const pages: number[] = [];
    let start = Math.max(0, page - Math.floor(windowSize / 2));
    let end = start + windowSize - 1;
    if (end >= totalPages) {
      end = totalPages - 1;
      start = Math.max(0, end - (windowSize - 1));
    }

    for (let i = start; i <= end; i++) pages.push(i);

    return (
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing page <strong>{page + 1}</strong> of{" "}
          <strong>{totalPages}</strong> — {total} items
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadPage(page - 1)}
            disabled={page === 0 || loadingPage}
            className={`px-3 py-1 rounded-md border ${page === 0 ? "border-gray-200 text-gray-400" : "border-gray-300 text-gray-700"} bg-white`}
          >
            Prev
          </button>

          {pages.map((p) => (
            <button
              key={p}
              onClick={() => loadPage(p)}
              disabled={p === page || loadingPage}
              className={`min-w-[36px] px-3 py-1 rounded-md border ${
                p === page
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              {p + 1}
            </button>
          ))}

          <button
            onClick={() => loadPage(page + 1)}
            disabled={page === totalPages - 1 || loadingPage}
            className={`px-3 py-1 rounded-md border ${page === totalPages - 1 ? "border-gray-200 text-gray-400" : "border-gray-300 text-gray-700"} bg-white`}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between bg-gray-50 px-6 py-4 transition-colors hover:bg-gray-100"
      >
        <span className="flex items-center gap-2">
          <span>Full Report</span>
          <span className="text-sm text-gray-500">
            ({total ?? executionDetails.length} test cases)
          </span>
        </span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-600" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-600" />
        )}
      </button>

      {isOpen && (
        <div className="bg-white p-6" ref={tableRef}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="bg-gray-50 px-4 py-3 text-left">
                    Test Case ID
                  </th>
                  <th className="bg-gray-50 px-4 py-3 text-left">
                    Description
                  </th>
                  <th className="bg-gray-50 px-4 py-3 text-left">Result</th>
                  <th className="bg-gray-50 px-4 py-3 text-left">Details</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-6 text-center text-sm text-gray-500"
                    >
                      {loadingPage
                        ? "Loading..."
                        : "No test cases available for this page."}
                    </td>
                  </tr>
                ) : (
                  currentRows.map((test, index) => (
                    <tr
                      key={test.id ?? index}
                      className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="px-4 py-3">{test.id}</td>
                      <td className="max-w-md px-4 py-3">
                        <div className="text-sm">{test.scenario}</div>
                        <div className="mt-1 text-xs text-gray-500">
                          {test.httpMethod?.toUpperCase?.() ?? ""}{" "}
                          {test.contractPath}
                        </div>
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
                        <div className="text-sm text-gray-700">
                          {test.resultDetails}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {renderPagination()}
        </div>
      )}
    </div>
  );
}
