import PackageFormContent from '../PackageFormContent'

export const metadata = { title: 'Edit Package — Custherds Vendor' }

export default function EditPackagePage({ params }: { params: { id: string } }) {
  return <PackageFormContent mode="edit" packageId={params.id} />
}
