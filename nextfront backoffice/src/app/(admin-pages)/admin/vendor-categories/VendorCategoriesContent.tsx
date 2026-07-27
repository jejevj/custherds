"use client"
import { useEffect, useState, useMemo } from "react"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { TableSearchInput } from "@/components/ui/TableSearchInput"
import { Tag, PlusCircle, Pencil, Trash2, ChevronDown, ChevronRight } from "lucide-react"

const EMPTY_FORM: VendorCategoryCreate = {
  name:       "",
  group_name: "",
  sort_order: 0,
  is_active:  true,
}

export default function VendorCategoriesContent() {
  const [categories, setCategories] = useState<VendorCategory[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState("")
  const [query,      setQuery]      = useState("")

  // Dialog: create / edit
  const [dialogOpen,   setDialogOpen]   = useState(false)
  const [editTarget,   setEditTarget]   = useState<VendorCategory | null>(null)
  const [form,         setForm]         = useState<VendorCategoryCreate>(EMPTY_FORM)
  const [submitting,   setSubmitting]   = useState(false)
  const [formError,    setFormError]    = useState("")

  // Dialog: delete
  const [deleteTarget, setDeleteTarget] = useState<VendorCategory | null>(null)
  const [deleting,     setDeleting]     = useState(false)

  // Group expand state
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  const fetchCategories = () => {
    setLoading(true)
    vendorCategoriesService
      .list()
      .then((data) => {
        setCategories(data)
        // expand all groups by default
        const groups = new Set(data.map((c) => c.group_name))
        setExpandedGroups(groups)
      })
      .catch(() => setError("Gagal memuat kategori vendor."))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCategories() }, [])

  // Filter + group
  const filtered = useMemo(() => {
    if (!query.trim()) return categories
    const q = query.toLowerCase()
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.group_name.toLowerCase().includes(q),
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

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(group)) next.delete(group)
      else next.add(group)
      return next
    })
  }

  // Open create dialog
  const openCreate = () => {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setFormError("")
    setDialogOpen(true)
  }

  // Open edit dialog
  const openEdit = (cat: VendorCategory) => {
    setEditTarget(cat)
    setForm({
      name:       cat.name,
      group_name: cat.group_name,
      sort_order: cat.sort_order,
      is_active:  cat.is_active,
    })
    setFormError("")
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    setFormError("")
    if (!form.name.trim() || !form.group_name.trim()) {
      setFormError("Nama dan Grup wajib diisi.")
      return
    }
    setSubmitting(true)
    try {
      if (editTarget) {
        const payload: VendorCategoryUpdate = {
          name:       form.name,
          group_name: form.group_name,
          sort_order: form.sort_order,
          is_active:  form.is_active,
        }
        await vendorCategoriesService.update(editTarget.id, payload)
      } else {
        await vendorCategoriesService.create(form)
      }
      setDialogOpen(false)
      fetchCategories()
    } catch (e: unknown) {
      const detail = (e as { detail?: string })?.detail
      setFormError(detail ?? "Gagal menyimpan. Periksa kembali data yang diisi.")
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
    } catch {
      setError("Gagal menghapus kategori.")
    } finally {
      setDeleting(false)
    }
  }

  const toggleActive = async (cat: VendorCategory) => {
    try {
      await vendorCategoriesService.update(cat.id, { is_active: !cat.is_active })
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, is_active: !c.is_active } : c)),
      )
    } catch {
      setError("Gagal mengubah status aktif.")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Vendor Categories</h1>
        <p className="text-muted-foreground">
          Kelola kategori dan grup vendor yang tersedia di platform Custherds.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <TableSearchInput value={query} onChange={setQuery} />
        {query && (
          <p className="text-xs text-muted-foreground">
            {filtered.length} dari {categories.length} hasil
          </p>
        )}
        <Button size="sm" className="ml-auto" onClick={openCreate}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Tambah Kategori
        </Button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Summary badges */}
      <div className="flex gap-3 flex-wrap">
        <div className="rounded-lg border bg-card px-4 py-3 text-sm shadow-sm min-w-[120px]">
          <p className="text-muted-foreground text-xs mb-1">Total Kategori</p>
          <p className="text-xl font-bold">{categories.length}</p>
        </div>
        <div className="rounded-lg border bg-card px-4 py-3 text-sm shadow-sm min-w-[120px]">
          <p className="text-muted-foreground text-xs mb-1">Aktif</p>
          <p className="text-xl font-bold text-green-600">
            {categories.filter((c) => c.is_active).length}
          </p>
        </div>
        <div className="rounded-lg border bg-card px-4 py-3 text-sm shadow-sm min-w-[120px]">
          <p className="text-muted-foreground text-xs mb-1">Grup</p>
          <p className="text-xl font-bold">
            {new Set(categories.map((c) => c.group_name)).size}
          </p>
        </div>
      </div>

      {/* Table grouped by group_name */}
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
                {expandedGroups.has(groupName) ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {/* Group table */}
              {expandedGroups.has(groupName) && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted-foreground border-b">
                        <th className="px-5 py-2 font-medium">Nama Kategori</th>
                        <th className="px-5 py-2 font-medium">Sort Order</th>
                        <th className="px-5 py-2 font-medium">Status</th>
                        <th className="px-5 py-2 font-medium">Aktif</th>
                        <th className="px-5 py-2 font-medium text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((cat) => (
                        <tr
                          key={cat.id}
                          className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-5 py-3 font-medium">{cat.name}</td>
                          <td className="px-5 py-3 text-muted-foreground">{cat.sort_order}</td>
                          <td className="px-5 py-3">
                            <Badge variant={cat.is_active ? "default" : "secondary"}>
                              {cat.is_active ? "Aktif" : "Nonaktif"}
                            </Badge>
                          </td>
                          <td className="px-5 py-3">
                            <Switch
                              checked={cat.is_active}
                              onCheckedChange={() => toggleActive(cat)}
                              aria-label={`Toggle aktif ${cat.name}`}
                            />
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEdit(cat)}
                              >
                                <Pencil className="h-3.5 w-3.5 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-500 hover:text-red-600 hover:border-red-300"
                                onClick={() => setDeleteTarget(cat)}
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-1" />
                                Hapus
              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Edit Kategori" : "Tambah Kategori Baru"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="cat_name">Nama Kategori</Label>
              <Input
                id="cat_name"
                placeholder="Contoh: Hotel, Restoran, dll."
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="cat_group">Nama Grup</Label>
              <Input
                id="cat_group"
                placeholder="Contoh: Akomodasi, Kuliner, dll."
                value={form.group_name}
                onChange={(e) => setForm((f) => ({ ...f, group_name: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="cat_sort">Sort Order</Label>
              <Input
                id="cat_sort"
                type="number"
                min={0}
                placeholder="0"
                value={form.sort_order}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))
                }
              />
              <p className="text-xs text-muted-foreground">Angka lebih kecil tampil lebih awal.</p>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="cat_active"
                checked={form.is_active}
                onCheckedChange={(val) => setForm((f) => ({ ...f, is_active: val }))}
              />
              <Label htmlFor="cat_active" className="cursor-pointer">
                Kategori aktif
              </Label>
            </div>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kategori?</AlertDialogTitle>
            <AlertDialogDescription>
              Kategori <strong>{deleteTarget?.name}</strong> akan dihapus permanen dan tidak dapat
              dikembalikan. Pastikan tidak ada vendor yang masih menggunakan kategori ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleting ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
