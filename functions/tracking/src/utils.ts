import axios, { AxiosRequestConfig } from "axios";

export interface RequestProps {
  jobId: string,
  resourceIds: string
  expiry: string,
}

interface ApiProps<RequestPayload> {
  token: string;
  baseURL: string;
  path: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  data?: RequestPayload;
  extraHeaders?: Record<string, string>;
  config?: AxiosRequestConfig;
  customOptions?: APICustomOptions;
}

interface APICustomOptions {
  rawResponse?: boolean;
}

export interface IGraphQLErrorResponse {
  errorType: string;
  message: string;
  mutation_errors: Array<{
    type: string;
    message: string;
  }>;
}

interface IGraphQLRequest {
  query: string;
  variables?: Record<string, any>;
  queryName?: string;
  bulkOperation?: boolean;
}

export const sendApiRequest = async <RequestPayload, RequestResponse>({
  token,
  baseURL,
  path,
  method = "GET",
  data,
  extraHeaders,
  config = {},
  customOptions = {},
}: ApiProps<RequestPayload>): Promise<void> => {

  
  return await axios(`${baseURL}/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Skedulo-Source": "sophies-public-pages-poc",
      ...(extraHeaders && { ...extraHeaders }),
    },
    ...(data && { data }),
    ...config,
  }).then((response) => {
    if (customOptions?.rawResponse) {
      return response.data as unknown as RequestResponse;
    }
    console.log(response)
    return response.data.result;
  });
}

export const sendGraphqlRequest = <T>(
  token: string,
  baseURL: string,
  data: IGraphQLRequest
) =>
  sendApiRequest<IGraphQLRequest, T>({
    token,
    baseURL,
    path: "graphql/graphql",
    method: "POST",
    data,
    customOptions: { rawResponse: true },

});
