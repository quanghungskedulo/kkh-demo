import { FunctionRoute } from "@skedulo/sdk-utilities";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import * as pathToRegExp from "path-to-regexp";
import { RequestProps, encrypt, sendGraphqlRequest } from "./utils";

interface RequestPayload {
  [key: string]: any;
}

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
      method: "post",
      path: "/generateToken",
      handler: tokenHandler,
    },
  ];
}

async function tokenHandler(
  body: RequestPayload,
  headers: any,
  method: any,
  path: any,
  skedContext: any,
  querystring?: string | null
) {
  const token = skedContext?.auth.token;
  const baseURL = skedContext.auth.baseUrl;

  const skedBaseURL =
    skedContext.configVars.getVariableValue("SKEDULO_BASE_URL");

  try {
    const requrstParams: RequestProps = {
      jobId: body[0].data.jobs.UID as string,
      resourceIds: body[0].data.jobs.JobAllocations[0].ResourceId as string,
      expiry: body[0].data.jobs.End as string,
    };

    console.log(requrstParams);

    const genToken = encrypt(JSON.stringify(requrstParams));

    const mutation = `
      mutation updateJob {
        schema {
          updateJobs(input: {
            UID: "${body[0].data.jobs.UID}"
            TrackingURL: "${skedBaseURL}/pages/tracking/?token=${genToken}"
            }
          )
        }
      }
    `;
    const result = (await sendGraphqlRequest(token, baseURL, {
      query: mutation,
    })) as any;

    return {
      status: 200,
      body: {
        result,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      status: 500,
      body: {
        error: error,
        body: body[0],
      },
    };
  }
}
