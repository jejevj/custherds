"""
Template HTML email notifikasi alur registrasi lanjutan — glassmorphism theme.

Tahap 2: build_document_submitted_email
  — Dikirim setelah user submit dokumen (status: pending).
  — Isi: dokumen diterima, akun sedang diverifikasi tim admin.

Tahap 3a: build_account_verified_email
  — Dikirim setelah admin APPROVE guide / vendor.
  — Isi: selamat, akun terverifikasi, bisa langsung beroperasi.

Tahap 3b: build_account_rejected_email
  — Dikirim setelah admin REJECT guide / vendor.
  — Isi: maaf, akun ditolak + alasan + cara mengajukan ulang.
"""
from typing import Literal, Optional

ROLE_META = {
    "guide": {
        "title":       "Herd Partner (Guide)",
        "icon":        "🧗",
        "accent":      "#c9a84c",
        "badge_bg":    "rgba(201,168,76,0.18)",
        "badge_color": "#f5d98b",
        "portal_url":  "https://partners.custherds.com",
        "portal_name": "Partner Portal",
    },
    "vendor": {
        "title":       "Business Vendor",
        "icon":        "🏢",
        "accent":      "#4ca8c9",
        "badge_bg":    "rgba(76,168,201,0.18)",
        "badge_color": "#8bd5f5",
        "portal_url":  "https://partners.custherds.com",
        "portal_name": "Vendor Portal",
    },
}


def _base_styles(accent: str, badge_bg: str, badge_color: str) -> str:
    return f"""
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: 'Segoe UI', Arial, sans-serif;
      background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
      min-height: 100vh; padding: 40px 16px;
    }}
    .wrapper {{ max-width: 600px; margin: 0 auto; }}
    .card {{
      background: rgba(255,255,255,0.07);
      backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 24px; overflow: hidden;
      box-shadow: 0 24px 64px rgba(0,0,0,0.45);
    }}
    .header {{
      background: linear-gradient(135deg, {accent}22 0%, {accent}44 100%);
      border-bottom: 1px solid rgba(255,255,255,0.10);
      padding: 40px 40px 32px; text-align: center;
    }}
    .logo {{ font-size: 28px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }}
    .logo span {{ color: {accent}; }}
    .icon-circle {{
      width: 72px; height: 72px;
      background: rgba(255,255,255,0.10);
      border: 2px solid rgba(255,255,255,0.20); border-radius: 50%;
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 34px; margin: 20px 0 12px;
    }}
    .header h1 {{ font-size: 24px; font-weight: 700; color: #ffffff; margin-bottom: 6px; }}
    .header p {{ font-size: 14px; color: rgba(255,255,255,0.65); }}
    .body {{ padding: 36px 40px; }}
    .greeting {{ font-size: 17px; font-weight: 600; color: #ffffff; margin-bottom: 12px; }}
    .text {{ font-size: 14px; color: rgba(255,255,255,0.75); line-height: 1.75; margin-bottom: 12px; }}
    .badge {{
      display: inline-block;
      background: {badge_bg}; color: {badge_color};
      border: 1px solid {accent}55; border-radius: 30px;
      padding: 6px 18px; font-size: 13px; font-weight: 700;
      margin: 4px 0 20px;
    }}
    .info-box {{
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 14px; padding: 20px 24px; margin: 20px 0;
    }}
    .info-row {{
      display: flex; justify-content: space-between; align-items: flex-start;
      padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.06); gap: 12px;
    }}
    .info-row:last-child {{ border-bottom: none; }}
    .info-label {{ font-size: 12px; color: rgba(255,255,255,0.45); text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; min-width: 110px; }}
    .info-value {{ font-size: 14px; color: #ffffff; font-weight: 500; text-align: right; }}
    .notice {{
      border-left: 3px solid {accent};
      border-radius: 0 10px 10px 0;
      padding: 14px 18px; margin: 20px 0;
      font-size: 13px; color: rgba(255,255,255,0.70); line-height: 1.6;
    }}
    .cta-wrap {{ text-align: center; margin: 28px 0 8px; }}
    .cta {{
      display: inline-block;
      background: linear-gradient(135deg, {accent}, {accent}cc);
      color: #1a1a2e; font-size: 15px; font-weight: 700;
      text-decoration: none; padding: 14px 36px; border-radius: 30px;
      box-shadow: 0 8px 24px {accent}44;
    }}
    .footer {{
      text-align: center; padding: 24px 40px 32px;
      border-top: 1px solid rgba(255,255,255,0.07);
    }}
    .footer p {{ font-size: 12px; color: rgba(255,255,255,0.35); line-height: 1.7; }}
    .footer a {{ color: {accent}; text-decoration: none; }}
    @media (max-width: 480px) {{
      .header, .body, .footer {{ padding-left: 20px; padding-right: 20px; }}
      .info-row {{ flex-direction: column; }}
      .info-value {{ text-align: left; }}
    }}
"""


