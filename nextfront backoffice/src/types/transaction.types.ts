export interface Transaction {
  id:                          string
  transaction_code:            string
  booking_id:                  string
  vendor_id:                   string
  guide_id:                    string
  gross_amount:                string
  currency:                    string
  receipt_image:               string
  receipt_notes:               string | null
  vendor_percent_snapshot:     string
  guide_percent_snapshot:      string
  platform_percent_snapshot:   string
  vendor_amount:               string | null
  guide_commission:            string | null
  platform_fee:                string | null
  status:                      string
  payment_method:              string | null
  xendit_invoice_id:           string | null
  xendit_invoice_url:          string | null
  paid_at:                     string | null
  submitted_at:                string
  vendor_reviewed_at:          string | null
  vendor_rejection_reason:     string | null
  settled_at:                  string | null
  created_at:                  string
}
