import PackageFormContent from '../PackageFormContent'

export const metadata = { title: 'Edit Package — Custherds Vendor' }

export default async function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <PackageFormContent mode="edit" packageId={id} />
}
