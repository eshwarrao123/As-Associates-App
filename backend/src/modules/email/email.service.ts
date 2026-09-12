import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend | null = null;
  private apiKey: string | undefined;
  private fromAddress: string;

  constructor(private configService: ConfigService) {
    // Read configuration but don't throw on missing values
    // This allows the app to start even if password recovery isn't configured yet
    this.apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromAddress =
      this.configService.get<string>('MAIL_FROM') ??
      'noreply@asassociates.com';
  }

  /**
   * Lazily initializes Resend client and validates configuration.
   * Throws only when email functionality is actually used.
   */
  private ensureConfigured(): void {
    if (!this.apiKey) {
      throw new InternalServerErrorException(
        'Email service is not configured. RESEND_API_KEY is missing.',
      );
    }

    if (!this.resend) {
      this.resend = new Resend(this.apiKey);
    }
  }

  /**
   * Sends a password reset email with a reset link.
   *
   * @param to - Recipient email address
   * @param resetUrl - Complete password reset URL (includes token)
   * @param expiresMinutes - Link expiration time in minutes
   * @param firstName - Optional recipient first name for personalization
   * @throws InternalServerErrorException if email service is not configured or delivery fails
   */
  async sendPasswordResetEmail(
    to: string,
    resetUrl: string,
    expiresMinutes: number,
    firstName?: string,
  ): Promise<void> {
    // Validate configuration before attempting to send
    this.ensureConfigured();

    const greeting = firstName ? `Hi ${firstName}` : 'Hello';

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color: #003366; padding: 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px;">AS Associates</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 16px; font-size: 16px; color: #333333;">${greeting},</p>

              <p style="margin: 0 0 16px; font-size: 16px; color: #333333;">
                A password reset was requested for your AS Associates admin account.
              </p>

              <p style="margin: 0 0 24px; font-size: 16px; color: #333333;">
                Click the button below to set a new password:
              </p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 24px;">
                    <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background-color: #003366; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 16px; font-weight: bold;">Reset Password</a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px; font-size: 14px; color: #666666;">
                This link will expire in <strong>${expiresMinutes} minutes</strong>.
              </p>

              <p style="margin: 0 0 16px; font-size: 14px; color: #666666;">
                If you did not request a password reset, you can safely ignore this email. Your password will not change unless you click the reset link above.
              </p>

              <p style="margin: 24px 0 0; font-size: 12px; color: #999999; border-top: 1px solid #eeeeee; padding-top: 16px;">
                If the button above doesn't work, copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #003366; word-break: break-all;">${resetUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f8f8; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="margin: 0; font-size: 12px; color: #999999;">
                © ${new Date().getFullYear()} AS Associates. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const textContent = `
${greeting},

A password reset was requested for your AS Associates admin account.

Click the link below to set a new password:
${resetUrl}

This link will expire in ${expiresMinutes} minutes.

If you did not request a password reset, you can safely ignore this email. Your password will not change unless you use the reset link above.

© ${new Date().getFullYear()} AS Associates. All rights reserved.
    `.trim();

    try {
      const result = await this.resend!.emails.send({
        from: this.fromAddress,
        to,
        subject: 'AS Associates — Password Reset Request',
        html: htmlContent,
        text: textContent,
      });

      // Resend returns { data: { id }, error: null } on success
      if (result.error) {
        throw new Error(
          `Resend API error: ${result.error.message || 'Unknown error'}`,
        );
      }
    } catch (error) {
      // Allow caller to handle delivery failures
      // Caller (AuthService) will catch this and still return generic response
      throw new InternalServerErrorException(
        `Failed to send password reset email: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
