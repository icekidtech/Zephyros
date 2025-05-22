"use client"

import * as React from "react"
import { Search as SearchIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "./input"
import { CustomButton } from "./custom-button"
import { useRouter } from "next/navigation"

export interface SearchResult {
  id: string
  title: string
  description?: string
  url: string
  type?: string
}

export interface SearchProps {
  placeholder?: string
  className?: string
  onSearch?: (query: string) => void | Promise<void>
  onResultSelect?: (result: SearchResult) => void
  results?: SearchResult[]
  loading?: boolean
  showButton?: boolean
  searchPath?: string
}

export function Search({
  placeholder = "Search...",
  className,
  onSearch,
  onResultSelect,
  results = [],
  loading = false,
  showButton = true,
  searchPath = "/search",
}: SearchProps) {
  const [query, setQuery] = React.useState("")
  const [isOpen, setIsOpen] = React.useState(false)
  const router = useRouter()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const resultsRef = React.useRef<HTMLDivElement>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!query.trim()) return
    
    if (onSearch) {
      onSearch(query)
    } else {
      // Navigate to search page with query
      router.push(`${searchPath}?q=${encodeURIComponent(query)}`)
    }
  }

  const handleClear = () => {
    setQuery("")
    inputRef.current?.focus()
  }

  // Close results when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        resultsRef.current && 
        !resultsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Show results when typing
  React.useEffect(() => {
    if (query.trim().length > 0) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }, [query])

  return (
    <div className={cn("relative", className)}>
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="search"
            placeholder={placeholder}
            className="pl-10 pr-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </button>
          )}
        </div>
        
        {showButton && (
          <CustomButton type="submit" variant="default">
            Search
          </CustomButton>
        )}
      </form>

      {/* Results dropdown */}
      {isOpen && results.length > 0 && (
        <div 
          ref={resultsRef}
          className="absolute z-10 mt-1 w-full rounded-md border bg-popover p-2 shadow-md"
        >
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <ul className="max-h-80 overflow-auto">
              {results.map((result) => (
                <li key={result.id}>
                  <button
                    type="button"
                    className="flex w-full flex-col gap-1 rounded-md px-3 py-2 text-left hover:bg-accent"
                    onClick={() => {
                      if (onResultSelect) {
                        onResultSelect(result)
                      } else {
                        router.push(result.url)
                      }
                      setIsOpen(false)
                    }}
                  >
                    <span className="font-medium">{result.title}</span>
                    {result.description && (
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {result.description}
                      </span>
                    )}
                    {result.type && (
                      <span className="mt-1 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {result.type}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}