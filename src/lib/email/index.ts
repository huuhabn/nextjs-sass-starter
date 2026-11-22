import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

import { emailEnv } from '@/env/email';

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

class EmailService {
  private transporter: Transporter | null = null;
  private fromAddress: string;

  constructor() {
    const host = emailEnv.SMTP_HOST || '127.0.0.1';
    const port = emailEnv.SMTP_PORT || 1025;
    const secure = emailEnv.SMTP_SECURE ?? false;
    const auth =
      emailEnv.SMTP_USER && emailEnv.SMTP_PASS
        ? { user: emailEnv.SMTP_USER, pass: emailEnv.SMTP_PASS }
        : undefined;

    this.fromAddress =
      emailEnv.SMTP_FROM || emailEnv.RESEND_FROM || 'Acme SaaS <noreply@saas.local>';

    try {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth,
        ignoreTLS: !secure
      });
    } catch (err) {
      console.warn('[EmailService] Failed to initialize nodemailer transporter:', err);
    }
  }

  async sendMail(options: SendMailOptions): Promise<{ success: boolean; messageId?: string }> {
    const from = options.from || this.fromAddress;

    // Resend Provider option (if configured)
    if (emailEnv.EMAIL_SERVICE_PROVIDER === 'resend' && emailEnv.RESEND_API_KEY) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${emailEnv.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text
          })
        });

        if (res.ok) {
          const data = (await res.json()) as { id?: string };
          return { success: true, messageId: data.id };
        }
      } catch (e) {
        console.warn('[EmailService] Resend API call failed, falling back to SMTP/Console:', e);
      }
    }

    // Default Mailpit / SMTP
    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text || options.subject
        });
        return { success: true, messageId: info.messageId };
      } catch (err) {
        console.warn(
          `[EmailService] SMTP delivery to ${options.to} failed (Mailpit not running on port 1025?). Fallback to console.`
        );
      }
    }

    // Fallback: Terminal Console Log
    console.log('\n================== ✉️ DEV EMAIL PREVIEW ==================');
    console.log(`To: ${options.to}`);
    console.log(`From: ${from}`);
    console.log(`Subject: ${options.subject}`);
    if (options.text) console.log(`Body (text): ${options.text}`);
    console.log('===========================================================\n');

    return { success: true, messageId: 'console-fallback' };
  }
}

export const emailService = new EmailService();

export function getVerificationEmailTemplate({ url, name }: { url: string; name?: string }) {
  return {
    subject: 'Xác thực tài khoản của bạn - Acme SaaS',
    text: `Xin chào ${name || 'bạn'},\nVui lòng nhấp vào liên kết sau để xác thực email của bạn: ${url}\nLiên kết này sẽ hết hạn sau 1 giờ.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a; margin-bottom: 16px;">Xác thực tài khoản Acme SaaS</h2>
        <p style="color: #475569; font-size: 16px; line-height: 24px;">
          Xin chào <strong>${name || 'bạn'}</strong>,
        </p>
        <p style="color: #475569; font-size: 16px; line-height: 24px;">
          Cảm ơn bạn đã đăng ký tài khoản. Vui lòng bấm vào nút bên dưới để hoàn tất việc xác thực email:
        </p>
        <div style="margin: 28px 0;">
          <a href="${url}" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
            Xác thực Email
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 14px;">
          Hoặc copy liên kết sau vào trình duyệt:<br/>
          <a href="${url}" style="color: #2563eb; word-break: break-all;">${url}</a>
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">Nếu bạn không yêu cầu đăng ký này, vui lòng bỏ qua email.</p>
      </div>
    `
  };
}

export function getResetPasswordEmailTemplate({ url, name }: { url: string; name?: string }) {
  return {
    subject: 'Đặt lại mật khẩu của bạn - Acme SaaS',
    text: `Xin chào ${name || 'bạn'},\nBạn đã yêu cầu đặt lại mật khẩu. Bấm vào link sau: ${url}\nLiên kết này sẽ hết hạn sau 15 phút.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a; margin-bottom: 16px;">Yêu cầu Đặt lại Mật khẩu</h2>
        <p style="color: #475569; font-size: 16px; line-height: 24px;">
          Xin chào <strong>${name || 'bạn'}</strong>,
        </p>
        <p style="color: #475569; font-size: 16px; line-height: 24px;">
          Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng nhấn vào nút bên dưới để tạo mật khẩu mới:
        </p>
        <div style="margin: 28px 0;">
          <a href="${url}" style="background-color: #ef4444; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
            Đặt lại Mật khẩu
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 14px;">
          Hoặc dán liên kết sau vào trình duyệt:<br/>
          <a href="${url}" style="color: #2563eb; word-break: break-all;">${url}</a>
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">Liên kết có hiệu lực trong vòng 15 phút. Nếu bạn không yêu cầu đổi mật khẩu, vui lòng liên hệ hỗ trợ.</p>
      </div>
    `
  };
}

export function getMagicLinkEmailTemplate({ url, name }: { url: string; name?: string }) {
  return {
    subject: 'Đăng nhập vào Acme SaaS bằng Magic Link',
    text: `Xin chào ${name || 'bạn'},\nBấm vào liên kết sau để đăng nhập tức thì: ${url}\nLiên kết này sẽ hết hạn sau 15 phút.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a; margin-bottom: 16px;">Đăng nhập nhanh với Magic Link</h2>
        <p style="color: #475569; font-size: 16px; line-height: 24px;">
          Xin chào <strong>${name || 'bạn'}</strong>,
        </p>
        <p style="color: #475569; font-size: 16px; line-height: 24px;">
          Nhấn vào nút bên dưới để đăng nhập trực tiếp vào hệ thống mà không cần mật khẩu:
        </p>
        <div style="margin: 28px 0;">
          <a href="${url}" style="background-color: #3b82f6; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
            Đăng nhập vào Acme SaaS
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 14px;">
          Hoặc sao chép liên kết:<br/>
          <a href="${url}" style="color: #2563eb; word-break: break-all;">${url}</a>
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">Liên kết này chỉ dùng được một lần và có hiệu lực trong 15 phút.</p>
      </div>
    `
  };
}

export function getTwoFactorOTPEmailTemplate({ otp, name }: { otp: string; name?: string }) {
  return {
    subject: 'Mã xác thực 2 bước (2FA) - Acme SaaS',
    text: `Xin chào ${name || 'bạn'},\nMã xác thực 2 bước của bạn là: ${otp}\nMã này có hiệu lực trong vòng 5 phút.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a; margin-bottom: 16px;">Mã xác thực đăng nhập (2FA)</h2>
        <p style="color: #475569; font-size: 16px; line-height: 24px;">
          Xin chào <strong>${name || 'bạn'}</strong>,
        </p>
        <p style="color: #475569; font-size: 16px; line-height: 24px;">
          Mã xác minh 2 bước để đăng nhập vào tài khoản của bạn là:
        </p>
        <div style="margin: 24px 0; background-color: #f1f5f9; padding: 16px; border-radius: 6px; text-align: center;">
          <span style="font-size: 32px; letter-spacing: 6px; font-weight: 700; color: #0f172a;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 14px;">Mã này có hiệu lực trong vòng 5 phút. Tuyệt đối không chia sẻ mã này với bất kỳ ai.</p>
      </div>
    `
  };
}
