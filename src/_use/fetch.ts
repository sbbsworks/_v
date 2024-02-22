import axios, {AxiosInstance, AxiosResponse} from "axios"
import md5Hex from 'md5-hex'

const baseURL = 'http://api.valantis.store:40000/'

export interface IAxiosConfig {
    axiosInstance: AxiosInstance;
    body: {[k:string]: string|number|boolean}
    requestConfig?: {[k:string]: string}
}
export interface ErrorResponseData {
    message: string
}

export const authorizationHeaders = {'X-Auth': md5Hex(`${process.env.API_PASSWORD}_${(new Date()).toISOString().slice(0, 10).replaceAll('-', '')}`)}

export function axiosInstance(): AxiosInstance {
    return axios.create({
        baseURL,
        headers: {
            'Content-Type': 'application/json',
            ...authorizationHeaders
        }
    })
}

export async function _useAxios(config: IAxiosConfig): Promise<{response: Record<string, any>|null, error: string|undefined}> {
    const {
        axiosInstance,
        body,
        requestConfig = {}
    } = config
    const controller = new AbortController()
    try {
        const response = await axiosInstance['post']('', body, {
            ...requestConfig,
            signal: controller.signal
        }) as AxiosResponse<any, any>
        if(response.data.errors) {
            throw new Error(response.data.errors)
        }
        return {
            response: response.data,
            error: undefined
        }
    } catch(error) {
        return {
            response: null,
            error: (error as Error).message
        }
    } finally {
        controller.abort()
    }
}
