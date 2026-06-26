export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.custherds.ourtestcloud.my.id/api/v1'

export const STATUS_COLORS: Record<string, string> = {
  // Transaction
  pending_vendor_approval: 'bg-yellow-100 text-yellow-800',
  payment_pending:         'bg-blue-100 text-blue-800',
  settled:                 'bg-green-100 text-green-800',
  rejected:                'bg-red-100 text-red-800',
  // Withdrawal
  pending:                 'bg-yellow-100 text-yellow-800',
  processing:              'bg-blue-100 text-blue-800',
  completed:               'bg-green-100 text-green-800',
  failed:                  'bg-red-100 text-red-800',
  // Booking
  confirmed:               'bg-green-100 text-green-800',
  cancelled:               'bg-red-100 text-red-800',
  // Vendor
  approved:                'bg-green-100 text-green-800',
  review:                  'bg-yellow-100 text-yellow-800',
}

export const USER_TYPE_LABEL: Record<number, string> = {
  1:  'Guide',
  2:  'Vendor',
  99: 'Admin',
}

export const BANK_CODES = [
  'BCA', 'BNI', 'BRI', 'MANDIRI', 'PERMATA', 'BSI', 'BJB', 'CIMB', 'DANAMON',
]
