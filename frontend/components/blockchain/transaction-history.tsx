"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useAccount, useNetwork } from "wagmi"
import { formatEther, formatUnits } from "viem"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronDown, ExternalLink, Filter, ArrowUpDown, Search } from "lucide-react"

// Transaction type definition
interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  timestamp: number
  status: "success" | "failed" | "pending"
  type: "send" | "receive" | "swap" | "approve" | "other"
  tokenSymbol?: string
  tokenAmount?: string
  gasUsed?: string
  gasFee?: string
}

// Filter options
interface FilterOptions {
  type: string[]
  status: string[]
  dateRange: {
    from: Date | null
    to: Date | null
  }
  search: string
}

export function TransactionHistory() {
  const { address } = useAccount()
  const { chain } = useNetwork()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction; direction: 'asc' | 'desc' }>({
    key: 'timestamp',
    direction: 'desc'
  })
  const [filters, setFilters] = useState<FilterOptions>({
    type: [],
    status: [],
    dateRange: {
      from: null,
      to: null
    },
    search: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  // Fetch transactions from an API or local storage with improved error handling
  useEffect(() => {
    if (!address) return

    const fetchTransactions = async () => {
      setIsLoading(true)
      try {
        // In a real implementation, you would fetch from an API like Etherscan or Alchemy
        // For demo purposes, we'll use mock data
        const mockTransactions: Transaction[] = [
          {
            hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
            from: address,
            to: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
            value: "0.1",
            timestamp: Date.now() - 3600000, // 1 hour ago
            status: "success",
            type: "send",
            gasUsed: "21000",
            gasFee: "0.0021"
          },
          {
            hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
            from: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
            to: address,
            value: "0.5",
            timestamp: Date.now() - 86400000, // 1 day ago
            status: "success",
            type: "receive",
            gasUsed: "21000",
            gasFee: "0.0025"
          },
          {
            hash: "0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
            from: address,
            to: "0x1234567890123456789012345678901234567890",
            value: "0",
            timestamp: Date.now() - 172800000, // 2 days ago
            status: "success",
            type: "approve",
            tokenSymbol: "USDC",
            gasUsed: "45000",
            gasFee: "0.0045"
          },
          {
            hash: "0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc",
            from: address,
            to: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", // Uniswap router
            value: "0.2",
            timestamp: Date.now() - 259200000, // 3 days ago
            status: "success",
            type: "swap",
            tokenSymbol: "USDC",
            tokenAmount: "400",
            gasUsed: "150000",
            gasFee: "0.015"
          },
          {
            hash: "0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234",
            from: address,
            to: "0x8888888888888888888888888888888888888888",
            value: "0.01",
            timestamp: Date.now() - 345600000, // 4 days ago
            status: "failed",
            type: "send",
            gasUsed: "21000",
            gasFee: "0.0021"
          }
        ]

        setTransactions(mockTransactions)
        setFilteredTransactions(mockTransactions)
      } catch (error: any) {
        console.error("Error fetching transactions:", error)
        // Display user-friendly error message
        toast.error(`Failed to load transactions: ${error.message || "Unknown error"}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [address])

  // Apply filters and sorting
  useEffect(() => {
    if (!transactions.length) return

    let result = [...transactions]

    // Apply type filter
    if (filters.type.length > 0) {
      result = result.filter(tx => filters.type.includes(tx.type))
    }

    // Apply status filter
    if (filters.status.length > 0) {
      result = result.filter(tx => filters.status.includes(tx.status))
    }

    // Apply date range filter
    if (filters.dateRange.from) {
      result = result.filter(tx => new Date(tx.timestamp) >= filters.dateRange.from!)
    }
    if (filters.dateRange.to) {
      result = result.filter(tx => new Date(tx.timestamp) <= filters.dateRange.to!)
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(tx => 
        tx.hash.toLowerCase().includes(searchLower) ||
        tx.from.toLowerCase().includes(searchLower) ||
        tx.to.toLowerCase().includes(searchLower) ||
        (tx.tokenSymbol && tx.tokenSymbol.toLowerCase().includes(searchLower))
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue)
      }
      
      return 0
    })

    setFilteredTransactions(result)
  }, [transactions, filters, sortConfig])

  // Handle sorting
  const handleSort = (key: keyof Transaction) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  // Handle filter changes
  const handleFilterChange = (filterType: keyof FilterOptions, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  // Toggle filter selection
  const toggleFilter = (filterType: 'type' | 'status', value: string) => {
    setFilters(prev => {
      const currentValues = prev[filterType]
      return {
        ...prev,
        [filterType]: currentValues.includes(value)
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value]
      }
    })
  }

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      type: [],
      status: [],
      dateRange: {
        from: null,
        to: null
      },
      search: ''
    })
  }

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  // Get transaction explorer URL
  const getExplorerUrl = (hash: string) => {
    const baseUrl = chain?.blockExplorers?.default.url || 'https://etherscan.io'
    return `${baseUrl}/tx/${hash}`
  }

  // Get address explorer URL
  const getAddressExplorerUrl = (address: string) => {
    const baseUrl = chain?.blockExplorers?.default.url || 'https://etherscan.io'
    return `${baseUrl}/address/${address}`
  }

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  // Get transaction type badge
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'send':
        return <Badge variant="destructive">Send</Badge>
      case 'receive':
        return <Badge variant="success" className="bg-green-500">Receive</Badge>
      case 'swap':
        return <Badge variant="outline" className="border-purple-500 text-purple-500">Swap</Badge>
      case 'approve':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Approve</Badge>
      default:
        return <Badge variant="secondary">Other</Badge>
    }
  }

  // Get transaction status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="outline" className="border-green-500 text-green-500">Success</Badge>
      case 'failed':
        return <Badge variant="outline" className="border-red-500 text-red-500">Failed</Badge>
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Pending</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>View and filter your past transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              className="pl-8"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {(filters.type.length > 0 || filters.status.length > 0 || filters.dateRange.from || filters.dateRange.to) && (
                <Badge variant="secondary" className="ml-2">
                  {filters.type.length + filters.status.length + (filters.dateRange.from ? 1 : 0) + (filters.dateRange.to ? 1 : 0)}
                </Badge>
              )}
            </Button>
            
            <Select
              value={`${sortConfig.key}-${sortConfig.direction}`}
              onValueChange={(value) => {
                const [key, direction] = value.split('-')
                setSortConfig({ 
                  key: key as keyof Transaction, 
                  direction: direction as 'asc' | 'desc' 
                })
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="timestamp-desc">Date (Newest first)</SelectItem>
                <SelectItem value="timestamp-asc">Date (Oldest first)</SelectItem>
                <SelectItem value="value-desc">Value (High to Low)</SelectItem>
                <SelectItem value="value-asc">Value (Low to High)</SelectItem>
                <SelectItem value="type-asc">Type (A-Z)</SelectItem>
                <SelectItem value="status-asc">Status (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-muted/50 p-4 rounded-md mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Filters</h3>
              <Button variant="ghost" size="sm" onClick={resetFilters}>Reset</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Transaction Type Filter */}
              <div>
                <Label className="mb-2 block">Transaction Type</Label>
                <div className="flex flex-wrap gap-2">
                  {['send', 'receive', 'swap', 'approve', 'other'].map(type => (
                    <Badge
                      key={type}
                      variant={filters.type.includes(type) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleFilter('type', type)}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Status Filter */}
              <div>
                <Label className="mb-2 block">Status</Label>
                <div className="flex flex-wrap gap-2">
                  {['success', 'failed', 'pending'].map(status => (
                    <Badge
                      key={status}
                      variant={filters.status.includes(status) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleFilter('status', status)}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Date Range Filter */}
              <div>
                <Label className="mb-2 block">Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">From</Label>
                    <Input
                      type="date"
                      value={filters.dateRange.from ? new Date(filters.dateRange.from).toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        const date = e.target.value ? new Date(e.target.value) : null
                        handleFilterChange('dateRange', {
                          ...filters.dateRange,
                          from: date
                        })
                      }}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">To</Label>
                    <Input
                      type="date"
                      value={filters.dateRange.to ? new Date(filters.dateRange.to).toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        const date = e.target.value ? new Date(e.target.value) : null
                        handleFilterChange('dateRange', {
                          ...filters.dateRange,
                          to: date
                        })
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Transactions Table */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No transactions found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">
                        <Button variant="ghost" size="sm" onClick={() => handleSort('type')}>
                          Type
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" onClick={() => handleSort('timestamp')}>
                          Date
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleSort('value')}>
                          Value
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleSort('status')}>
                          Status
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((tx) => (
                      <TableRow key={tx.hash}>
                        <TableCell>{getTypeBadge(tx.type)}</TableCell>
                        <TableCell>{formatDate(tx.timestamp)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground">From:</span>
                              <a 
                                href={getAddressExplorerUrl(tx.from)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs hover:underline"
                              >
                                {formatAddress(tx.from)}
                              </a>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground">To:</span>
                              <a 
                                href={getAddressExplorerUrl(tx.to)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs hover:underline"
                              >
                                {formatAddress(tx.to)}
                              </a>
                            </div>
                            {tx.gasUsed && (
                              <div className="text-xs text-muted-foreground">
                                Gas: {tx.gasUsed} ({tx.gasFee} ETH)
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <span>{tx.value} ETH</span>
                            {tx.tokenAmount && tx.tokenSymbol && (
                              <span className="text-xs text-muted-foreground">
                                {tx.tokenAmount} {tx.tokenSymbol}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {getStatusBadge(tx.status)}
                        </TableCell>
                        <TableCell>
                          <a 
                            href={getExplorerUrl(tx.hash)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}