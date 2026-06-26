export interface Booking {
  id:           string
  booking_code: string
  vendor_id:    string
  guide_id:     string
  status:       string
  notes:        string | null
  start_date:   string | null
  end_date:     string | null
  created_at:   string
  updated_at:   string
}
