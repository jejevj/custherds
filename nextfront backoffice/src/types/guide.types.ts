export interface Guide {
  id:                       string
  user_id:                  string
  guide_nationality:        string | null
  guide_certificate:        string | null
  guide_certificate_status: string
  bio:                      string | null
  languages:                string | null
  rating:                   number | null
  total_earnings:           string
  pending_earnings:         string
  wallet_balance:           string
  bank_name:                string | null
  bank_account_number:      string | null
  bank_account_name:        string | null
  created_at:               string
  updated_at:               string
}
