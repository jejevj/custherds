// Matches VendorSubmitRequest in backend-fastapi/app/schemas/vendors.py.
export const requiredVendorFields = {
  vendor_business_name: "Nama Toko",
  vendor_short_description: "Deskripsi Singkat",
  vendor_contact_person: "Contact Person",
  vendor_location: "Alamat / Lokasi",
  vendor_npwp: "NPWP",
  vendor_nib: "NIB",
  vendor_owner_id_card_url: "Identitas Pemilik",
} as const

type RequiredField = keyof typeof requiredVendorFields
export type VendorReviewPayload = Record<RequiredField, string>

export function buildVendorReviewPayload(form: Partial<Record<RequiredField, string | null>>): VendorReviewPayload {
  const payload = {} as VendorReviewPayload
  const missing: string[] = []
  for (const key of Object.keys(requiredVendorFields) as RequiredField[]) {
    payload[key] = (form[key] ?? "").trim()
    if (!payload[key]) missing.push(requiredVendorFields[key])
  }
  if (missing.length) throw new Error(`Lengkapi field wajib: ${missing.join(", ")}.`)
  return payload
}

export function validateOwnerIdentity(file: { type: string; size: number }): void {
  if (!["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(file.type)) {
    throw new Error("Identitas pemilik harus berupa JPG, PNG, WEBP, atau PDF.")
  }
  if (!file.size) throw new Error("File identitas pemilik kosong. Pilih file lain.")
  if (file.size > 5 * 1024 * 1024) throw new Error("Ukuran identitas pemilik maksimal 5 MB.")
}

export function vendorReviewError(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message || fallback
  if (!error || typeof error !== "object") return fallback
  const { detail, message } = error as { detail?: unknown; message?: unknown }
  if (typeof detail === "string") return detail
  if (Array.isArray(detail)) {
    const messages = detail.map((item: { loc?: unknown[]; msg?: unknown }) => {
      if (!item || typeof item.msg !== "string") return ""
      const field = item.loc?.[item.loc.length - 1] as RequiredField | undefined
      return `${field ? (requiredVendorFields[field] ?? field) + ": " : ""}${item.msg}`
    }).filter(Boolean)
    if (messages.length) return messages.join("; ")
  }
  return typeof message === "string" ? message : fallback
}
