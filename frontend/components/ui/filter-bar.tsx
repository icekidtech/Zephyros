"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { CustomButton } from "./custom-button"
import { Search, Filter, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface FilterOption {
  id: string
  label: string
  options?: { value: string; label: string }[]
}

export interface FilterBarProps {
  placeholder?: string
  onSearch?: (value: string) => void
  filters?: FilterOption[]
  onFilterChange?: (filterId: string, value: string) => void
  className?: string
  activeFilters?: Record<string, string>
}

export function FilterBar({
  placeholder = "Search...",
  onSearch,
  filters,
  onFilterChange,
  className,
  activeFilters = {},
}: FilterBarProps) {
  const [searchValue, setSearchValue] = React.useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchValue)
  }

  const handleClearSearch = () => {
    setSearchValue("")
    onSearch?.("")
  }

  const handleFilterSelect = (filterId: string, value: string) => {
    onFilterChange?.(filterId, value)
  }

  const handleClearFilter = (filterId: string) => {
    onFilterChange?.(filterId, "")
  }

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length

  return (
    <div className={cn("space-y-2", className)}>
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={placeholder}
            className="pl-9"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          {searchValue && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </button>
          )}
        </div>
        <CustomButton type="submit" variant="brand">
          Search
        </CustomButton>

        {filters && filters.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <CustomButton variant="outline" className="gap-1" leftIcon={<Filter className="h-4 w-4" />}>
                Filter
                {activeFilterCount > 0 && (
                  <span className="ml-1 rounded-full bg-[#1E88E5] px-1.5 py-0.5 text-xs text-white">
                    {activeFilterCount}
                  </span>
                )}
              </CustomButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {filters.map((filter) => (
                <DropdownMenuGroup key={filter.id}>
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                    {filter.label}
                  </DropdownMenuLabel>
                  {filter.options?.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      className={cn(activeFilters[filter.id] === option.value && "bg-accent")}
                      onClick={() => handleFilterSelect(filter.id, option.value)}
                    >
                      <span>{option.label}</span>
                    </DropdownMenuItem>
                  ))}
                  {activeFilters[filter.id] && (
                    <DropdownMenuItem
                      className="text-xs text-muted-foreground"
                      onClick={() => handleClearFilter(filter.id)}
                    >
                      <X className="mr-1 h-3 w-3" />
                      <span>Clear {filter.label}</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
              ))}

              {activeFilterCount > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-xs text-muted-foreground"
                    onClick={() => {
                      Object.keys(activeFilters).forEach((filterId) => {
                        handleClearFilter(filterId)
                      })
                    }}
                  >
                    <X className="mr-1 h-3 w-3" />
                    <span>Clear all filters</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </form>

      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(activeFilters)
            .filter(([_, value]) => value)
            .map(([filterId, value]) => {
              const filter = filters?.find((f) => f.id === filterId)
              const option = filter?.options?.find((o) => o.value === value)

              return (
                <div
                  key={filterId}
                  className="flex items-center gap-1 rounded-full bg-[#1E88E5]/10 px-2 py-1 text-xs text-[#1E88E5]"
                >
                  <span>
                    {filter?.label}: {option?.label || value}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleClearFilter(filterId)}
                    className="rounded-full p-0.5 hover:bg-[#1E88E5]/20"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove filter</span>
                  </button>
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}
