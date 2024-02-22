import {Skeleton} from '@mui/material'
import {TItem} from '../App'

export function TableBody({items, itemsError, itemsIsFetching}: {
        items: TItem[];
        itemsError: string | undefined;
        itemsIsFetching: boolean;
}): JSX.Element {
   return <tbody
            style={{
                overflow: 'scroll',
                height: '100%',
            }}
        >
        {items?.map((item, index) => {
            return <tr
                style={{
                    display: 'table',
                    width: '100%'
                }}
                key={`${item.product}${index}`}
            >
                <td scope="row" title={item.id}>{itemsError || itemsIsFetching ? <Skeleton variant="rectangular" /> : item.number}</td>
                <td>{itemsError || itemsIsFetching ? <Skeleton variant="rectangular" /> : item.brand}</td>
                <td>{itemsError || itemsIsFetching ? <Skeleton variant="rectangular" /> : item.price}</td>
                <td>{itemsError || itemsIsFetching ? <Skeleton variant="rectangular" /> : item.product}</td>
            </tr>
            })}
    </tbody>
}
