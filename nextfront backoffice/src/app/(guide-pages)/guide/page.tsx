// /guide → redirect ditangani middleware, file ini sebagai fallback
import { redirect } from 'next/navigation'
export default function GuideIndexPage() {
  redirect('/guide/login')
}
