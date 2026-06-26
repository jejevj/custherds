export interface Vendor {
  id:                    string
  user_id:               string
  vendor_business_name:  string
  vendor_address:        string | null
  vendor_phone:          string | null
  vendor_status:         string
  approval_notes:        string | null
  deposit_balance:       string
  created_at:            string
  updated_at:            string
}
