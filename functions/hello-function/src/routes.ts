/**
 * Describe the entry-point into the "skedulo-function" by updating the
 * array returned by the `getRoutes` method with additional routes
 */
import { FunctionRoute } from "@skedulo/sdk-utilities";
import * as pathToRegExp from "path-to-regexp";

// tslint:disable-next-line:no-empty-interface
interface RequestPayload {}

export function getCompiledRoutes() {
  return getRoutes().map((route) => {
    const regex = pathToRegExp(route.path);

    return {
      regex,
      method: route.method,
      handler: route.handler,
    };
  });
}

function getRoutes(): FunctionRoute[] {
  return [
    {
      method: "get",
      path: "/ping",
      handler: async (__, headers, method, path, skedContext) => {
        const apiServer = skedContext?.auth.baseUrl;
        const configVar = skedContext?.configVars?.getVariableValue("HELLO_FUNCTION_WITH_DEFAULT");

        return {
          status: 200,
          body: {
            result: "pong",
            apiServer,
            HELLO_FUNCTION_WITH_DEFAULT: configVar,
          },
        };
      },
    },
    {
      method: "post",
      path: "/action",
      handler: async (
        body: RequestPayload,
        headers,
        method,
        path,
        skedContext
      ) => {
        const apiServer = skedContext?.auth.baseUrl;

        const userName = skedContext?.userContext.username;

        return {
          status: 200,
          body: { apiServer, userName, requestBody: body },
        };
      },
    },
  ];
}