# ─────────────────────────────────────────────────────────────────────
# TAHAP 2 — Dokumen Disubmit, Akun Dalam Proses Verifikasi
# ─────────────────────────────────────────────────────────────────────
def build_document_submitted_email(
    user_name: str,
    user_email: str,
    role: Literal["guide", "vendor"],
    vendor_business_name: str = "",
) -> tuple[str, str, str]:
    """
    Tahap 2 — dikirim saat guide/vendor submit dokumen (POST /guides/me/submit
    atau POST /vendors/me/submit).
    Isi: dokumen diterima, akun sedang dalam antrian verifikasi admin.
    Return: (subject, body_html, body_text)
    """
    m = ROLE_META[role]
    display_name = vendor_business_name if (role == "vendor" and vendor_business_name) else user_name
    subject = f"📄 Dokumen Diterima — Akun Kamu Sedang Diverifikasi | Custherds.com"
    styles = _base_styles(m["accent"], m["badge_bg"], m["badge_color"])

    extra_row = (
        f'<div class="info-row">'
        f'<span class="info-label">Bisnis</span>'
        f'<span class="info-value">{vendor_business_name}</span>'
        f'</div>'
        if vendor_business_name else ""
    )

    body_html = f"""<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{subject}</title>
  <style>{styles}</style>
</head>
<body>
  <div class="wrapper"><div class="card">
    <div class="header">
      <div class="logo">Cust<span>herds</span>.com</div>
      <div class="icon-circle">📄</div>
      <h1>Dokumen Berhasil Dikirim!</h1>
      <p>Tim admin kami sedang mereview data kamu.</p>
    </div>
    <div class="body">
      <p class="greeting">Halo, {display_name}! 👋</p>
      <p class="text">
        Dokumen dan profil kamu sebagai <strong style="color:#fff;">{m['title']}</strong>
        telah kami terima dengan sukses dan sekarang sedang dalam antrian verifikasi.
      </p>
      <div><span class="badge">🔄 Sedang Dalam Proses Verifikasi</span></div>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Nama</span>
          <span class="info-value">{user_name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email</span>
          <span class="info-value">{user_email}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Peran</span>
          <span class="info-value">{m['title']}</span>
        </div>
        {extra_row}
        <div class="info-row">
          <span class="info-label">Status</span>
          <span class="info-value" style="color:{m['badge_color']};">Pending — Menunggu Review Admin</span>
        </div>
      </div>
      <div class="notice" style="background: rgba(76,168,201,0.08);">
        ⏰ <strong style="color:{m['badge_color']};">Estimasi waktu verifikasi:</strong>
        1&ndash;7 hari kerja.<br />
        Kamu akan menerima email notifikasi begitu akun kamu selesai diverifikasi.
        Jika belum ada kabar setelah 7 hari kerja, hubungi kami di
        <a href="mailto:support@custherds.com" style="color:{m['accent']};">support@custherds.com</a>.
      </div>
      <div class="cta-wrap">
        <a href="{m['portal_url']}" class="cta">Pantau Status di {m['portal_name']} &rarr;</a>
      </div>
    </div>
    <div class="footer">
      <p>
        Email ini dikirim otomatis oleh sistem Custherds.com.<br />
        Jangan membalas email ini. Butuh bantuan?
        <a href="mailto:support@custherds.com">support@custherds.com</a>
      </p>
      <p style="margin-top:10px;">&copy; 2025 Custherds.com &mdash; Bali, Indonesia</p>
    </div>
  </div></div>
</body>
</html>"""

    body_text = (
        f"Halo {display_name},\n\n"
        f"Dokumen dan profil kamu sebagai {m['title']} di Custherds.com telah kami terima.\n"
        f"Status: Sedang Dalam Proses Verifikasi (estimasi 1-7 hari kerja).\n\n"
        f"Kamu akan mendapat email konfirmasi setelah verifikasi selesai.\n"
        f"Info lebih lanjut: support@custherds.com\n\n"
        f"Salam,\nTim Custherds.com"
    )
    return subject, body_html, body_text


