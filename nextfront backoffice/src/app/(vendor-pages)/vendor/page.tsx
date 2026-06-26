// /vendor → redirect ditangani middleware, file ini sebagai fallback
import { redirect } from 'next/navigation'
export default function VendorIndexPage() {
  redirect('/vendor/login')
}
