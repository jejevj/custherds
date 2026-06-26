"use client"

import { useEffect, useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Clock, ShoppingBag, Search, X, Store } from "lucide-react"
import { useAuthStore } from "@/store/auth.store"

// Area code map — matches vendor_area integer in DB
const AREA_MAP: Record<number, string> = {
  1:  "Kuta",
  2:  "Seminyak",
  3:  "Canggu",
  4:  "Ubud",
  5:  "Nusa Dua",
  6:  "Jimbaran",
  7:  "Sanur",
  8:  "Uluwatu",
  9:  "Denpasar",
  10: "Ubud Center",
}

// Category code map — matches vendor_category integer in DB
const CATEGORY_MAP: Record<number, string> = {
  1:  "Restaurant",
  2:  "Cafe",
  3:  "Spa & Wellness",
  4:  "Souvenir Shop",
  5:  "Art Gallery",
  6:  "Water Sport",
  7:  "Photography",
  8:  "Transport",
  27: "Food & Beverage",
}

interface VendorPublic {
  id: string
  vendor_business_name: string
  vendor_category: number
  vendor_area: number
  vendor_location: string | null
  vendor_short_description: string | null
  vendor_opening_hours: string | null
  vendor_min_spend: string | null
  vendor_cashback_percent: number
  vendor_website: string | null
}

export default function BrowseVendorsPage() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const [vendors, setVendors]     = useState<VendorPublic[]>([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [search, setSearch]       = useState("")
  const [area, setArea]           = useState<string>("all")
  const [category, setCategory]   = useState<string>("all")

  const fetchVendors = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (area !== "all")     params.set("area",     area)
      if (category !== "all") params.set("category", category)
      if (search.trim())      params.set("search",   search.trim())
      params.set("limit", "100")

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/vendors/browse?${params}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      if (!res.ok) throw new Error("Failed to load vendors")
      const data: VendorPublic[] = await res.json()
      setVendors(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [accessToken, area, category, search])

  useEffect(() => { fetchVendors() }, [fetchVendors])

  const clearFilters = () => {
    setSearch("")
    setArea("all")
    setCategory("all")
  }

  const hasFilter = search || area !== "all" || category !== "all"

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Browse Vendors</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Discover approved vendors available across Bali areas.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by business name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={area} onValueChange={setArea}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Areas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Areas</SelectItem>
            {Object.entries(AREA_MAP).map(([code, label]) => (
              <SelectItem key={code} value={code}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(CATEGORY_MAP).map(([code, label]) => (
              <SelectItem key={code} value={code}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilter && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="w-4 h-4" /> Clear
          </Button>
        )}
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-muted-foreground">
          {vendors.length} vendor{vendors.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {/* Cards */}
      {!loading && vendors.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors.map((v) => (
            <Card key={v.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-tight">
                    {v.vendor_business_name}
                  </CardTitle>
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    {CATEGORY_MAP[v.vendor_category] ?? `Cat ${v.vendor_category}`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {v.vendor_short_description && (
                  <p className="text-muted-foreground line-clamp-2">
                    {v.vendor_short_description}
                  </p>
                )}
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span>{AREA_MAP[v.vendor_area] ?? `Area ${v.vendor_area}`}</span>
                  {v.vendor_location && (
                    <span className="truncate">— {v.vendor_location}</span>
                  )}
                </div>
                {v.vendor_opening_hours && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{v.vendor_opening_hours}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {v.vendor_cashback_percent}% cashback
                    {v.vendor_min_spend ? ` · Min. IDR ${Number(v.vendor_min_spend).toLocaleString()}` : ""}
                  </span>
                </div>
                {v.vendor_website && (
                  <a
                    href={v.vendor_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2 text-xs"
                  >
                    Visit website
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && vendors.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <Store className="w-10 h-10 text-muted-foreground" />
          <p className="text-muted-foreground">No vendors found for the selected filters.</p>
          {hasFilter && (
            <Button variant="outline" size="sm" onClick={clearFilters}>Clear Filters</Button>
          )}
        </div>
      )}
    </div>
  )
}
