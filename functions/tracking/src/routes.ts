import { FunctionRoute } from "@skedulo/sdk-utilities";
import * as pathToRegExp from "path-to-regexp";
import { parse } from "qs";
import { Encrypt } from "./encryption";
import { sendApiRequest, sendGraphqlRequest } from "./utils";

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
      method: "get",
      path: "/config",
      handler: configHandler,
    },
    {
      method: "get",
      path: "/job",
      handler: jobHandler,
    },
    {
      method: "get",
      path: "/location",
      handler: locationHandler,
    },
    {
      method: "get",
      path: "/cancelJob",
      handler: cancelJobHandler,
    },
  ];
}

async function jobHandler(
  body: RequestPayload,
  headers: any,
  method: any,
  path: any,
  skedContext: any,
  querystring?: string | null
) {
  let props;
  let qry;

  try {
    const token = skedContext?.auth.token;
    const baseURL = skedContext.auth.baseUrl;

    const encrypt = new Encrypt(
      skedContext.configVars.getVariableValue("ENCRYPTION_KEY"),
      skedContext.configVars.getVariableValue("ENCRYPTION_IV")
    );

    props = encrypt.handleToken(querystring);

    const mutation = `{
    jobs(filter: "UID == '${props.jobId}'") {
      edges {
        node {
            UID
            Name
            Start
            End
            Duration
            GeoLatitude
            GeoLongitude
            JobStatus
            Address
            Description
            SpecialInstructions
            JobAllocations(filter: "Status != 'Deleted'") {
              Resource {
                Name
                UserId
              }
            }
          }      
        }
      }
    }`;

    qry = mutation;

    const response = (await sendGraphqlRequest(token, baseURL, {
      query: mutation,
    })) as any;

    const result = response as {
      data: {
        jobs: {
          edges: {
            node: {
              UID: string;
              Name: string;
              Start: string;
              End: string;
              GeoLatitude: string;
              GeoLongitude: string;
              JobStatus: string;
              Address: string;
              Description: string;
              Duration: number;
              SpecialInstructions: string;
              JobAllocations: [
                {
                  Resource: {
                    Name: string;
                    UserId: string;
                  };
                }
              ];
            };
          }[];
        };
      };
    };

    const resUserId =
      result.data.jobs.edges[0].node.JobAllocations[0].Resource.UserId;
    let aviURL;

    if (resUserId) {
      const aviResponse = (await sendApiRequest({
        token,
        baseURL,
        path: `files/avatar?user_ids=${resUserId}`,
      })) as any;

      if (aviResponse) {
        aviURL = aviResponse[resUserId];
      }
    }

    const respBody = {
      UID: result.data.jobs.edges[0].node.UID,
      Name: result.data.jobs.edges[0].node.Name,
      Start: result.data.jobs.edges[0].node.Start,
      End: result.data.jobs.edges[0].node.End,
      GeoLatitude: result.data.jobs.edges[0].node.GeoLatitude,
      GeoLongitude: result.data.jobs.edges[0].node.GeoLongitude,
      JobStatus: result.data.jobs.edges[0].node.JobStatus,
      Address: result.data.jobs.edges[0].node.Address,
      Description: result.data.jobs.edges[0].node.Description,
      SpecialInstructions: result.data.jobs.edges[0].node.SpecialInstructions,
      Duration: result.data.jobs.edges[0].node.Duration,
      ResourceFirstName:
        result.data.jobs.edges[0].node.JobAllocations[0].Resource.Name.split(
          " "
        )[0],
      ResourceUserId: resUserId,
      ResourceAviURL: aviURL,
    };
    return {
      status: 200,
      body: { job: respBody },
    };
  } catch (e: any) {
    console.error(e);
    return {
      status: 400,
      body: {
        qry: qry,
        props: props,
        msg: e?.message,
        stack: e?.stack,
        url: e?.config?.url,
        method: e?.config?.method,
        et: e.response.data,
      },
    };
  }
}

async function cancelJobHandler(
  body: RequestPayload,
  headers: any,
  method: any,
  path: any,
  skedContext: any,
  querystring?: string | null
) {
  const token = skedContext?.auth.token;
  const baseURL = skedContext.auth.baseUrl;

  const encrypt = new Encrypt(
    skedContext.configVars.getVariableValue("ENCRYPTION_KEY"),
    skedContext.configVars.getVariableValue("ENCRYPTION_IV")
  );

  const props = encrypt.handleToken(querystring);

  const mutation = `
    mutation updateJob {
      schema {
        updateJobs(input: {
          UID: "${props.jobId}"
          JobStatus: "Cancelled"
          AbortReason: "Cancelled by customer"
          }
        )
      }
    }
  `;

  const response = (await sendGraphqlRequest(token, baseURL, {
    query: mutation,
  })) as any;

  const result = response as any;
  return {
    status: 200,
    body: { job: result },
  };
}

