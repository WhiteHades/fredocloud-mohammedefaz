let resendClient = null;

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }

  if (!resendClient) {
    resendClient = {
      apiKey: process.env.RESEND_API_KEY,
      baseUrl: "https://api.resend.com",
    };
  }

  return resendClient;
}

function hasEmailTransport() {
  return Boolean(process.env.RESEND_API_KEY && process.env.SMTP_FROM);
}

async function sendEmail({ to, subject, html }) {
  const client = getResendClient();

  if (!client) {
    return { skipped: true };
  }

  const response = await fetch(`${client.baseUrl}/emails`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${client.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend API error ${response.status}: ${body}`);
  }

  return { skipped: false };
}

/* ── Shared HTML wrapper ──────────────────────────────────── */

function emailLayout({ preheader, title, body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'IBM Plex Sans','Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <span style="display:none;font-size:0;line-height:0;max-height:0;overflow:hidden">${preheader || ""}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f4;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border:1px solid #e7e5e4;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:28px 28px 0 28px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:10px;">
                <div style="width:32px;height:32px;background-color:#c8102e;border-radius:8px;display:flex;align-items:center;justify-content:center;">
                  <span style="color:#ffffff;font-size:12px;font-weight:700;font-family:-apple-system,BlinkMacSystemFont,'IBM Plex Sans','Segoe UI',Roboto,Helvetica,Arial,sans-serif;">nF</span>
                </div>
                <span style="font-size:18px;font-weight:600;color:#1c1917;font-family:-apple-system,BlinkMacSystemFont,'IBM Plex Sans','Segoe UI',Roboto,Helvetica,Arial,sans-serif;">notFredoHub</span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px 0 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="border-top:1px solid #e7e5e4;"></td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 28px 28px;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 24px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="border-top:1px solid #e7e5e4;padding-top:16px;"></td></tr>
                <tr>
                  <td style="font-size:12px;color:#78716c;line-height:1.6;font-family:-apple-system,BlinkMacSystemFont,'IBM Plex Sans','Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                    <p style="margin:0;">notFredoHub &mdash; collaborative team hub</p>
                    <p style="margin:4px 0 0 0;">You received this email because you are a member of a workspace on notFredoHub.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* ── Notification templates ──────────────────────────────── */

async function sendInvitationEmail({ to, workspaceName, inviterName, acceptUrl }) {
  const title = `Invitation to join ${workspaceName}`;
  const preheader = `${inviterName} invited you to join ${workspaceName}`;
  const body = `
<h2 style="margin:0 0 8px 0;font-size:20px;font-weight:600;color:#1c1917;line-height:1.3;font-family:-apple-system,BlinkMacSystemFont,'IBM Plex Sans','Segoe UI',Roboto,Helvetica,Arial,sans-serif;">You've been invited</h2>
<p style="margin:0 0 20px 0;font-size:15px;color:#44403c;line-height:1.6;font-family:-apple-system,BlinkMacSystemFont,'IBM Plex Sans','Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <strong style="color:#1c1917;">${inviterName}</strong> has invited you to join
  <strong style="color:#1c1917;">${workspaceName}</strong> on notFredoHub.
</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafaf9;border:1px solid #e7e5e4;border-radius:8px;margin-bottom:20px;">
  <tr>
    <td style="padding:16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="font-size:13px;color:#78716c;padding-bottom:4px;">Workspace</td></tr>
        <tr><td style="font-size:15px;font-weight:600;color:#1c1917;padding-bottom:12px;">${workspaceName}</td></tr>
        <tr><td style="font-size:13px;color:#78716c;padding-bottom:4px;">Invited by</td></tr>
        <tr><td style="font-size:15px;color:#44403c;">${inviterName}</td></tr>
      </table>
    </td>
  </tr>
</table>
<table role="presentation" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center" style="border-radius:8px;background-color:#c8102e;">
      <a href="${acceptUrl}"
         style="display:inline-block;padding:12px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;font-family:-apple-system,BlinkMacSystemFont,'IBM Plex Sans','Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        Accept invitation
      </a>
    </td>
  </tr>
</table>
<p style="margin:20px 0 0 0;font-size:13px;color:#78716c;line-height:1.6;font-family:-apple-system,BlinkMacSystemFont,'IBM Plex Sans','Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  Or sign in at <a href="https://notfredohub.mohammedefaz.com" style="color:#c8102e;text-decoration:none;">notfredohub.mohammedefaz.com</a> with this email address to accept.
</p>`;

  return sendEmail({ to, subject: `[notFredoHub] ${title}`, html: emailLayout({ preheader, title, body }) });
}

async function sendMentionEmail({ to, workspaceName, announcementTitle, commentBody, goUrl }) {
  const title = `You were mentioned in ${workspaceName}`;
  const preheader = `@mention in "${announcementTitle}"`;
  const body = `
<h2 style="margin:0 0 8px 0;font-size:20px;font-weight:600;color:#1c1917;line-height:1.3;font-family:-apple-system,BlinkMacSystemFont,'IBM Plex Sans','Segoe UI',Roboto,Helvetica,Arial,sans-serif;">You were mentioned</h2>
<p style="margin:0 0 20px 0;font-size:15px;color:#44403c;line-height:1.6;font-family:-apple-system,BlinkMacSystemFont,'IBM Plex Sans','Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  Someone mentioned you in <strong style="color:#1c1917;">${workspaceName}</strong>.
</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafaf9;border:1px solid #e7e5e4;border-radius:8px;margin-bottom:20px;">
  <tr>
    <td style="padding:16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="font-size:13px;color:#78716c;padding-bottom:4px;">Announcement</td></tr>
        <tr><td style="font-size:15px;font-weight:600;color:#1c1917;padding-bottom:12px;">${announcementTitle}</td></tr>
        <tr><td style="font-size:13px;color:#78716c;padding-bottom:4px;">Comment</td></tr>
        <tr><td style="font-size:14px;color:#44403c;line-height:1.6;padding:12px;background-color:#ffffff;border:1px solid #e7e5e4;border-radius:6px;">${commentBody}</td></tr>
      </table>
    </td>
  </tr>
</table>
<table role="presentation" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center" style="border-radius:8px;background-color:#c8102e;">
      <a href="${goUrl}"
         style="display:inline-block;padding:12px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;font-family:-apple-system,BlinkMacSystemFont,'IBM Plex Sans','Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        View in notFredoHub
      </a>
    </td>
  </tr>
</table>
<p style="margin:20px 0 0 0;font-size:13px;color:#78716c;line-height:1.6;font-family:-apple-system,BlinkMacSystemFont,'IBM Plex Sans','Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  You can manage notification preferences in your workspace settings.
</p>`;

  return sendEmail({ to, subject: `[notFredoHub] ${title}`, html: emailLayout({ preheader, title, body }) });
}

module.exports = {
  hasEmailTransport,
  sendEmail,
  sendInvitationEmail,
  sendMentionEmail,
};
