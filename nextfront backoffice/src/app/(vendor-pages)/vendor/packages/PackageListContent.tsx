"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { packagesService, Package } from "@/services/packages.service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react"
import { toast } from "sonner"

export default function PackageListContent() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading,  setLoading]  = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    packagesService.listMine()
      .then(setPackages)
      .catch(() => toast.error("Gagal memuat package."))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleToggle = async (pkg: Package) => {
    try {
      const updated = await packagesService.toggleActive(pkg.id, !pkg.is_active)
      setPackages(prev => prev.map(p => p.id === pkg.id ? updated : p))
      toast.success(`Package "${pkg.name}" ${updated.is_active ? 'diaktifkan' : 'dinonaktifkan'}.`)
    } catch {
      toast.error("Gagal mengubah status package.")
    }
  }

  const handleDelete = async (pkg: Package) => {
    if (!confirm(`Hapus package "${pkg.name}"? Aksi ini tidak dapat dibatalkan.`)) return
    setDeleting(pkg.id)
    try {
      await packagesService.remove(pkg.id)
      setPackages(prev => prev.filter(p => p.id !== pkg.id))
      toast.success(`Package "${pkg.name}" berhasil dihapus.`)
    } catch (e: any) {
      toast.error(e?.message ?? "Gagal menghapus package.")
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Package</h1>
          <p className="text-muted-foreground text-sm">Kelola package wisata yang ditawarkan ke guide.</p>
        </div>
        <Link href="/vendor/packages/new">
          <Button size="sm" className="gap-2">
            <Plus size={16} /> Buat Package
          </Button>
        </Link>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b bg-muted/40">
              <th className="px-4 py-3 font-medium">Nama Package</th>
              <th className="px-4 py-3 font-medium">Harga / Pax</th>
              <th className="px-4 py-3 font-medium">Min–Max Pax</th>
              <th className="px-4 py-3 font-medium">Quota / Slot</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">Memuat...</td></tr>
            ) : packages.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-muted-foreground">
                  Belum ada package.{" "}
                  <Link href="/vendor/packages/new" className="text-primary underline">Buat sekarang</Link>
                </td>
              </tr>
            ) : packages.map(pkg => (
              <tr key={pkg.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">
                  <p className="font-medium">{pkg.name}</p>
                  {pkg.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{pkg.description}</p>
                  )}
                </td>
                <td className="px-4 py-3 font-mono">
                  Rp {Number(pkg.price_per_pax).toLocaleString('id-ID')}
                </td>
                <td className="px-4 py-3">
                  {pkg.min_pax}{pkg.max_pax ? `–${pkg.max_pax}` : '+'} pax
                </td>
                <td className="px-4 py-3">{pkg.quota_per_slot} booking</td>
                <td className="px-4 py-3">
                  <Badge variant={pkg.is_active ? "default" : "secondary"}>
                    {pkg.is_active ? "Aktif" : "Nonaktif"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {/* Toggle aktif */}
                    <button
                      onClick={() => handleToggle(pkg)}
                      title={pkg.is_active ? "Nonaktifkan" : "Aktifkan"}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {pkg.is_active
                        ? <ToggleRight size={20} className="text-primary" />
                        : <ToggleLeft size={20} />}
                    </button>
                    {/* Edit */}
                    <Link href={`/vendor/packages/${pkg.id}`}>
                      <button title="Edit" className="text-muted-foreground hover:text-primary transition-colors">
                        <Pencil size={16} />
                      </button>
                    </Link>
                    {/* Hapus */}
                    <button
                      onClick={() => handleDelete(pkg)}
                      disabled={deleting === pkg.id}
                      title="Hapus"
                      className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
