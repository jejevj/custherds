import GuidePackageDetailContent from './GuidePackageDetailContent'

export default function GuidePackageDetailPage({ params }: { params: { id: string } }) {
  return <GuidePackageDetailContent packageId={params.id} />
}
