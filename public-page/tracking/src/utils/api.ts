import axios from "axios"

//TODO: make dynamic
const baseURL = "https://kkh-demo.my-dev.test.skl.io/function/tracking"

export const getJobInfo = async (token: string) => {
    const { data: {
        job
      } 
    } = await makeAPICall(`${baseURL}/job`, {token});
    return job;
}

export const getLocation = async (token: string) => {
    const { data } = await makeAPICall(`${baseURL}/location`, {token});
    return data;      
}

export const getConfig = async () => {
    const { data } = await makeAPICall(`${baseURL}/config`, {})
    return data
}

export const cancelJob = async(token: string) => {
    await makeAPICall(`${baseURL}/cancelJob`, {token});
}

const makeAPICall = async (endpoint: string, params: unknown) => {
    return await axios.get(endpoint, { params })
}