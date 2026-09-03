'use client'

import type { ReactNode } from 'react'
import { PersonasUIProvider } from './PersonasUI'

/**
 * Scopes children under `.bfl-personas` (required by personas.css selectors)
 * and mounts the shared toast/modal UI provider used by the persona pages.
 */
export function PersonasScope({ children }: { children: ReactNode }) {
  return (
    <div className="bfl-personas">
      <PersonasUIProvider>{children}</PersonasUIProvider>
    </div>
  )
}
