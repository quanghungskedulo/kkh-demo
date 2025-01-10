import axios, { AxiosRequestConfig } from "axios";
import * as crypto from 'crypto';
import { parse } from 'qs'

//TODO: put these in config vars in private func
const algorithm = 'aes-256-cbc';
const key = 'catgirlscatgirlscatgirlscatgirls'
const iv = '1234567812345678'

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

export const encrypt = (text: string) => {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

export const decrypt = (encryptedText: string) => {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
}

export const handleToken = (querystring: string | undefined | null): RequestProps => {

  if (!querystring) { throw new Error("token is required") }

  const parsed = parse(querystring);

  if(!parsed.token && typeof parsed.token == 'string') { throw new Error("token is required") }

  const requestProps = JSON.parse(decrypt(parsed.token as string)) as RequestProps

  if(Date.parse(requestProps.expiry) < Date.now()) {
     throw new Error("token is expired")
  }

  return requestProps

}