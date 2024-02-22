import '@mantine/core/styles.css'
import styles from './app.module.sass'
import Table from '@mui/joy/Table'
import Sheet from '@mui/joy/Sheet'
import {useEffect, useMemo, useState} from 'react'
import {_useQuery} from './_use/query'
import {useQueryClient} from '@tanstack/react-query'
import {TableHead} from './components/TableHead'
import {TableBody} from './components/TableBody'
import {TableFooter} from './components/TableFooter'
import {Loader} from './components/Loader'

export type TItem = {
    number: number|null|string;
    brand: string|null;
    id: string;
    price: number;
    product: string;
}
export enum EFilterTypes {
    brand = 'Brand',
    price = 'Price',
    product = 'Product'
}

export const rowsPerPage = 50
export const startWithPage = 1
export const minimumPageNumber = 1
export const maxPriceInputValue = 10**9
const firstPageNumber = startWithPage > 0 ? startWithPage : minimumPageNumber
enum ERoutes {
    getIds = 'get_ids',
    getItems = 'get_items',
    filter = 'filter'
}
enum EQueryKeys {
    ids = 'ids',
    items = 'items',
    filter = 'filter',
}

export function App(): JSX.Element {
    const [page, setPage] = useState(firstPageNumber)
    const [filter, setFilter] = useState<string|number|undefined>(undefined)
    const [cachedFilter, setCachedFilter] = useState<string|number|undefined>(undefined)
    const [filterType, setFilterType] = useState<EFilterTypes|undefined>(undefined)
    const [filterShouldWait, setFilterShouldWait] = useState<boolean>(true)
    const [isFiltering, setIsFiltering] = useState<boolean>(false)

    const filterQuery = _useQuery({
        queryKeys: [`${EQueryKeys.filter}:${cachedFilter}`],
        enabled: !!(!filterShouldWait && filterType && (cachedFilter || typeof cachedFilter === 'number')),
        body: {
            "action": ERoutes.filter,
            'params': {
                [`${(filterType as string)?.toLowerCase()}`]: filterType === EFilterTypes.price ? +(cachedFilter as string) : cachedFilter
            }
       }
    })
    const {response: filterResponse, error: filterError} = filterQuery?.data as {response: {result: string[]}, error: string | undefined} || {response: undefined, error: undefined}
    if(filterError) {
        console.error(filterError)
        filterQuery.refetch()
    }
    useEffect(() => {
        if(filter) {
            setCachedFilter(() => filter)
        }
    }, [filter])
    useEffect(() => {
        if(!filterType) {
            setPage(() => firstPageNumber)
        }
    }, [filterType])
    useEffect(() => {
        if(filterQuery.isFetching || filterShouldWait) {
            return
        }
        setIsFiltering(() => false)
    }, [filterQuery.isFetching, filterShouldWait])

    const allIdsCountQuery = _useQuery({
        queryKeys: [EQueryKeys.ids],
        enabled: !!(typeof filterResponse === 'undefined') && !isFiltering,//isFilteringRef.current,
        body: {
            "action": ERoutes.getIds,
       }
    })
    const {response: allIdsResponse, error: allIdsError} = allIdsCountQuery?.data as {response: {result: string[]}, error: string | undefined} || {response: undefined, error: undefined}
    if(allIdsError) {
        console.error(allIdsError)
        allIdsCountQuery.refetch()
    }
    const allIds = useMemo(() => [...new Set(filterResponse?.result || allIdsResponse?.result || [])], [filterResponse?.result, allIdsResponse?.result])
    const thisIds = allIds ? allIds.slice((page - 1) * rowsPerPage, rowsPerPage * page) : null
    const maxPagesNumber = Math.ceil(allIds?.length / rowsPerPage)
    const hasAllItems = !!(((useQueryClient()).getQueryState([`${EQueryKeys.items}:${page}`])?.data as {response: any})?.response)
    const hasFilteredItems = !!(((useQueryClient()).getQueryState([`${EQueryKeys.filter}:${cachedFilter}:${page}`])?.data as {response: any})?.response)

    const itemsQuery = _useQuery({
        queryKeys: [filterResponse ? `${EQueryKeys.filter}:${cachedFilter}:${page}` : `${EQueryKeys.items}:${page}`],
        enabled: !!(thisIds?.length) && !!((!hasAllItems && allIdsResponse) || (!hasFilteredItems && filterResponse)),
        keepData: true,
        body: {
            "action": ERoutes.getItems,
            "params": {[EQueryKeys.ids]: thisIds}
       }
    })
    const {response: itemsResponse, error: itemsError} = itemsQuery?.data as {response: {result: TItem[]}, error: string | undefined} || {response: undefined, error: undefined}
    if(itemsError) {
        itemsQuery.refetch()
    }

    const items: TItem[] = prepareItems(itemsResponse?.result, itemsError, allIds, isFiltering, page)

    return <Sheet
            className={styles.container}
            variant="outlined"
        >
            <div>
                <Table className={styles.table}>
                    <TableHead />
                    <TableBody {...{
                        items,
                        itemsError,
                        itemsIsFetching: itemsQuery?.isFetching
                    }}/>
                    <TableFooter {...{
                            page, setPage,
                            cachedFilter, setCachedFilter,
                            filterType, setFilterType,
                            filter, setFilter,
                            setFilterShouldWait,
                            isFiltering, setIsFiltering,
                            maxPagesNumber,
                            allIdsLength: allIds?.length || 0,
                    }} />
                </Table>
                <Loader {...{isFetching: !!(itemsQuery?.isFetching)}}/>
            </div>
      </Sheet>
}

function getDummyItems() {
    return Array(Math.floor(rowsPerPage / 3)).fill({
        number: null,
        brand: null,
        id: null,
        price: null,
        product: null,
    })
}
function prepareItems(items: TItem[], itemsError: string | undefined, allIds: string[], isFiltering: boolean, page: number) {
    if(itemsError || !(allIds?.length) || isFiltering || !items) {
        return getDummyItems()
    }
    return items.reduce((ac, cur) => {
        if(!ac.length) {
            return [...ac, {...cur, number: (page - 1) * rowsPerPage + ac.length + 1}]
        }
        if(!ac.find((item) => item.id === cur.id)) {
            return [...ac, {...cur, number: (page - 1) * rowsPerPage + ac.length + 1}]
        }
        return ac
    }, [] as TItem[])
}
