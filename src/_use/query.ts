import {keepPreviousData, useQuery} from '@tanstack/react-query'
import {_useAxios, axiosInstance} from './fetch'

export type TQueryResponse = Promise<{response: Record<string, any> | null, error: string | undefined}>
export function _useQuery({
    body,
    enabled,
    queryKeys,
    keepData = false
}: {
    body: Record<string, any>;
    enabled: boolean;
    queryKeys: string[],
    keepData?: boolean
}) {
    const placeholderData = keepData ? {placeholderData: keepPreviousData} : {}
    return useQuery({
        queryKey: [...queryKeys],
        queryFn: async ():TQueryResponse => {
            const {response, error} = await _useAxios({
                axiosInstance: axiosInstance(),
                body,
            })
            return {response, error}
        },
        ...placeholderData,
        refetchOnWindowFocus: false,
        enabled
    })
}
