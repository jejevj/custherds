import { useState, useMemo } from "react"

/**
 * Universal table search hook.
 * Flattens every value of each row object into a single lowercase string,
 * then filters rows whose combined string includes the search query.
 *
 * Usage:
 *   const { query, setQuery, filtered } = useTableSearch(rows)
 */
export function useTableSearch<T extends object>(data: T[]) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return data
    return data.filter(row =>
      Object.values(row)
        .map(v => {
          if (v == null) return ""
          if (typeof v === "object") return JSON.stringify(v)
          return String(v)
        })
        .join(" ")
        .toLowerCase()
        .includes(q)
    )
  }, [data, query])

  return { query, setQuery, filtered }
}
