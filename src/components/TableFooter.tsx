import styles from '../app.module.sass'

import {MultiSelect, Select} from '@mantine/core'
import Box from '@mui/joy/Box'
import {useEffect, useRef, useState} from 'react'
import {EFilterTypes, maxPriceInputValue, minimumPageNumber, rowsPerPage} from '../App'
import IconButton from '@mui/joy/IconButton'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import {additionalNumberCells} from './TableHead'

const filterInputOnInputReadValueDelay = 600
const filterInputOnPastReadValueDelay = 10

type TTableFooterProps = {
    page: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;
    filter: string | number | undefined;
    setFilter: React.Dispatch<React.SetStateAction<string | number | undefined>>;
    cachedFilter: string | number | undefined;
    setCachedFilter: React.Dispatch<React.SetStateAction<string | number | undefined>>;
    filterType: EFilterTypes | undefined;
    setFilterType: React.Dispatch<React.SetStateAction<EFilterTypes | undefined>>;
    setFilterShouldWait: React.Dispatch<React.SetStateAction<boolean>>;
    isFiltering: boolean,
    setIsFiltering: React.Dispatch<React.SetStateAction<boolean>>;
    maxPagesNumber: number;
    allIdsLength: number;
}

export function TableFooter({
    page,
    setPage,
    cachedFilter,
    filterType,
    setFilterType,
    filter,
    setFilter,
    setCachedFilter,
    setFilterShouldWait,
    isFiltering,
    setIsFiltering,
    maxPagesNumber,
    allIdsLength
}: TTableFooterProps): JSX.Element {
    const filterTimeOutRef = useRef<NodeJS.Timeout|undefined>(undefined)
    const [filterShouldClose, setFilterShouldClose] = useState<boolean>(false)
    const dropdownOpened = filterShouldClose ? {dropdownOpened: false}: {}
    useEffect(() => {

    }, [allIdsLength])

    return <tfoot className={styles.footer}>
        <tr>
            <td colSpan={[...additionalNumberCells, ...Object.entries(EFilterTypes)].length}>
                <Box className={styles.content}>
                    <Box className={styles.filter_container}
                        sx={{
                            '& input': {
                                cursor: filterType ? 'text !important': 'inherit !important',
                                caretColor: filterType ? 'initial' :'transparent',
                            }
                        }}
                    >
                        <MultiSelect
                            hidePickedOptions={true}
                            searchValue={cachedFilter || cachedFilter && typeof +cachedFilter === 'number' ? `${cachedFilter}` : ''}
                            searchable
                            placeholder={filterType ? 'Filter' : 'Choose'}
                            {...dropdownOpened}
                            onChange={(value: string[]) => {
                                setFilterType(() => value[0] ? (value[0] as EFilterTypes) : undefined)
                                setFilterShouldClose(() => true)
                                setFilter(() => undefined)
                                setCachedFilter(() => undefined)
                            }}
                            onClick={() => setFilterShouldClose(() => filterType ? true : false)}
                            onInput={(ev: React.SyntheticEvent<HTMLInputElement>) => {
                                clearTimeout(filterTimeOutRef.current)
                                if(!filterType) {
                                    if(ev.currentTarget) {
                                        ev.currentTarget.value = ''
                                    }
                                    setFilter(() => undefined)
                                }
                                const __value = ev.currentTarget?.value
                                setTimeout(() => {
                                    if(__value === '') {
                                        setPage(() => minimumPageNumber)
                                        setCachedFilter(() => '')
                                        setFilterShouldWait(() => false)
                                        return
                                    }
                                    if(filterType === EFilterTypes.price) {
                                        if(__value && isNaN(+__value)) {
                                            setFilter(() => '')
                                            setFilterShouldWait(() => false)
                                            setPage(() => minimumPageNumber)
                                            return
                                        }
                                        const _value = __value && typeof +__value == 'number' ? +__value : cachedFilter
                                        setFilter(() => _value ? (+_value < maxPriceInputValue ? +_value : maxPriceInputValue) : _value)
                                        setFilterShouldWait(() => false)
                                        setPage(() => minimumPageNumber)
                                        return
                                    }
                                    setPage(() => minimumPageNumber)
                                    setFilter(() => __value || cachedFilter)
                                    setFilterShouldWait(() => false)
                                }, filterInputOnPastReadValueDelay)
                            }}
                            onSearchChange={(value: string) => {
                                clearTimeout(filterTimeOutRef.current)
                                if(!filterType) {
                                    setFilter(() => undefined)
                                }
                                setFilterShouldWait(() => true)
                                if(value) {
                                    setIsFiltering(() => true)
                                }
                                setFilter((prev) =>  {
                                    if(value === '') {
                                        return ''
                                    }
                                    if(filterType === EFilterTypes.price) {
                                        if(value && isNaN(+value)) {
                                            return ''
                                        }
                                        const _value = value && typeof +value == 'number' ? +value : prev
                                        return _value ? (+_value < maxPriceInputValue ? +_value : maxPriceInputValue) : _value
                                    }

                                    return value ?? prev
                                })
                                filterTimeOutRef.current = setTimeout(() => {
                                    if(filter || typeof filter === 'number') {
                                        setFilterShouldWait(() => false)
                                    }
                                }, filterInputOnInputReadValueDelay)
                            }}
                            data={Object.values(EFilterTypes)}
                            maxValues={1}
                        />
                    </Box>
                    <Box className={styles.gears_content_container}>
                        <Select
                            value={`${page || minimumPageNumber}`}
                            onChange={(value: string | null) => setPage(() => +(value ?? minimumPageNumber))}
                            data={maxPagesNumber ? [...Array.from(Array(maxPagesNumber).keys()).map((item) => `${item + 1}`)] : [`${minimumPageNumber}`]}
                        />
                        <IconButton
                            className={styles.button}
                            {...{size: 'sm', color: 'neutral', variant: 'outlined'}}
                            disabled={page <= (minimumPageNumber >= 1 ? Math.floor(minimumPageNumber) : 1)}
                            onClick={() => setPage((prev) => prev > 1 ? prev - 1 : (minimumPageNumber >= 1 ? Math.floor(minimumPageNumber) : 1))}
                        ><KeyboardArrowLeftIcon />
                        </IconButton>
                        <IconButton
                            className={styles.button}
                            {...{size: 'sm', color: 'neutral', variant: 'outlined'}}
                            disabled={!!(rowsPerPage * (page || minimumPageNumber) >= (allIdsLength)) || isFiltering}
                            onClick={() => setPage((prev) => rowsPerPage * prev < allIdsLength ? prev + 1 : prev)}
                        ><KeyboardArrowRightIcon />
                        </IconButton>
                    </Box>
                </Box>
            </td>
        </tr>
    </tfoot>
}
