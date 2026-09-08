import { createContext, useContext } from 'react'

const LayoutContext = createContext({
  onMenuClick: () => undefined,
})

export function LayoutProvider({ value, children }) {
  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
}

export function useLayout() {
  return useContext(LayoutContext)
}
