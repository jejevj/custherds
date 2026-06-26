export interface Withdrawal {
  id:                     string
  guide_id:               string
  amount:                 string
  bank_name:              string
  bank_account_number:    string
  bank_account_name:      string
  status:                 string
  xendit_disbursement_id: string | null
  processed_at:           string | null
  notes:                  string | null
  created_at:             string
}
