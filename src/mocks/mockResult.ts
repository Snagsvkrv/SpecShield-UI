import type { ProcessingResult } from "../components/Dashboard";

export const mockProcessingResult: ProcessingResult = {
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
      resultDetails:
        "Unexpected behaviour: expected [200, 201, 202, 204], actual [400]",
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