# Bulk Registration Bank

The feature needs to be activated before merchants can start to use the feature. Please see steps listed below:

1. [Activate Bulk Registration Bank Features](#activate-bulk-registration-bank-features)
2. [API for Settlement Bank Account](#api-for-settlement-bank-account)
   1. [Create Settlement Bank Account](#1-create-settlement-bank-account)
   2. [Update Settlement Bank Account](#2-update-settlement-bank-account)
   3. [Get Settlement Bank Account](#3-get-settlement-bank-account)

---

## Activate Bulk Registration Bank Features

This feature will enable merchants to create, edit, and get settlement bank accounts in bulk via H2H API. Due to safety considerations, merchants must enable this manually after finishing onboarding.

### Steps to Enable

1. Login to DOKU dashboard
2. Go to menu **Setting** > **Service**
3. Click **"Add Service"** button
4. Under menu of **"Financial Service"**, choose **Others**
5. Check **"Bulk Registration Bank"** option
6. Save by clicking the **Activate** button
7. Click the document icon to download the **"Surat Instruksi Pelimpahan Dana"** template document to be filled in
8. Upload the filled **"Surat Instruksi Pelimpahan Dana"** in PDF format
9. After the document is successfully uploaded, click **"Activate"** button
10. The service will be successfully sent. Click **"OK"** to confirm

---

## API for Settlement Bank Account

This is the documentation for the Host-to-Host (H2H) API for Settlement Bank Accounts.

> **Base path:** `/v2/settlement-bank-account`

### 1. Create Settlement Bank Account

To create a settlement bank account, call the following endpoint from your Backend:

- **Method:** `POST`
- **Path:** `/v2/settlement-bank-account`
- **Auth:** DOKU SNAP signature (using `client_id` + `private_key`)

#### Request Headers

| Header | Value |
|---|---|
| `Content-Type` | `application/json` |
| `Client-Id` | Your DOKU Client ID |
| `Request-Id` | Unique UUID per request |
| `Request-Timestamp` | ISO 8601 timestamp |
| `Signature` | DOKU SNAP HMAC-SHA512 signature |

#### Request Body (example)

```json
{
  "bank_code": "014",
  "account_number": "1234567890",
  "account_name": "PT Merchant Indonesia",
  "merchant_reference": "REF-001"
}
```

#### Response (201 Created)

```json
{
  "bank_account_settlement_id": "SBA-XXXX",
  "status": "pending_verification",
  "created_at": "2026-07-19T10:36:48Z"
}
```

---

### 2. Update Settlement Bank Account

Update is **only available for data in `verified` state**. Call this endpoint from your Backend:

- **Method:** `PUT`
- **Path:** `/v2/settlement-bank-account`
- **Auth:** DOKU SNAP signature

#### Request Body (example)

```json
{
  "bank_account_settlement_id": "SBA-XXXX",
  "account_name": "PT Merchant Indonesia Updated"
}
```

#### Response (200 OK)

```json
{
  "bank_account_settlement_id": "SBA-XXXX",
  "status": "verified",
  "updated_at": "2026-07-19T10:38:22Z"
}
```

---

### 3. Get Settlement Bank Account

To retrieve a settlement bank account by ID, call this endpoint from your Backend:

- **Method:** `GET`
- **Path:** `/v2/settlement-bank-account/{bank_account_settlement_id}`
- **Auth:** DOKU SNAP signature

#### Path Parameter

| Parameter | Description |
|---|---|
| `bank_account_settlement_id` | The unique ID returned from the Create endpoint |

#### Response (200 OK)

```json
{
  "bank_account_settlement_id": "SBA-XXXX",
  "bank_code": "014",
  "account_number": "1234567890",
  "account_name": "PT Merchant Indonesia",
  "status": "verified",
  "merchant_reference": "REF-001",
  "created_at": "2026-07-19T10:36:48Z",
  "updated_at": "2026-07-19T10:38:22Z"
}
```

---

## DOKU SNAP Credential Fields Reference

For Payment Gateway Config (DOKU SNAP), the following credentials are required:

| Field | Description | Example |
|---|---|---|
| `client_id` | DOKU Client ID | `BRN-0272-XXXX` |
| `secret_key` | DOKU Secret Key | `SK-...` |
| `private_key` | RSA Private Key (PEM format) | `-----BEGIN PRIVATE KEY-----\n...` |
| `public_key` | RSA Public Key (PEM format) | `-----BEGIN PUBLIC KEY-----\n...` |
| `qris_nmid` | QRIS National Merchant ID | `ID2026XXXXXXX` |
| `qris_merchant_id` | QRIS Merchant ID from DOKU | numeric string |
| `qris_terminal_id` | QRIS Terminal ID | `A01` |
