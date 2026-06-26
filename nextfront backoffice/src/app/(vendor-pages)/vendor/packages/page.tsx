import { Suspense } from 'react'
import PackageListContent from './PackageListContent'

export const metadata = { title: 'Package — Custherds Vendor' }

export default function PackagesPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground p-6">Memuat...</p>}>
      <PackageListContent />
    </Suspense>
  )
}
