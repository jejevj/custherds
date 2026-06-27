import GuideVendorDetailContent from './GuideVendorDetailContent'

export default async function GuideVendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <GuideVendorDetailContent vendorId={id} />
}
