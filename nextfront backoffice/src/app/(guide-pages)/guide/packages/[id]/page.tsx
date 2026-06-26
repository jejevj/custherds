import GuidePackageDetailContent from './GuidePackageDetailContent'

export default async function GuidePackageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <GuidePackageDetailContent packageId={id} />
}