# ─────────────────────────────────────────────────────────────────────
# TAHAP 3a — Akun Terverifikasi (APPROVED)
# ─────────────────────────────────────────────────────────────────────
def build_account_verified_email(
    user_name: str,
    user_email: str,
    role: Literal["guide", "vendor"],
    vendor_business_name: str = "",
) -> tuple[str, str, str]:
    """
    Tahap 3a — dikirim saat admin APPROVE guide / vendor.
    Isi: selamat, akun resmi terverifikasi, bisa mulai beroperasi.
    Return: (subject, body_html, body_text)
    """
    m = ROLE_META[role]
    display_name = vendor_business_name if (role == "vendor" and vendor_business_name) else user_name
    subject = f"🎉 Akun Kamu Telah Diverifikasi — Selamat Bergabung di Custherds!"
    styles = _base_styles(m["accent"], m["badge_bg"], m["badge_color"])

    extra_row = (
        f'<div class="info-row">'
        f'<span class="info-label">Bisnis</span>'
        f'<span class="info-value">{vendor_business_name}</span>'
        f'</div>'
        if vendor_business_name else ""
    )

    body_html = f"""<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{subject}</title>
  <style>{styles}</style>
</head>
<body>
  <div class="wrapper"><div class="card">
    <div class="header">
      <div class="logo">Cust<span>herds</span>.com</div>
      <div class="icon-circle">🎉</div>
      <h1>Akun Kamu Telah Diverifikasi!</h1>
      <p>Kamu resmi menjadi bagian dari Custherds.</p>
    </div>
    <div class="body">
      <p class="greeting">Selamat, {display_name}! 🥳</p>
      <p class="text">
        Tim admin Custherds telah <strong style="color:#fff;">memverifikasi akun kamu</strong>
        sebagai <strong style="color:#fff;">{m['title']}</strong>.
        Kamu sekarang bisa langsung login dan mulai beroperasi!
      </p>
      <div><span class="badge">✅ Akun Terverifikasi & Aktif</span></div>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Nama</span>
          <span class="info-value">{user_name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email</span>
          <span class="info-value">{user_email}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Peran</span>
          <span class="info-value">{m['title']}</span>
        </div>
        {extra_row}
        <div class="info-row">
          <span class="info-label">Status</span>
          <span class="info-value" style="color:#6fcf97;">✅ Approved & Aktif</span>
        </div>
      </div>
      <div class="notice" style="background: rgba(111,207,151,0.08); border-left-color: #6fcf97;">
        🚀 <strong style="color:#6fcf97;">Kamu sudah bisa mulai beroperasi!</strong><br />
        Login ke {m['portal_name']} dan mulai terima booking / transaksi.
        Jika ada pertanyaan, hubungi kami di
        <a href="mailto:support@custherds.com" style="color:{m['accent']};">support@custherds.com</a>.
      </div>
      <div class="cta-wrap">
        <a href="{m['portal_url']}" class="cta">Mulai di {m['portal_name']} &rarr;</a>
      </div>
    </div>
    <div class="footer">
      <p>
        Email ini dikirim otomatis oleh sistem Custherds.com.<br />
        Jangan membalas email ini. Butuh bantuan?
        <a href="mailto:support@custherds.com">support@custherds.com</a>
      </p>
      <p style="margin-top:10px;">&copy; 2025 Custherds.com &mdash; Bali, Indonesia</p>
    </div>
  </div></div>
</body>
</html>"""

    body_text = (
        f"Selamat, {display_name}!\n\n"
        f"Akun kamu sebagai {m['title']} di Custherds.com telah resmi diverifikasi.\n"
        f"Status: Approved & Aktif.\n\n"
        f"Silakan login ke {m['portal_url']} dan mulai beroperasi.\n"
        f"Info lebih lanjut: support@custherds.com\n\n"
        f"Salam,\nTim Custherds.com"
    )
    return subject, body_html, body_text


