"""
Template HTML email notifikasi registrasi — tema glassmorphism.
"""
from typing import Literal


ROLE_META = {
    "guide": {
        "title":    "Herd Partner",
        "icon":     "🧗",
        "tagline":  "Join the Herd. Grow. Earn. Together.",
        "accent":   "#c9a84c",
        "badge_bg": "rgba(201,168,76,0.18)",
        "badge_color": "#f5d98b",
    },
    "vendor": {
        "title":    "Business Vendor",
        "icon":     "🏢",
        "tagline":  "Grow your business in Bali with zero upfront cost.",
        "accent":   "#4ca8c9",
        "badge_bg": "rgba(76,168,201,0.18)",
        "badge_color": "#8bd5f5",
    },
}


def build_registration_email(
    user_name: str,
    user_email: str,
    role: Literal["guide", "vendor"],
    vendor_business_name: str = "",
) -> tuple[str, str]:
    """
    Kembalikan (subject, body_html) untuk email notifikasi registrasi.
    """
    m = ROLE_META[role]
    display_name = vendor_business_name if (role == "vendor" and vendor_business_name) else user_name
    subject = f"✅ Pendaftaran {m['title']} Berhasil — Custherds.com"

    body_html = f"""<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{subject}</title>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: 'Segoe UI', Arial, sans-serif;
      background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
      min-height: 100vh;
      padding: 40px 16px;
    }}
    .wrapper {{
      max-width: 600px;
      margin: 0 auto;
    }}

    /* ─ Hero glass card */
    .card {{
      background: rgba(255,255,255,0.07);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 24px 64px rgba(0,0,0,0.45);
    }}

    /* ─ Header */
    .header {{
      background: linear-gradient(135deg, {m['accent']}22 0%, {m['accent']}44 100%);
      border-bottom: 1px solid rgba(255,255,255,0.10);
      padding: 40px 40px 32px;
      text-align: center;
    }}
    .header .logo {{
      font-size: 28px;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.5px;
    }}
    .header .logo span {{ color: {m['accent']}; }}
    .header .icon-circle {{
      width: 72px; height: 72px;
      background: rgba(255,255,255,0.10);
      border: 2px solid rgba(255,255,255,0.20);
      border-radius: 50%;
      display: inline-flex;
      align-items: center; justify-content: center;
      font-size: 34px;
      margin: 20px 0 12px;
    }}
    .header h1 {{
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 6px;
    }}
    .header p {{
      font-size: 14px;
      color: rgba(255,255,255,0.65);
    }}

    /* ─ Body */
    .body {{ padding: 36px 40px; }}

    .greeting {{
      font-size: 17px;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 12px;
    }}
    .text {{
      font-size: 14px;
      color: rgba(255,255,255,0.75);
      line-height: 1.75;
      margin-bottom: 12px;
    }}

    /* ─ Status badge */
    .badge {{
      display: inline-block;
      background: {m['badge_bg']};
      color: {m['badge_color']};
      border: 1px solid {m['accent']}55;
      border-radius: 30px;
      padding: 6px 18px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.3px;
      margin: 4px 0 20px;
    }}

    /* ─ Info glass box */
    .info-box {{
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 14px;
      padding: 20px 24px;
      margin: 20px 0;
    }}
    .info-box .info-row {{
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      gap: 12px;
    }}
    .info-box .info-row:last-child {{ border-bottom: none; }}
    .info-label {{
      font-size: 12px;
      color: rgba(255,255,255,0.45);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
      min-width: 110px;
    }}
    .info-value {{
      font-size: 14px;
      color: #ffffff;
      font-weight: 500;
      text-align: right;
    }}

    /* ─ Timeline steps */
    .timeline {{ margin: 24px 0; }}
    .timeline-title {{
      font-size: 13px;
      font-weight: 700;
      color: rgba(255,255,255,0.50);
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin-bottom: 14px;
    }}
    .step {{
      display: flex;
      align-items: flex-start;
      gap: 14px;
      margin-bottom: 14px;
    }}
    .step-dot {{
      width: 28px; height: 28px;
      border-radius: 50%;
      background: rgba(255,255,255,0.08);
      border: 2px solid {m['accent']}66;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px;
      flex-shrink: 0;
      color: {m['accent']};
      font-weight: 700;
    }}
    .step-dot.done {{
      background: {m['accent']}33;
      border-color: {m['accent']};
    }}
    .step-text {{
      font-size: 14px;
      color: rgba(255,255,255,0.75);
      line-height: 1.5;
      padding-top: 3px;
    }}
    .step-text strong {{ color: #ffffff; }}

    /* ─ Notice box */
    .notice {{
      background: rgba(201,168,76,0.08);
      border-left: 3px solid {m['accent']};
      border-radius: 0 10px 10px 0;
      padding: 14px 18px;
      margin: 20px 0;
      font-size: 13px;
      color: rgba(255,255,255,0.70);
      line-height: 1.6;
    }}
    .notice strong {{ color: {m['badge_color']}; }}

    /* ─ CTA button */
    .cta-wrap {{ text-align: center; margin: 28px 0 8px; }}
    .cta {{
      display: inline-block;
      background: linear-gradient(135deg, {m['accent']}, {m['accent']}cc);
      color: #1a1a2e;
      font-size: 15px;
      font-weight: 700;
      text-decoration: none;
      padding: 14px 36px;
      border-radius: 30px;
      letter-spacing: 0.3px;
      box-shadow: 0 8px 24px {m['accent']}44;
    }}

    /* ─ Footer */
    .footer {{
      text-align: center;
      padding: 24px 40px 32px;
      border-top: 1px solid rgba(255,255,255,0.07);
    }}
    .footer p {{
      font-size: 12px;
      color: rgba(255,255,255,0.35);
      line-height: 1.7;
    }}
    .footer a {{ color: {m['accent']}; text-decoration: none; }}

    @media (max-width: 480px) {{
      .header, .body, .footer {{ padding-left: 20px; padding-right: 20px; }}
      .info-box .info-row {{ flex-direction: column; }}
      .info-value {{ text-align: left; }}
    }}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">

      <!-- HEADER -->
      <div class="header">
        <div class="logo">Cust<span>herds</span>.com</div>
        <div class="icon-circle">{m['icon']}</div>
        <h1>Pendaftaran Berhasil!</h1>
        <p>{m['tagline']}</p>
      </div>

      <!-- BODY -->
      <div class="body">
        <p class="greeting">Halo, {user_name}! 👋</p>
        <p class="text">
          Terima kasih telah mendaftarkan diri sebagai
          <strong style="color:#fff;">{m['title']}</strong> di Custherds.com.
          Pendaftaranmu telah kami terima dengan sukses.
        </p>

        <div>
          <span class="badge">🔄 Sedang Diverifikasi Admin</span>
        </div>

        <!-- Info box -->
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
          {'<div class="info-row"><span class="info-label">Bisnis</span><span class="info-value">' + vendor_business_name + '</span></div>' if vendor_business_name else ''}
          <div class="info-row">
            <span class="info-label">Status</span>
            <span class="info-value" style="color:{m['badge_color']};">Menunggu Verifikasi</span>
          </div>
        </div>

        <!-- Timeline -->
        <div class="timeline">
          <p class="timeline-title">Proses Selanjutnya</p>
          <div class="step">
            <div class="step-dot done">✓</div>
            <div class="step-text"><strong>Pendaftaran diterima</strong><br />Data kamu sudah masuk ke sistem kami.</div>
          </div>
          <div class="step">
            <div class="step-dot">2</div>
            <div class="step-text"><strong>Verifikasi oleh Admin</strong><br />Tim kami akan mereview data pendaftaran dalam <strong style="color:#fff;">1&ndash;7 hari kerja</strong>.</div>
          </div>
          <div class="step">
            <div class="step-dot">3</div>
            <div class="step-text"><strong>Notifikasi Persetujuan</strong><br />Kamu akan mendapat email konfirmasi setelah akun disetujui.</div>
          </div>
          <div class="step">
            <div class="step-dot">4</div>
            <div class="step-text"><strong>Akses Dashboard</strong><br />Login ke partner portal dan mulai beroperasi!</div>
          </div>
        </div>

        <!-- Notice -->
        <div class="notice">
          ⏰ <strong>Estimasi waktu verifikasi:</strong> 1&ndash;7 hari kerja.<br />
          Jika dalam 7 hari kerja belum ada kabar, silakan hubungi kami di
          <a href="mailto:support@custherds.com" style="color:{m['accent']};">support@custherds.com</a>.
        </div>

        <!-- CTA -->
        <div class="cta-wrap">
          <a href="https://partners.custherds.com" class="cta">Kunjungi Partner Portal &rarr;</a>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="footer">
        <p>
          Email ini dikirim otomatis oleh sistem Custherds.com.<br />
          Jangan membalas email ini. Butuh bantuan?
          <a href="mailto:support@custherds.com">support@custherds.com</a>
        </p>
        <p style="margin-top:10px;">
          &copy; 2025 Custherds.com &mdash; Bali, Indonesia
        </p>
      </div>

    </div>
  </div>
</body>
</html>"""

    body_text = (
        f"Halo {user_name},\n\n"
        f"Pendaftaran kamu sebagai {m['title']} di Custherds.com telah berhasil diterima.\n"
        f"Status saat ini: Menunggu Verifikasi Admin (1-7 hari kerja).\n\n"
        f"Setelah diverifikasi, kamu akan mendapat email konfirmasi.\n"
        f"Info lebih lanjut: support@custherds.com\n\n"
        f"Salam,\nTim Custherds.com"
    )

    return subject, body_html, body_text
