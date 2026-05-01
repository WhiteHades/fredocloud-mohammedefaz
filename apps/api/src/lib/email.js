const nodemailer = require("nodemailer");

let transport = null;

function hasEmailTransport() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM,
  );
}

function getTransport() {
  if (!hasEmailTransport()) {
    return null;
  }

  if (!transport) {
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return transport;
}

async function sendEmail(message) {
  const currentTransport = getTransport();

  if (!currentTransport) {
    return { skipped: true };
  }

  await currentTransport.sendMail({
    from: process.env.SMTP_FROM,
    ...message,
  });

  return { skipped: false };
}

async function sendInvitationEmail({ to, workspaceName, inviterName }) {
  return sendEmail({
    to,
    subject: `Invitation to join ${workspaceName}`,
    text: `${inviterName} invited you to join ${workspaceName} in notFredoHub. Sign in with this email to accept the invitation.`,
  });
}

async function sendMentionEmail({ to, workspaceName, announcementTitle, commentBody }) {
  return sendEmail({
    to,
    subject: `You were mentioned in ${workspaceName}`,
    text: `You were mentioned in the announcement \"${announcementTitle}\". Comment: ${commentBody}`,
  });
}

module.exports = {
  hasEmailTransport,
  sendInvitationEmail,
  sendMentionEmail,
};