# ─────────────────────────────────────────────────────────────────────
# TAHAP 3b — Akun Ditolak (REJECTED)
# ─────────────────────────────────────────────────────────────────────
def build_account_rejected_email(
    user_name: str,
    user_email: str,
    role: Literal["guide", "vendor"],
    rejection_notes: Optional[str] = None,
    vendor_business_name: str = "",
) -> tuple[str, str, str]:
    """
    Tahap 3b — dikirim saat admin REJECT guide / vendor.
    Isi: maaf akun ditolak, alasan penolakan, cara mengajukan ulang.
    Return: (subject, body_html, body_text)
    """
    m = ROLE_META[role]
    display_name = vendor_business_name if (role == "vendor" and vendor_business_name) else user_name
    subject = f"❌ Pengajuan Akun {m['title']} Ditolak — Custherds.com"
    styles = _base_styles("#e05c5c", "rgba(224,92,92,0.18)", "#f5a0a0")

    notes_html = (
        f'<div class="info-row">'
        f'<span class="info-label">Alasan</span>'
        f'<span class="info-value" style="color:#f5a0a0;">{rejection_notes}</span>'
        f'</div>'
        if rejection_notes else ""
    )
    notes_text = f"\nAlasan penolakan: {rejection_notes}" if rejection_notes else ""

    extra_row = (
        f'<div class="info-row">'
        f'<span class="info-label">Bisnis</span>'
        f'<span class="info-value">{vendor_business_name}</span>'
        f'</div>'
        if vendor_business_name else ""
    )

    body_html = f"""<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{subject}</title>
  <style>{styles}</style>
</head>
<body>
  <div class="wrapper"><div class="card">
    <div class="header">
      <div class="logo">Cust<span>herds</span>.com</div>
      <div class="icon-circle">❌</div>
      <h1>Pengajuan Akun Ditolak</h1>
      <p>Jangan khawatir, kamu bisa mengajukan ulang.</p>
    </div>
    <div class="body">
      <p class="greeting">Halo, {display_name}.</p>
      <p class="text">
        Kami mohon maaf, tim admin Custherds belum dapat menyetujui
        pengajuan akun kamu sebagai <strong style="color:#fff;">{m['title']}</strong>
        saat ini. Silakan periksa alasan di bawah dan perbaiki dokumen kamu.
      </p>
      <div><span class="badge">❌ Pengajuan Ditolak</span></div>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Nama</span>
          <span class="info-value">{user_name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email</span>
          <span class="info-value">{user_email}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Peran</span>
          <span class="info-value">{m['title']}</span>
        </div>
        {extra_row}
        {notes_html}
        <div class="info-row">
          <span class="info-label">Status</span>
          <span class="info-value" style="color:#f5a0a0;">Ditolak</span>
        </div>
      </div>
      <div class="notice" style="background: rgba(224,92,92,0.08); border-left-color: #e05c5c;">
        🔄 <strong style="color:#f5a0a0;">Cara mengajukan ulang:</strong><br />
        1. Login ke {m['portal_name']}<br />
        2. Perbaiki data / dokumen sesuai alasan penolakan<br />
        3. Submit kembali untuk direview<br /><br />
        Butuh bantuan? Hubungi kami di
        <a href="mailto:support@custherds.com" style="color:#e05c5c;">support@custherds.com</a>.
      </div>
      <div class="cta-wrap">
        <a href="{m['portal_url']}" class="cta" style="background: linear-gradient(135deg, #e05c5c, #c04444); box-shadow: 0 8px 24px rgba(224,92,92,0.44);">
          Perbaiki & Ajukan Ulang &rarr;
        </a>
      </div>
    </div>
    <div class="footer">
      <p>
        Email ini dikirim otomatis oleh sistem Custherds.com.<br />
        Jangan membalas email ini. Butuh bantuan?
        <a href="mailto:support@custherds.com">support@custherds.com</a>
      </p>
      <p style="margin-top:10px;">&copy; 2025 Custherds.com &mdash; Bali, Indonesia</p>
    </div>
  </div></div>
</body>
</html>"""

    body_text = (
        f"Halo {display_name},\n\n"
        f"Kami mohon maaf, pengajuan akun kamu sebagai {m['title']} di Custherds.com ditolak.\n"
        f"{notes_text}\n\n"
        f"Cara mengajukan ulang:\n"
        f"1. Login ke {m['portal_url']}\n"
        f"2. Perbaiki data / dokumen\n"
        f"3. Submit kembali untuk direview\n\n"
        f"Info lebih lanjut: support@custherds.com\n\n"
        f"Salam,\nTim Custherds.com"
    )
    return subject, body_html, body_text
