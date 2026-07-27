"use client"
import { useEffect, useState, useMemo } from "react"
import {
  vendorAreasService,
  VendorAreaKabupaten,
  VendorAreaKecamatan,
  VendorAreaKelurahan,
  VendorAreaKabupatenCreate,
  VendorAreaKecamatanCreate,
  VendorAreaKelurahanCreate,
} from "@/services/vendorAreas.service"
import { Badge }   from "@/components/ui/badge"
import { Button }  from "@/components/ui/button"
import { Input }   from "@/components/ui/input"
import { Label }   from "@/components/ui/label"
import { Switch }  from "@/components/ui/switch"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { TableSearchInput } from "@/components/ui/TableSearchInput"
import {
  Map, PlusCircle, Pencil, Trash2, ChevronDown, ChevronRight, Layers,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────
type Level = "kabupaten" | "kecamatan" | "kelurahan"

interface DialogState {
  open:         boolean
  level:        Level
  parentId?:    number   // kabupaten_id or kecamatan_id
  parentLabel?: string
  editId?:      number
  name:         string
  sort_order:   number
  is_active:    boolean
}

const EMPTY_DIALOG: DialogState = {
  open: false, level: "kabupaten", name: "", sort_order: 0, is_active: true,
}

interface DeleteState {
  open:   boolean
  level:  Level
  id:     number
  label:  string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const levelLabel: Record<Level, string> = {
  kabupaten: "Kabupaten / Kota",
  kecamatan: "Kecamatan",
  kelurahan: "Kelurahan / Desa",
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function VendorAreasContent() {
  const [kabupatens,  setKabupatens]  = useState<VendorAreaKabupaten[]>([])
  const [kecamatans,  setKecamatans]  = useState<VendorAreaKecamatan[]>([])
  const [kelurahans,  setKelurahans]  = useState<VendorAreaKelurahan[]>([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState("")
  const [query,       setQuery]       = useState("")

  // Expand / collapse kabupaten rows
  const [expandedKab,  setExpandedKab]  = useState<Set<number>>(new Set())
  const [expandedKec,  setExpandedKec]  = useState<Set<number>>(new Set())

  // Dialog state
  const [dlg,         setDlg]         = useState<DialogState>(EMPTY_DIALOG)
  const [submitting,  setSubmitting]  = useState(false)
  const [formError,   setFormError]   = useState("")

  // Delete state
  const [delState,    setDelState]    = useState<DeleteState | null>(null)
  const [deleting,    setDeleting]    = useState(false)

  // ── Fetch all ─────────────────────────────────────────────────────────────
  const fetchAll = async () => {
    setLoading(true)
    setError("")
    try {
      const [kabs, kecs, kels] = await Promise.all([
        vendorAreasService.listKabupaten(),
        vendorAreasService.listKecamatan(),
        vendorAreasService.listKelurahan(),
      ])
      setKabupatens(kabs)
      setKecamatans(kecs)
      setKelurahans(kels)
    } catch {
      setError("Gagal memuat data area vendor.")
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { fetchAll() }, [])

  // ── Computed / filtered ───────────────────────────────────────────────────
  const filteredKabs = useMemo(() => {
    if (!query.trim()) return kabupatens
    const q = query.toLowerCase()
    return kabupatens.filter((k) => k.name.toLowerCase().includes(q))
  }, [kabupatens, query])

  const kecByKab  = useMemo(() => {
    const map = new Map<number, VendorAreaKecamatan[]>()
    kecamatans.forEach((k) => {
      if (!map.has(k.kabupaten_id)) map.set(k.kabupaten_id, [])
      map.get(k.kabupaten_id)!.push(k)
    })
    return map
  }, [kecamatans])

  const kelByKec  = useMemo(() => {
    const map = new Map<number, VendorAreaKelurahan[]>()
    kelurahans.forEach((k) => {
      if (!map.has(k.kecamatan_id)) map.set(k.kecamatan_id, [])
      map.get(k.kecamatan_id)!.push(k)
    })
    return map
  }, [kelurahans])

  // ── Expand helpers ────────────────────────────────────────────────────────
  const toggleKab = (id: number) =>
    setExpandedKab((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleKec = (id: number) =>
    setExpandedKec((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })

  // ── Open dialog ───────────────────────────────────────────────────────────
  const openCreate = (level: Level, parentId?: number, parentLabel?: string) =>
    setDlg({ open: true, level, parentId, parentLabel, name: "", sort_order: 0, is_active: true })

  const openEdit = (level: Level, item: VendorAreaKabupaten | VendorAreaKecamatan | VendorAreaKelurahan) => {
    let parentId: number | undefined
    let parentLabel: string | undefined
    if (level === "kecamatan") {
      const kec = item as VendorAreaKecamatan
      parentId    = kec.kabupaten_id
      parentLabel = kabupatens.find((k) => k.id === kec.kabupaten_id)?.name
    }
    if (level === "kelurahan") {
      const kel = item as VendorAreaKelurahan
      parentId    = kel.kecamatan_id
      parentLabel = kecamatans.find((k) => k.id === kel.kecamatan_id)?.name
    }
    setDlg({
      open: true, level, parentId, parentLabel,
      editId: item.id, name: item.name, sort_order: item.sort_order, is_active: item.is_active,
    })
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setFormError("")
    if (!dlg.name.trim()) { setFormError("Nama wajib diisi."); return }
    setSubmitting(true)
    try {
      if (dlg.editId) {
        const payload = { name: dlg.name, sort_order: dlg.sort_order, is_active: dlg.is_active }
        if (dlg.level === "kabupaten")  await vendorAreasService.updateKabupaten(dlg.editId, payload)
        if (dlg.level === "kecamatan")  await vendorAreasService.updateKecamatan(dlg.editId, payload)
        if (dlg.level === "kelurahan")  await vendorAreasService.updateKelurahan(dlg.editId, payload)
      } else {
        if (dlg.level === "kabupaten") {
          const p: VendorAreaKabupatenCreate = { name: dlg.name, sort_order: dlg.sort_order, is_active: dlg.is_active }
          await vendorAreasService.createKabupaten(p)
        }
        if (dlg.level === "kecamatan") {
          const p: VendorAreaKecamatanCreate = { kabupaten_id: dlg.parentId!, name: dlg.name, sort_order: dlg.sort_order, is_active: dlg.is_active }
          await vendorAreasService.createKecamatan(p)
        }
        if (dlg.level === "kelurahan") {
          const p: VendorAreaKelurahanCreate = { kecamatan_id: dlg.parentId!, name: dlg.name, sort_order: dlg.sort_order, is_active: dlg.is_active }
          await vendorAreasService.createKelurahan(p)
        }
      }
      setDlg(EMPTY_DIALOG)
      fetchAll()
    } catch (e: unknown) {
      const msg = (e as { detail?: string })?.detail
      setFormError(msg ?? "Gagal menyimpan.")
    } finally {
      setSubmitting(false)
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!delState) return
    setDeleting(true)
    try {
      if (delState.level === "kabupaten") await vendorAreasService.deleteKabupaten(delState.id)
      if (delState.level === "kecamatan") await vendorAreasService.deleteKecamatan(delState.id)
      if (delState.level === "kelurahan") await vendorAreasService.deleteKelurahan(delState.id)
      setDelState(null)
      fetchAll()
    } catch { setError("Gagal menghapus.") }
    finally { setDeleting(false) }
  }

  // ── Toggle active ─────────────────────────────────────────────────────────
  const toggleKabActive = async (item: VendorAreaKabupaten) => {
    try {
      await vendorAreasService.updateKabupaten(item.id, { is_active: !item.is_active })
      setKabupatens((p) => p.map((k) => k.id === item.id ? { ...k, is_active: !k.is_active } : k))
    } catch { setError("Gagal mengubah status.") }
  }
  const toggleKecActive = async (item: VendorAreaKecamatan) => {
    try {
      await vendorAreasService.updateKecamatan(item.id, { is_active: !item.is_active })
      setKecamatans((p) => p.map((k) => k.id === item.id ? { ...k, is_active: !k.is_active } : k))
    } catch { setError("Gagal mengubah status.") }
  }
  const toggleKelActive = async (item: VendorAreaKelurahan) => {
    try {
      await vendorAreasService.updateKelurahan(item.id, { is_active: !item.is_active })
      setKelurahans((p) => p.map((k) => k.id === item.id ? { ...k, is_active: !k.is_active } : k))
    } catch { setError("Gagal mengubah status.") }
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Vendor Areas</h1>
        <p className="text-muted-foreground">
          Kelola area vendor secara hierarkis: <span className="font-medium">Kabupaten/Kota → Kecamatan → Kelurahan/Desa</span>.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <TableSearchInput value={query} onChange={setQuery} />
        {query && (
          <p className="text-xs text-muted-foreground">{filteredKabs.length} dari {kabupatens.length} kabupaten</p>
        )}
        <Button size="sm" className="ml-auto" onClick={() => openCreate("kabupaten")}>
          <PlusCircle className="h-4 w-4 mr-2" />Tambah Kabupaten
        </Button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Summary */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: "Kabupaten/Kota", value: kabupatens.length },
          { label: "Kecamatan",      value: kecamatans.length },
          { label: "Kelurahan/Desa", value: kelurahans.length },
          { label: "Aktif (Kab)",    value: kabupatens.filter((k) => k.is_active).length, color: "text-green-600" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border bg-card px-4 py-3 text-sm shadow-sm min-w-[120px]">
            <p className="text-muted-foreground text-xs mb-1">{s.label}</p>
            <p className={cn("text-xl font-bold", s.color ?? "")}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tree table */}
      {loading ? (
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="text-center py-16 text-muted-foreground">Memuat...</div>
        </div>
      ) : filteredKabs.length === 0 ? (
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="text-center py-16 text-muted-foreground">
            {query ? `Tidak ada hasil untuk "${query}"` : "Belum ada data area vendor."}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b bg-muted/40">
                  <th className="pl-4 pr-2 py-2 w-8"></th>
                  <th className="px-3 py-2 font-medium">Nama</th>
                  <th className="px-3 py-2 font-medium">Level</th>
                  <th className="px-3 py-2 font-medium">Sort</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Aktif</th>
                  <th className="px-3 py-2 font-medium text-right pr-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredKabs.map((kab) => {
                  const kecs = kecByKab.get(kab.id) ?? []
                  const kabExpanded = expandedKab.has(kab.id)
                  return (
                    <>
                      {/* ── Kabupaten row ─────────────────────────────── */}
                      <tr key={`kab-${kab.id}`} className="border-b hover:bg-muted/20 transition-colors bg-muted/10">
                        <td className="pl-4 pr-2 py-2.5">
                          <button
                            onClick={() => toggleKab(kab.id)}
                            className="text-muted-foreground hover:text-foreground"
                            aria-label="Expand"
                          >
                            {kabExpanded
                              ? <ChevronDown className="h-4 w-4" />
                              : <ChevronRight className="h-4 w-4" />}
                          </button>
                        </td>
                        <td className="px-3 py-2.5 font-semibold flex items-center gap-2">
                          <Map className="h-3.5 w-3.5 text-primary shrink-0" />
                          {kab.name}
                          <Badge variant="outline" className="text-xs ml-1">{kecs.length} kec</Badge>
                        </td>
                        <td className="px-3 py-2.5"><span className="text-xs font-medium text-primary">Kabupaten</span></td>
                        <td className="px-3 py-2.5 tabular-nums text-muted-foreground">{kab.sort_order}</td>
                        <td className="px-3 py-2.5">
                          <Badge variant={kab.is_active ? "default" : "secondary"}>
                            {kab.is_active ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5">
                          <Switch checked={kab.is_active} onCheckedChange={() => toggleKabActive(kab)} />
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2 justify-end pr-2">
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openCreate("kecamatan", kab.id, kab.name)}>
                              <PlusCircle className="h-3 w-3 mr-1" />Kecamatan
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openEdit("kabupaten", kab)}>
                              <Pencil className="h-3 w-3 mr-1" />Edit
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs text-red-500 hover:text-red-600 hover:border-red-300"
                              onClick={() => setDelState({ open: true, level: "kabupaten", id: kab.id, label: kab.name })}>
                              <Trash2 className="h-3 w-3 mr-1" />Hapus
                            </Button>
                          </div>
                        </td>
                      </tr>

                      {/* ── Kecamatan rows ────────────────────────────── */}
                      {kabExpanded && kecs.map((kec) => {
                        const kels = kelByKec.get(kec.id) ?? []
                        const kecExpanded = expandedKec.has(kec.id)
                        return (
                          <>
                            <tr key={`kec-${kec.id}`} className="border-b hover:bg-muted/20 transition-colors">
                              <td className="pl-10 pr-2 py-2">
                                <button
                                  onClick={() => toggleKec(kec.id)}
                                  className="text-muted-foreground hover:text-foreground"
                                  aria-label="Expand"
                                >
                                  {kecExpanded
                                    ? <ChevronDown className="h-3.5 w-3.5" />
                                    : <ChevronRight className="h-3.5 w-3.5" />}
                                </button>
                              </td>
                              <td className="px-3 py-2 flex items-center gap-2 text-muted-foreground">
                                <span className="w-4 shrink-0">└</span>
                                <Layers className="h-3 w-3 shrink-0" />
                                {kec.name}
                                <Badge variant="outline" className="text-xs ml-1">{kels.length} kel</Badge>
                              </td>
                              <td className="px-3 py-2"><span className="text-xs text-muted-foreground">Kecamatan</span></td>
                              <td className="px-3 py-2 tabular-nums text-muted-foreground">{kec.sort_order}</td>
                              <td className="px-3 py-2">
                                <Badge variant={kec.is_active ? "default" : "secondary"} className="text-xs">
                                  {kec.is_active ? "Aktif" : "Nonaktif"}
                                </Badge>
                              </td>
                              <td className="px-3 py-2">
                                <Switch checked={kec.is_active} onCheckedChange={() => toggleKecActive(kec)} />
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-2 justify-end pr-2">
                                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openCreate("kelurahan", kec.id, kec.name)}>
                                    <PlusCircle className="h-3 w-3 mr-1" />Kelurahan
                                  </Button>
                                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openEdit("kecamatan", kec)}>
                                    <Pencil className="h-3 w-3 mr-1" />Edit
                                  </Button>
                                  <Button size="sm" variant="outline" className="h-7 text-xs text-red-500 hover:text-red-600 hover:border-red-300"
                                    onClick={() => setDelState({ open: true, level: "kecamatan", id: kec.id, label: kec.name })}>
                                    <Trash2 className="h-3 w-3 mr-1" />Hapus
                                  </Button>
                                </div>
                              </td>
                            </tr>

                            {/* ── Kelurahan rows ─────────────────────── */}
                            {kecExpanded && kels.map((kel) => (
                              <tr key={`kel-${kel.id}`} className="border-b last:border-0 hover:bg-muted/10 transition-colors">
                                <td className="pl-16 py-1.5"></td>
                                <td className="px-3 py-1.5 flex items-center gap-2 text-muted-foreground text-xs">
                                  <span className="w-4 shrink-0">└</span>
                                  {kel.name}
                                </td>
                                <td className="px-3 py-1.5"><span className="text-xs text-muted-foreground/70">Kelurahan</span></td>
                                <td className="px-3 py-1.5 tabular-nums text-muted-foreground text-xs">{kel.sort_order}</td>
                                <td className="px-3 py-1.5">
                                  <Badge variant={kel.is_active ? "default" : "secondary"} className="text-xs">
                                    {kel.is_active ? "Aktif" : "Nonaktif"}
                                  </Badge>
                                </td>
                                <td className="px-3 py-1.5">
                                  <Switch checked={kel.is_active} onCheckedChange={() => toggleKelActive(kel)} />
                                </td>
                                <td className="px-3 py-1.5">
                                  <div className="flex items-center gap-2 justify-end pr-2">
                                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openEdit("kelurahan", kel)}>
                                      <Pencil className="h-3 w-3 mr-1" />Edit
                                    </Button>
                                    <Button size="sm" variant="outline" className="h-7 text-xs text-red-500 hover:text-red-600 hover:border-red-300"
                                      onClick={() => setDelState({ open: true, level: "kelurahan", id: kel.id, label: kel.name })}>
                                      <Trash2 className="h-3 w-3 mr-1" />Hapus
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </>
                        )
                      })}
                    </>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dlg.open} onOpenChange={(open) => !open && setDlg(EMPTY_DIALOG)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dlg.editId ? "Edit" : "Tambah"} {levelLabel[dlg.level]}
              {dlg.parentLabel && (
                <span className="text-muted-foreground font-normal text-sm ml-2">— {dlg.parentLabel}</span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="area_name">Nama</Label>
              <Input
                id="area_name"
                placeholder={`Nama ${levelLabel[dlg.level]}`}
                value={dlg.name}
                onChange={(e) => setDlg((d) => ({ ...d, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="area_sort">Sort Order</Label>
              <Input
                id="area_sort"
                type="number"
                min={0}
                value={dlg.sort_order}
                onChange={(e) => setDlg((d) => ({ ...d, sort_order: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="area_active"
                checked={dlg.is_active}
                onCheckedChange={(val) => setDlg((d) => ({ ...d, is_active: val }))}
              />
              <Label htmlFor="area_active" className="cursor-pointer">Aktif</Label>
            </div>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDlg(EMPTY_DIALOG)} disabled={submitting}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!delState?.open} onOpenChange={(open) => !open && setDelState(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus {delState ? levelLabel[delState.level] : ""}?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{delState?.label}</strong> akan dihapus permanen.
              {delState?.level !== "kelurahan" && (
                <span className="block mt-1 text-red-500 text-xs">Semua data di bawahnya juga akan ikut terhapus (cascade).</span>
              )}
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
