import {Link} from '@mui/material'
import {EFilterTypes} from '../App'

export const additionalNumberCells = [['number', '#',]]

export function TableHead() {
    return <thead>
        <tr>{[...additionalNumberCells, ...Object.entries(EFilterTypes)].map((headCell) => {
            return <th key={headCell[0]}>
                <Link
                    underline="none"
                    color="neutral"
                    component="button"
                    fontWeight="lg"
                    sx={{cursor: 'default'}}
                >{headCell[1]}
                </Link>
            </th>
        })}</tr>
    </thead>
}
