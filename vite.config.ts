import {defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({command, mode}) => {
    const env = loadEnv(mode, process.cwd(), '')
    return {
        plugins: [react()],
        define: {
            ...Object.keys(env).reduce((prev: Record<string, string>, key) => {
                const _prev = {...prev}
                if(key.includes('API')) {
                    _prev[`process.env.${key}`] = JSON.stringify(env[key])
                }
                return _prev
            }, {}),
        },
    }
})
