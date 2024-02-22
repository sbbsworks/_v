import {CircularProgress, Backdrop} from "@mui/material"

export function Loader({isFetching}: {isFetching: boolean}): JSX.Element {
   return <Backdrop
            sx={{ color: 'light-gray', zIndex: 10, backgroundColor: 'rgba(0, 0, 0, 0.05) !important', cursor: 'pointer'}}
            open={isFetching}
        >
            <CircularProgress color="inherit"
    />
    </Backdrop>
}
