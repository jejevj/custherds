// /admin → redirect ditangani middleware, file ini sebagai fallback
import { redirect } from 'next/navigation'
export default function AdminIndexPage() {
  redirect('/admin/login')
}
