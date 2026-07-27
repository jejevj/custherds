"use client"
import { useEffect, useState, useMemo } from "react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  vendorCategoriesService,
  VendorCategory,
  VendorCategoryCreate,
  VendorCategoryUpdate,
} from "@/services/vendorCategories.service"
import { Badge }  from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input }  from "@/components/ui/input"
import { Label }  from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { TableSearchInput } from "@/components/ui/TableSearchInput"
import {
  Tag, PlusCircle, Pencil, Trash2, ChevronDown, ChevronRight, GripVertical, Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

const EMPTY_FORM: VendorCategoryCreate = {
  name: "", group_name: "", sort_order: 0, is_active: true,
}

// ─── Draggable row ───────────────────────────────────────────────────────────
function SortableRow({
  cat,
  onEdit,
  onDelete,
  onToggleActive,
  isDragging: isDraggingOverlay = false,
}: {
  cat: VendorCategory
  onEdit: (c: VendorCategory) => void
  onDelete: (c: VendorCategory) => void
  onToggleActive: (c: VendorCategory) => void
  isDragging?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: cat.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        "border-b last:border-0 hover:bg-muted/30 transition-colors",
        isDraggingOverlay && "shadow-lg bg-background",
      )}
    >
      {/* Drag handle */}
      <td className="pl-4 pr-2 py-3 w-8">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground touch-none"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </td>
      <td className="px-3 py-3 font-medium">{cat.name}</td>
      <td className="px-3 py-3 text-muted-foreground tabular-nums">{cat.sort_order}</td>
      <td className="px-3 py-3">
        <Badge variant={cat.is_active ? "default" : "secondary"}>
          {cat.is_active ? "Aktif" : "Nonaktif"}
        </Badge>
      </td>
      <td className="px-3 py-3">
        <Switch
          checked={cat.is_active}
          onCheckedChange={() => onToggleActive(cat)}
          aria-label={`Toggle aktif ${cat.name}`}
        />
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2 justify-end pr-2">
          <Button size="sm" variant="outline" onClick={() => onEdit(cat)}>
            <Pencil className="h-3.5 w-3.5 mr-1" />Edit
          </Button>
          <Button
            size="sm" variant="outline"
            className="text-red-500 hover:text-red-600 hover:border-red-300"
            onClick={() => onDelete(cat)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />Hapus
          </Button>
        </div>
      </td>
    </tr>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function VendorCategoriesContent() {
  const [categories,     setCategories]     = useState<VendorCategory[]>([])
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState("")
  const [query,          setQuery]          = useState("")
  const [saving,         setSaving]         = useState(false)   // saving sort order
  const [activeItem,     setActiveItem]     = useState<VendorCategory | null>(null)

  // Dialog create/edit
  const [dialogOpen,   setDialogOpen]   = useState(false)
  const [editTarget,   setEditTarget]   = useState<VendorCategory | null>(null)
  const [form,         setForm]         = useState<VendorCategoryCreate>(EMPTY_FORM)
  const [submitting,   setSubmitting]   = useState(false)
  const [formError,    setFormError]    = useState("")

  // Dialog delete
  const [deleteTarget, setDeleteTarget] = useState<VendorCategory | null>(null)
  const [deleting,     setDeleting]     = useState(false)

  // Group expand
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  // dnd-kit sensors — require 5px movement before drag starts (prevents misfire on click)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchCategories = () => {
    setLoading(true)
    vendorCategoriesService
      .list()
      .then((data) => {
        setCategories(data)
        setExpandedGroups(new Set(data.map((c) => c.group_name)))
      })
      .catch(() => setError("Gagal memuat kategori vendor."))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchCategories() }, [])

  // ── Filter ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!query.trim()) return categories
    const q = query.toLowerCase()
    return categories.filter(
      (c) => c.name.toLowerCase().includes(q) || c.group_name.toLowerCase().includes(q),
    )
  }, [categories, query])

  const grouped = useMemo(() => {
    const map = new Map<string, VendorCategory[]>()
    filtered.forEach((c) => {
      if (!map.has(c.group_name)) map.set(c.group_name, [])
      map.get(c.group_name)!.push(c)
    })
    return map
  }, [filtered])

  const toggleGroup = (g: string) =>
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      next.has(g) ? next.delete(g) : next.add(g)
      return next
    })

  // ── Drag handlers ────────────────────────────────────────────────────────
  const handleDragStart = (event: DragStartEvent) => {
    const found = categories.find((c) => c.id === event.active.id)
    setActiveItem(found ?? null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveItem(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    // Find which group these items belong to
    const group = categories.find((c) => c.id === active.id)?.group_name
    if (!group) return

    // Reorder within group
    const groupItems = categories.filter((c) => c.group_name === group)
    const oldIdx = groupItems.findIndex((c) => c.id === active.id)
    const newIdx = groupItems.findIndex((c) => c.id === over.id)
    if (oldIdx === -1 || newIdx === -1) return

    const reordered = arrayMove(groupItems, oldIdx, newIdx)

    // Reassign sort_order starting from existing min sort_order of group
    const baseOrder = Math.min(...reordered.map((c) => c.sort_order))
    const updated = reordered.map((c, i) => ({ ...c, sort_order: baseOrder + i }))

    // Optimistic update
    setCategories((prev) => {
      const otherGroups = prev.filter((c) => c.group_name !== group)
      return [...otherGroups, ...updated].sort((a, b) => a.sort_order - b.sort_order)
    })

    // Persist to backend
    setSaving(true)
    try {
      await Promise.all(
        updated.map((c) =>
          vendorCategoriesService.update(c.id, { sort_order: c.sort_order }),
        ),
      )
    } catch {
      setError("Gagal menyimpan urutan. Memuat ulang...")
      fetchCategories() // rollback
    } finally {
      setSaving(false)
    }
  }

  // ── CRUD helpers ─────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditTarget(null); setForm(EMPTY_FORM); setFormError(""); setDialogOpen(true)
  }
  const openEdit = (cat: VendorCategory) => {
    setEditTarget(cat)
    setForm({ name: cat.name, group_name: cat.group_name, sort_order: cat.sort_order, is_active: cat.is_active })
    setFormError("")
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    setFormError("")
    if (!form.name.trim() || !form.group_name.trim()) { setFormError("Nama dan Grup wajib diisi."); return }
    setSubmitting(true)
    try {
      if (editTarget) {
        await vendorCategoriesService.update(editTarget.id, form as VendorCategoryUpdate)
      } else {
        await vendorCategoriesService.create(form)
      }
      setDialogOpen(false)
      fetchCategories()
    } catch (e: unknown) {
      setFormError((e as { detail?: string })?.detail ?? "Gagal menyimpan.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await vendorCategoriesService.delete(deleteTarget.id)
      setDeleteTarget(null)
      fetchCategories()
    } catch { setError("Gagal menghapus kategori.") }
    finally { setDeleting(false) }
  }

  const toggleActive = async (cat: VendorCategory) => {
    try {
      await vendorCategoriesService.update(cat.id, { is_active: !cat.is_active })
      setCategories((prev) =>
        prev.map((c) => c.id === cat.id ? { ...c, is_active: !c.is_active } : c),
      )
    } catch { setError("Gagal mengubah status aktif.") }
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Vendor Categories</h1>
        <p className="text-muted-foreground">
          Kelola kategori vendor. <span className="font-medium">Drag baris</span> untuk mengatur urutan tampil dalam satu grup.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <TableSearchInput value={query} onChange={setQuery} />
        {query && (
          <p className="text-xs text-muted-foreground">{filtered.length} dari {categories.length} hasil</p>
        )}
        {saving && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground ml-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />Menyimpan urutan...
          </span>
        )}
        <Button size="sm" className="ml-auto" onClick={openCreate}>
          <PlusCircle className="h-4 w-4 mr-2" />Tambah Kategori
        </Button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Summary */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: "Total Kategori", value: categories.length, color: "" },
          { label: "Aktif",          value: categories.filter((c) => c.is_active).length, color: "text-green-600" },
          { label: "Grup",           value: new Set(categories.map((c) => c.group_name)).size, color: "" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border bg-card px-4 py-3 text-sm shadow-sm min-w-[120px]">
            <p className="text-muted-foreground text-xs mb-1">{s.label}</p>
            <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* DnD grouped tables */}
      {loading ? (
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="text-center py-16 text-muted-foreground">Memuat...</div>
        </div>
      ) : grouped.size === 0 ? (
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="text-center py-16 text-muted-foreground">
            {query ? `Tidak ada hasil untuk "${query}"` : "Belum ada kategori."}
          </div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-3">
            {Array.from(grouped.entries()).map(([groupName, items]) => (
              <div key={groupName} className="rounded-xl border bg-card shadow-sm overflow-hidden">
                {/* Group header */}
                <button
                  className="w-full flex items-center justify-between px-5 py-3 bg-muted/40 hover:bg-muted/60 transition-colors text-left"
                  onClick={() => toggleGroup(groupName)}
                >
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-sm">{groupName}</span>
                    <Badge variant="secondary" className="text-xs">{items.length}</Badge>
                  </div>
                  {expandedGroups.has(groupName)
                    ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </button>

                {expandedGroups.has(groupName) && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted-foreground border-b">
                          <th className="pl-4 pr-2 py-2 w-8"></th>
                          <th className="px-3 py-2 font-medium">Nama Kategori</th>
                          <th className="px-3 py-2 font-medium">Sort Order</th>
                          <th className="px-3 py-2 font-medium">Status</th>
                          <th className="px-3 py-2 font-medium">Aktif</th>
                          <th className="px-3 py-2 font-medium text-right pr-4">Aksi</th>
                        </tr>
                      </thead>
                      <SortableContext
                        items={items.map((c) => c.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <tbody>
                          {items.map((cat) => (
                            <SortableRow
                              key={cat.id}
                              cat={cat}
                              onEdit={openEdit}
                              onDelete={setDeleteTarget}
                              onToggleActive={toggleActive}
                            />
                          ))}
                        </tbody>
                      </SortableContext>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Drag overlay — ghost row while dragging */}
          <DragOverlay>
            {activeItem ? (
              <table className="w-full text-sm">
                <tbody>
                  <SortableRow
                    cat={activeItem}
                    onEdit={() => {}}
                    onDelete={() => {}}
                    onToggleActive={() => {}}
                    isDragging
                  />
                </tbody>
              </table>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Kategori" : "Tambah Kategori Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="cat_name">Nama Kategori</Label>
              <Input id="cat_name" placeholder="Contoh: Hotel, Restoran"
                value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="cat_group">Nama Grup</Label>
              <Input id="cat_group" placeholder="Contoh: Akomodasi, Kuliner"
                value={form.group_name} onChange={(e) => setForm((f) => ({ ...f, group_name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="cat_sort">Sort Order</Label>
              <Input id="cat_sort" type="number" min={0} value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} />
              <p className="text-xs text-muted-foreground">Bisa diatur otomatis via drag-and-drop setelah disimpan.</p>
            </div>
            <div className="flex items-center gap-3">
              <Switch id="cat_active" checked={form.is_active}
                onCheckedChange={(val) => setForm((f) => ({ ...f, is_active: val }))} />
              <Label htmlFor="cat_active" className="cursor-pointer">Kategori aktif</Label>
            </div>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>Batal</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kategori?</AlertDialogTitle>
            <AlertDialogDescription>
              Kategori <strong>{deleteTarget?.name}</strong> akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}
              className="bg-red-500 hover:bg-red-600">
              {deleting ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
