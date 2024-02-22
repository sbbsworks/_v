import React from 'react'
import ReactDOM from 'react-dom/client'
import {App} from './App.tsx'
import {MantineProvider} from '@mantine/core'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'

let configIsValid = false
const configErrorMessage = 'Please provide all variables in .env file'

;(function() {
    configIsValid = !!(process.env.API_PASSWORD)
})()

ReactDOM.createRoot(document.getElementById('root')!).render(
    configIsValid ? <React.StrictMode>
        <QueryClientProvider client={new QueryClient()}>
            <MantineProvider>
                <App />
            </MantineProvider>
        </QueryClientProvider>
    </React.StrictMode> : <h1>{configErrorMessage}</h1>,
)