async function configHandler(
  body: RequestPayload,
  headers: any,
  method: any,
  path: any,
  skedContext: any,
  querystring?: string | null
) {
  const token = skedContext?.auth.token;
  const baseURL = skedContext.auth.baseUrl;

  let configName = "default";

  if (querystring) {
    const parsed = parse(querystring);
    if (typeof parsed.configName === "string") {
      configName = parsed.configName;
    }
  }

  const query = `{
  trackingconfiguration(filter: "Default == true") {
		edges {
			node {
            UID
            Name
            BrandPrimaryColour
            BrandSecondaryColour
            ResourceName
            JobName
        }      
      }
    }
  }`;

  const response = (await sendGraphqlRequest(token, baseURL, { query })) as any;

  const result = response as {
    data: {
      trackingconfiguration: {
        edges: {
          node: {
            UID: string;
            Name: string;
            BrandPrimaryColour: string;
            BrandSecondaryColour: string;
            ResourceName: string;
            JobName: string;
            GoogleMapsAPIKey: string;
          };
        }[];
      };
    };
  };

  const parentId = result.data.trackingconfiguration.edges[0].node.UID;
  const logoResponse = (await sendApiRequest({
    token,
    baseURL,
    path: `files/attachments/${parentId}`, //
  })) as any;

  let logoURL;
  if (logoResponse.length > 0) {
    logoURL = logoResponse[0].downloadUrl;
  }

  const toReturn = {
    UID: result.data.trackingconfiguration.edges[0].node.UID,
    Name: result.data.trackingconfiguration.edges[0].node.Name,
    BrandPrimaryColour:
      result.data.trackingconfiguration.edges[0].node.BrandPrimaryColour,
    BrandSecondaryColour:
      result.data.trackingconfiguration.edges[0].node.BrandSecondaryColour,
    ResourceName: result.data.trackingconfiguration.edges[0].node.ResourceName,
    JobName: result.data.trackingconfiguration.edges[0].node.JobName,
    GoogleMapsAPIKey: skedContext.configVars.getVariableValue("GOOGLE_MAPS_KEY"),
    LogoURL: logoURL,
  };

  return {
    status: 200,
    body: toReturn,
  };
}

async function locationHandler(
  body: RequestPayload,
  headers: any,
  method: any,
  path: any,
  skedContext: any,
  querystring?: string | null
) {
  const token = skedContext?.auth.token;
  const baseURL = skedContext.auth.baseUrl;

  const encrypt = new Encrypt(
    skedContext.configVars.getVariableValue("ENCRYPTION_KEY"),
    skedContext.configVars.getVariableValue("ENCRYPTION_IV")
  );

  const props = encrypt.handleToken(querystring);

  const locationResp = (await sendApiRequest({
    token,
    baseURL,
    path: `location/latest?resource_ids=${props.resourceIds}`, //
  })) as any;

  const resId = props.resourceIds.split(",")[0];
  const location = locationResp[resId];

  //TODO: Cache this
  const mutation = `{
    jobs(filter: "UID == '${props.jobId}'") {
      edges {
        node {
            UID
            GeoLatitude
            GeoLongitude
          }      
        }
      }
    }`;

  const jobDetails = (await sendGraphqlRequest(token, baseURL, {
    query: mutation,
  })) as any;

  const joblat = jobDetails.data.jobs.edges[0].node.GeoLatitude;
  const joblng = jobDetails.data.jobs.edges[0].node.GeoLongitude;

  let duration;
  if (joblat && joblng && location && location.lat && location.lng) {
    const dirRequest = {
      requests: [
        {
          origin: { lat: location.lat, lng: location.lng },
          destination: { lat: joblat, lng: joblng },
        },
      ],
    };

    const directions = (await sendApiRequest({
      method: "POST",
      token,
      data: dirRequest,
      baseURL,
      path: `geoservices/directions`, //
    })) as any;
    duration = directions.routes[0][0].travelInfo.duration.durationInSeconds;
  }

  return {
    status: 200,
    body: { ...location, ...props, duration: duration },
  };
}
