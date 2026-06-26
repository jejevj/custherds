import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"

interface TableSearchInputProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}

export function TableSearchInput({
  value,
  onChange,
  placeholder = "Cari di semua kolom...",
  className = "",
}: TableSearchInputProps) {
  return (
    <div className={`relative w-full max-w-sm ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-8 h-9 text-sm"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
