import {ReactNode, createContext, useState} from 'react'

export const Context = createContext<{
    error: string|undefined;
    notice: string|undefined;
}|undefined>(undefined)
export const SetContext = createContext<React.Dispatch<React.SetStateAction<{
    error: string | undefined;
    notice: string | undefined;
}>>>(() => undefined)

export function ContextProvider({children}: {children: ReactNode}): JSX.Element {
    const [context, setContext] = useState<{
        error: string|undefined;
        notice: string|undefined;
    }>({
        error:undefined,
        notice: undefined,
    })
    return <Context.Provider value={context}>
            <SetContext.Provider value={setContext}>
                {children}
            </SetContext.Provider>
    </Context.Provider>
}