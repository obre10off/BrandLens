import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// For testing without a verified domain
const TEST_EMAIL = 'onboarding@resend.dev';

interface EmailUser {
  id: string;
  email: string;
  name?: string | null;
}

export async function sendVerificationEmail(
  { user, url }: { user: EmailUser; url: string; token: string }
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify your email</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to BrandLens!</h1>
        <p style="color: #666; font-size: 16px;">
          Hi ${user.name || 'there'},
        </p>
        <p style="color: #666; font-size: 16px;">
          Please verify your email address by clicking the button below:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p style="color: #999; font-size: 14px;">
          Or copy and paste this link: ${url}
        </p>
        <p style="color: #999; font-size: 14px;">
          This link will expire in 1 hour.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: TEST_EMAIL, // Using Resend test email for development
      to: user.email,
      subject: 'Verify your BrandLens account',
      html,
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw error;
  }
}

export async function sendResetPasswordEmail(
  { user, url }: { user: EmailUser; url: string; token: string }
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset your password</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Reset Your Password</h1>
        <p style="color: #666; font-size: 16px;">
          Hi ${user.name || 'there'},
        </p>
        <p style="color: #666; font-size: 16px;">
          We received a request to reset your password. Click the button below to create a new password:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #999; font-size: 14px;">
          Or copy and paste this link: ${url}
        </p>
        <p style="color: #999; font-size: 14px;">
          This link will expire in 1 hour.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">
          If you didn't request a password reset, you can safely ignore this email.
        </p>
      </div>
    </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: TEST_EMAIL, // Using Resend test email for development
      to: user.email,
      subject: 'Reset your BrandLens password',
      html,
    });
  } catch (error) {
    console.error('Failed to send reset password email:', error);
    throw error;
  }
}