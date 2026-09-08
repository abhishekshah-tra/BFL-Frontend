import { useEffect, useRef, useState } from 'react'
import { Filter, MoreVertical, Search } from 'lucide-react'
import { SEARCH_PLACEHOLDER } from '../../constants/status'
import { searchSuggestions } from '../../services/itemTraceService'
import { countActiveFilters } from '../../utils/format'

export function SearchBar({ query, onQueryChange, onSearch, onOpenFilters, filters }) {
  const [openMenu, setOpenMenu] = useState(false)
  const [openSuggest, setOpenSuggest] = useState(false)
  const wrapRef = useRef(null)
  const suggestions = searchSuggestions(query)
  const filterCount = countActiveFilters(filters)

  useEffect(() => {
    const onDoc = (event) => {
      if (!wrapRef.current?.contains(event.target)) {
        setOpenMenu(false)
        setOpenSuggest(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <div className="search-row" ref={wrapRef}>
      <form
        className="search-field"
        onSubmit={(event) => {
          event.preventDefault()
          onSearch(query)
          setOpenSuggest(false)
        }}
      >
        <Search size={18} className="search-field__icon" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => {
            const value = event.target.value
            onQueryChange(value)
            setOpenSuggest(true)
            if (value.trim().length === 0 || value.trim().length >= 6) onSearch(value)
          }}
          onFocus={() => setOpenSuggest(true)}
          placeholder={SEARCH_PLACEHOLDER}
          aria-label={SEARCH_PLACEHOLDER}
          autoComplete="off"
        />
        {openSuggest && suggestions.length > 0 ? (
          <ul className="suggest-list" role="listbox">
            {suggestions.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => {
                    onQueryChange(item)
                    onSearch(item)
                    setOpenSuggest(false)
                  }}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </form>

      <button type="button" className="btn btn--ghost" onClick={onOpenFilters}>
        <Filter size={16} />
        Filters
        {filterCount > 0 ? <span className="count-badge">{filterCount}</span> : null}
      </button>

      <div className="menu-anchor">
        <button
          type="button"
          className="icon-btn icon-btn--bordered"
          aria-label="More actions"
          aria-expanded={openMenu}
          onClick={() => setOpenMenu((value) => !value)}
        >
          <MoreVertical size={16} />
        </button>
        {openMenu ? (
          <div className="menu" role="menu">
            <button type="button" role="menuitem" onClick={() => window.print()}>
              Print view
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                void navigator.clipboard.writeText(window.location.href)
                setOpenMenu(false)
              }}
            >
              Copy link
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onQueryChange('PO123456')
                onSearch('PO123456')
                setOpenMenu(false)
              }}
            >
              Load sample item
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
