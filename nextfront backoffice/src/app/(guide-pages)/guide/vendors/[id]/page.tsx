import GuideVendorDetailContent from './GuideVendorDetailContent'

export default function GuideVendorDetailPage({ params }: { params: { id: string } }) {
  return <GuideVendorDetailContent vendorId={params.id} />
}
