# DOKU Python SDK — Integration Guide

> Referensi resmi: [doku-python-library](https://github.com/PTNUSASATUINTIARTHA-DOKU/doku-python-library)  
> Versi Python minimal: **3.8+**

---

## Daftar Isi

- [1. Instalasi & Konfigurasi](#1-instalasi--konfigurasi)
- [2. Virtual Account](#2-virtual-account)
  - [DGPC & MGPC — Create, Update, Delete VA](#dgpc--mgpc--create-update-delete-va)
  - [DIPC — Direct Inquiry VA](#dipc--direct-inquiry-va)
  - [Check Status VA](#check-status-va)
- [3. Binding & Registrasi Kartu](#3-binding--registrasi-kartu)
  - [Account Binding & Unbinding](#account-binding--unbinding)
  - [Card Registration & Unregistration](#card-registration--unregistration)
- [4. Pembayaran Direct Debit & E-Wallet](#4-pembayaran-direct-debit--e-wallet)
  - [Request Payment](#request-payment)
  - [Request Payment Jump App (DANA & ShopeePay)](#request-payment-jump-app-dana--shopeepay)
- [5. Operasi Lainnya](#5-operasi-lainnya)
  - [Check Transaction Status](#check-transaction-status)
  - [Refund](#refund)
  - [Balance Inquiry](#balance-inquiry)
- [6. Error Handling](#6-error-handling)
- [7. Referensi Channel & Error Code](#7-referensi-channel--error-code)

---

## 1. Instalasi & Konfigurasi

### Instalasi

```bash
pip3 install doku_python_library
```

### Generate RSA Key

```bash
# 1. Generate private key
openssl genrsa -out private.key 2048

# 2. Set passphrase (PKCS8 format)
openssl pkcs8 -topk8 -inform PEM -outform PEM -in private.key -out pkcs8.key -v1 PBE-SHA1-3DES

# 3. Generate public key
openssl rsa -in private.key -outform PEM -pubout -out public.pem
```

### Inisialisasi DokuSNAP

```python
from doku_python_library.src.snap import DokuSNAP

snap: DokuSNAP = DokuSNAP(
    private_key=private_key,           # Private key RSA merchant (PKCS8)
    client_id="your_client_id",        # Dari DOKU Dashboard > Integration
    is_production=False,               # True untuk production
    public_key="doku_public_key",      # DOKU Public Key (untuk verifikasi request DOKU)
    issuer="your_issuer_data",         # Opsional
    secret_key="your_secret_key",      # Secret Key dari DOKU Dashboard
    merchant_public_key="your_public_key"  # Public key merchant
)
```

### Parameter Konfigurasi

| Parameter         | Deskripsi                                          | Wajib |
|-------------------|----------------------------------------------------|-------|
| `privateKey`      | Private key partner service                        | ✅    |
| `publicKey`       | DOKU Public Key (verifikasi request dari DOKU)     | ✅    |
| `clientId`        | Client ID dari DOKU Dashboard                      | ✅    |
| `secretKey`       | Secret Key dari DOKU Dashboard                     | ✅    |
| `isProduction`    | `True` untuk production, `False` untuk sandbox     | ✅    |
| `dokuPublicKey`   | Key untuk verifikasi request DOKU ke merchant      | ✅    |
| `issuer`          | Issuer opsional untuk konfigurasi lanjutan         | ❌    |
| `authCode`        | Authorization code opsional                        | ❌    |

> **Standar Enkripsi yang digunakan:**
> - Asymmetric: SHA256withRSA (256-bit)
> - Symmetric: HMAC_SHA512 (512-bit)
> - AES-256 dengan client secret sebagai encryption key

---

## 2. Virtual Account

### DGPC & MGPC — Create, Update, Delete VA

**DGPC** = DOKU-Generated Payment Code (sekali pakai, cocok untuk transaksi one-time)  
**MGPC** = Merchant-Generated Payment Code (cocok untuk model top-up)

#### Create Virtual Account

```python
from doku_python_library.src.model.va.create_va_request import CreateVARequest
from doku_python_library.src.model.va.create_va_response import CreateVAResponse
from doku_python_library.src.model.va.total_amount import TotalAmount
from doku_python_library.src.model.va.additional_info import AdditionalInfo
from doku_python_library.src.model.va.virtual_account_config import VirtualAccountConfig

request: CreateVARequest = CreateVARequest(
    partner_service_id="8129014",
    virtual_acc_name="Test Example",
    trx_id="INV_CIMB_TEST_1",
    virtual_acc_trx_type="C",           # C = Closed Amount, O = Open Amount
    total_amount=TotalAmount(value="12500.00", currency="IDR"),
    additional_info=AdditionalInfo(
        channel="VIRTUAL_ACCOUNT_BANK_CIMB",
        virtual_account_config=VirtualAccountConfig(
            reusable_status=True,
        )
    ),
    expired_date="2025-08-31T09:54:04+07:00",
    customer_no="17223992157",
    virtual_account_no="812901417223992157"
)

response: CreateVAResponse = snap.create_va(create_va_request=request)
```

#### Update Virtual Account

```python
from doku_python_library.src.model.va.update_va_request import UpdateVaRequest

update_va_request: UpdateVaRequest = UpdateVaRequest(
    partnerServiceId="8129014",
    customerNo="17223992157",
    virtualAccountName="Test Example",
    trxId="INV_CIMB_TEST_1",
    virtualAccountNo="812901417223992157",
    additionalInfo=UpdateVAAdditionalInfo(
        channel="VIRTUAL_ACCOUNT_BANK_CIMB",
        virtualAccountConfig=UpdateVAConfig(status="ACTIVE")
    ),
    totalAmount=TotalAmount(value="12500.00", currency="IDR"),
    virtualAccountTrxType="C",
    expiredDate="2025-08-31T09:54:04+07:00"
)

response: UpdateVAResponse = snap.update_va(update_request=update_va_request)
```

#### Delete Virtual Account

```python
from doku_python_library.src.model.va.delete_va_request import DeleteVARequest
from doku_python_library.src.model.va.delete_va_response import DeleteVAResponse

delete_va: DeleteVARequest = DeleteVARequest(
    partner_service_id="8129014",
    customer_no="17223992157",
    trx_id="INV_CIMB_TEST_1",
    virtual_acc_no="812901417223992157",
    additional_info=DeleteVAAdditionalInfo(
        channel="VIRTUAL_ACCOUNT_BANK_CIMB"
    )
)

response: DeleteVAResponse = snap.delete_payment_code(delete_va_request=delete_va)
```

---

### DIPC — Direct Inquiry VA

VA number didaftarkan di sisi merchant, DOKU akan meneruskan inquiry dari acquirer ke merchant saat customer melakukan pembayaran.

```python
@app.route('/v1.1/transfer-va/inquiry', methods=['POST'])
def directInquiryVa() -> dict:
    try:
        header: dict = dict(request.headers)
        request_json: dict = request.get_json()

        is_token_valid: bool = snap.validate_token_b2b(
            request_token=header["Authorization"]
        )

        if is_token_valid:
            # Proses inquiry dari DOKU
            row_va = fetch_direct_inquiry_va(
                virtual_account_no=request_json['virtualAccountNo']
            )
            if row_va is not None:
                response: InquiryResponseBody = InquiryResponseBody(
                    responseCode="2002400",
                    responseMessage="successful",
                    virtualAccountData=InquiryRequestVirtualAccountData(
                        virtualAccountNo=request_json['virtualAccountNo'],
                        totalAmount=TotalAmount(
                            value=row_va["totalAmount"]["value"],
                            currency=row_va["totalAmount"]["currency"]
                        ),
                        # ... field lainnya
                    )
                )
                return response.json()
            else:
                return {"responseCode": "4012400", "responseMessage": "Virtual Account Not Found"}

        return {"responseCode": "4010000", "responseMessage": "Invalid Token (B2B)"}
    except Exception as e:
        return {"error": str(e)}
```

---

### Check Status VA

```python
from doku_python_library.src.model.va.check_status_va_request import CheckStatusRequest
from doku_python_library.src.model.va.check_status_va_response import CheckStatusResponse

check_status_request: CheckStatusRequest = CheckStatusRequest(
    partner_service_id="8129014",
    customer_no="17223992157",
    virtual_acc_no="812901417223992157"
)

check_status_response: CheckStatusResponse = snap.check_status_va(
    check_status_request=check_status_request
)
```

---

## 3. Binding & Registrasi Kartu

Proses binding/registrasi **harus** diselesaikan sebelum pembayaran dapat diproses. Setiap kartu/akun hanya bisa terdaftar pada satu customer di satu merchant.

| Layanan       | Tipe Binding      | Acquirer Yang Didukung     |
|---------------|-------------------|---------------------------|
| Direct Debit  | Account Binding   | Allo Bank, CIMB            |
| Direct Debit  | Card Registration | BRI                        |
| E-Wallet      | Account Binding   | OVO                        |

---

### Account Binding & Unbinding

#### Binding

```python
from doku_python_library.src.model.direct_debit.account_binding_request import (
    AccountBindingRequest, AccountBindingAdditionalInfoRequest
)
from doku_python_library.src.model.direct_debit.account_binding_response import AccountBindingResponse

accountBindingRequest = AccountBindingRequest(
    phone_no="6288912121237",
    additional_info=AccountBindingAdditionalInfoRequest(
        channel="DIRECT_DEBIT_CIMB_SNAP",
        cust_id_merchant="CUST123",
        customer_name="John Doe",
        email="john.doe@example.com",
        id_card="99999",
        country="Indonesia",
        address="Jakarta",
        date_of_birth="19990101",
        success_registration_url="https://success.example.com",
        failed_registration_url="https://fail.example.com",
        device_model="iPhone 12",
        os_type="ios",
        channel_id="CH001"
    )
)

response: AccountBindingResponse = snap.do_account_binding(
    request=accountBindingRequest,
    device_id="YOUR_DEVICE_ID",
    ip_address="YOUR_IP_ADDRESS"
)
```

#### Unbinding

```python
from doku_python_library.src.model.token.token_b2b2c_response import TokenB2B2CResponse
from doku_python_library.src.model.direct_debit.account_unbinding_request import (
    AccountUnbindingRequest, AccountUnbindingAdditionalInfoRequest
)

# Step 1: Dapatkan Token B2B2C
auth_code = "YOUR_AUTH_CODE_FROM_ACCOUNT_BINDING"
responseB2B2C: TokenB2B2CResponse = snap.get_token_b2b2c(auth_code=auth_code)

# Step 2: Lakukan Unbinding
accountUnbindingRequest = AccountUnbindingRequest(
    token=responseB2B2C.access_token,
    additional_info=AccountUnbindingAdditionalInfoRequest(
        channel="DIRECT_DEBIT_CIMB_SNAP"
    )
)

response: AccountUnbindingResponse = snap.do_account_unbinding(
    request=accountUnbindingRequest,
    ip_address="YOUR_IP_ADDRESS"
)
```

---

### Card Registration & Unregistration

#### Registration

```python
from doku_python_library.src.model.direct_debit.card_registration_request import (
    CardRegistrationRequest, CardRegistrationAdditionalInfo
)
from doku_python_library.src.model.direct_debit.card_registration_response import CardRegistrationResponse

cardRegistRequest = CardRegistrationRequest(
    card_data=BankCardData(
        bank_card_no="7801",
        bank_card_type="D",
        expiry_date="0525",
        email="email@email.com"
    ),
    cust_id_merchant="John Doe",
    phone_no="6282124918109",
    additionalInfo=CardRegistrationAdditionalInfo(
        channel="DIRECT_DEBIT_BRI_SNAP",
        date_of_birth="19990101",
        success_registration_url="https://success.example.com",
        failed_registration_url="https://fail.example.com"
    )
)

cardRegistrationResponse: CardRegistrationResponse = snap.do_card_registration(
    request=cardRegistRequest,
    channel_id="DH"
)
```

#### Unregistration

```python
from doku_python_library.src.model.direct_debit.card_unbinding_request import CardUnbindingRequest

# Step 1: Dapatkan Token B2B2C
responseB2B2C: TokenB2B2CResponse = snap.get_token_b2b2c(auth_code="YOUR_AUTH_CODE")

# Step 2: Card Unbinding
cardUnbindingRequest = CardUnbindingRequest(
    token=responseB2B2C.access_token,
    additional_info=AccountUnbindingAdditionalInfoRequest(
        channel="DIRECT_DEBIT_BRI_SNAP"
    )
)

cardUnbindingResponse: CardUnbindingResponse = snap.do_card_unbinding(
    request=cardUnbindingRequest,
    ip_address="YOUR_IP_ADDRESS"
)
```

---

## 4. Pembayaran Direct Debit & E-Wallet

### Request Payment

Digunakan setelah proses binding/registrasi berhasil. Mendukung Direct Debit dan E-Wallet.

| Acquirer   | Channel Name               |
|------------|---------------------------|
| Allo Bank  | `DIRECT_DEBIT_ALLO_SNAP`  |
| BRI        | `DIRECT_DEBIT_BRI_SNAP`   |
| CIMB       | `DIRECT_DEBIT_CIMB_SNAP`  |
| OVO        | `EMONEY_OVO_SNAP`         |

```python
from doku_python_library.src.model.direct_debit.payment_request import PaymentRequest
from doku_python_library.src.model.direct_debit.payment_response import PaymentResponse
from doku_python_library.src.model.direct_debit.pay_option_detail import PayOptionDetail
from doku_python_library.src.model.direct_debit.payment_additional_info_request import PaymentAdditionalInfoRequest
from doku_python_library.src.model.va.total_amount import TotalAmount

payment_request = PaymentRequest(
    partner_reference_no="INV-101",
    fee_type="OUR",             # Hanya untuk OVO: OUR / BEN / SHA (Opsional)
    amount=TotalAmount(
        value="10000.00",
        currency="IDR"
    ),
    pay_option_detail=[         # Wajib untuk OVO & Allo Bank
        PayOptionDetail(
            pay_method="CASH",  # OVO: CASH/POINTS | Allo Bank: BALANCE/POINT/PAYLATER
            trans_amount=TotalAmount(value="10000.00", currency="IDR"),
            fee_amount=TotalAmount(value="1100.00", currency="IDR")
        )
    ],
    additional_info=PaymentAdditionalInfoRequest(
        channel="EMONEY_OVO_SNAP",
        remarks="Payment Order",
        success_payment_url="https://success.example.com",
        failed_payment_url="https://fail.example.com",
        line_items=[            # Hanya untuk Allo Bank
            LineItems(name="Bag", price="10000.00", quantity="1")
        ],
        payment_type="SALE"     # OVO & BRI: SALE / RECURRING (Opsional)
    ),
    charge_token=""
)

paymentResponse: PaymentResponse = snap.do_payment(
    request=payment_request,
    ip_address="YOUR_IP_ADDRESS",
    auth_code="YOUR_AUTH_CODE_FROM_BINDING"
)
```

---

### Request Payment Jump App (DANA & ShopeePay)

Untuk pembayaran menggunakan aplikasi DANA atau ShopeePay (redirect ke app).

| Acquirer   | Channel Name                |
|------------|-----------------------------|
| DANA       | `EMONEY_DANA_SNAP`          |
| ShopeePay  | `EMONEY_SHOPEE_PAY_SNAP`    |

```python
from doku_python_library.src.model.direct_debit.payment_jump_app_request import (
    PaymentJumpAppRequest, PaymentJumpAppAdditionalInfo, UrlParam
)
from doku_python_library.src.model.direct_debit.paymet_jump_app_response import PaymentJumpAppResponse

payment_jump_app_request = PaymentJumpAppRequest(
    partner_reference_no="INV-101",
    valid_up_to="2025-12-31T23:59:59Z",
    point_of_initiation="app",          # app / pc / mweb
    url_param=[
        UrlParam(
            url="https://your.url/endpoint",
            type="PAY_RETURN",
            is_deep_link="Y"
        )
    ],
    amount=TotalAmount(value="10000.00", currency="IDR"),
    additional_info=PaymentJumpAppAdditionalInfo(
        channel="EMONEY_DANA_SNAP",           # atau EMONEY_SHOPEE_PAY_SNAP
        order_title="Payment Order",          # Opsional, hanya DANA
        metadata="Your Metadata",             # Hanya ShopeePay (Opsional)
        support_deeplink_checkout_url=True    # Hanya DANA (Opsional)
    )
)

paymentJumpAppResponse: PaymentJumpAppResponse = snap.do_payment_jump_app(
    request=payment_jump_app_request,
    device_id="YOUR_DEVICE_ID",
    ip_address="YOUR_IP_ADDRESS"
)
```

---

## 5. Operasi Lainnya

### Check Transaction Status

```python
from doku_python_library.src.model.direct_debit.check_status_request import CheckStatusRequest
from doku_python_library.src.model.direct_debit.check_status_response import CheckStatusResponse

response: CheckStatusResponse = snap.do_check_status(request=CheckStatusRequest(...))
```

### Refund

```python
from doku_python_library.src.model.direct_debit.refund_request import RefundRequest
from doku_python_library.src.model.direct_debit.refund_response import RefundResponse

response: RefundResponse = snap.do_refund(
    request=RefundRequest(...),
    ip_address="YOUR_IP_ADDRESS",
    auth_code="YOUR_AUTH_CODE",
    device_id="YOUR_DEVICE_ID"
)
```

### Balance Inquiry

```python
from doku_python_library.src.model.direct_debit.balance_inquiry_request import BalanceInquiryRequest
from doku_python_library.src.model.direct_debit.balance_inquiry_response import BalanceInquiryResponse

response: BalanceInquiryResponse = snap.do_balance_inquiry(
    request=BalanceInquiryRequest(...),
    ip_address="YOUR_IP_ADDRESS",
    auth_code="YOUR_AUTH_CODE"
)
```

---

## 6. Error Handling

Selalu gunakan `try-except` untuk menangani error dari API call.

```python
import logging

try:
    create_va_response = snap.create_va(create_va_request_dto)
except Exception as err:
    logging.error("Error: %s", str(err))
    return

logging.info("VA created successfully: %s", create_va_response)
```

---

## 7. Referensi Channel & Error Code

### Error Code

| Error Code | Deskripsi                   | Solusi                                        |
|------------|-----------------------------|-----------------------------------------------|
| `4010000`  | Unauthorized                | Periksa Client ID dan Secret Key              |
| `4012400`  | Virtual Account Not Found   | Verifikasi nomor virtual account yang dikirim |
| `2002400`  | Successful                  | Transaksi berhasil                            |

### Channel Virtual Account

| Bank  | Channel Name                  |
|-------|-------------------------------|
| CIMB  | `VIRTUAL_ACCOUNT_BANK_CIMB`   |
| BNI   | `VIRTUAL_ACCOUNT_BANK_BNI`    |
| BRI   | `VIRTUAL_ACCOUNT_BANK_BRI`    |
| BCA   | `VIRTUAL_ACCOUNT_BANK_BCA`    |
| Mandiri | `VIRTUAL_ACCOUNT_BANK_MANDIRI` |

### SDK untuk Bahasa Lain

| Bahasa    | Repository                                                                                  |
|-----------|---------------------------------------------------------------------------------------------|
| Node.js   | [doku-nodejs-library](https://github.com/PTNUSASATUINTIARTHA-DOKU/doku-nodejs-library)     |
| PHP       | [doku-php-library](https://github.com/PTNUSASATUINTIARTHA-DOKU/doku-php-library)           |
| Go        | [doku-golang-library](https://github.com/PTNUSASATUINTIARTHA-DOKU/doku-golang-library)     |
| Java      | [doku-java-library](https://github.com/PTNUSASATUINTIARTHA-DOKU/doku-java-library)         |
