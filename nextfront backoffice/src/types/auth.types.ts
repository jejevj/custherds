export interface LoginRequest {
  user_email: string
  user_password: string
}

export interface LoginResponse {
  access_token:  string
  refresh_token: string
  token_type:    string
  user_id:       string
  user_name:     string
  user_email:    string
  user_type:     number
}

export interface RefreshResponse {
  access_token: string
  token_type:   string
}
