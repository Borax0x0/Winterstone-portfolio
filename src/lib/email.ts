import nodemailer from 'nodemailer';

// Email transporter configuration
// Uses Gmail SMTP (dev) or Resend SMTP (prod)
function getTransporter() {
    // Production: Use Resend if API key exists
    if (process.env.RESEND_API_KEY) {
        return nodemailer.createTransport({
            host: 'smtp.resend.com',
            port: 465,
            secure: true,
            auth: {
                user: 'resend',
                pass: process.env.RESEND_API_KEY,
            },
        });
    }

    // Development: Use Gmail SMTP
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: Number(process.env.EMAIL_PORT) || 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
}

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
    try {
        const transporter = getTransporter();

        await transporter.sendMail({
            from: `"Winterstone Lodge" <${process.env.EMAIL_USER || 'noreply@winterstone.com'}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
        });

        console.log(`Email sent to ${options.to}`);
        return true;
    } catch (error) {
        console.error('Email send error:', error);
        return false;
    }
}

// Verification email template
export async function sendVerificationEmail(
    toEmail: string,
    toName: string,
    verifyUrl: string
): Promise<boolean> {
    const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;font-family:Georgia,serif;background:#f5f5f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
            <tr><td align="center">
                <table width="600" style="max-width:600px;background:#fff;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background:#1c1917;padding:32px;text-align:center;">
                            <h1 style="margin:0;color:#fff;font-size:24px;letter-spacing:8px;font-weight:normal;">WINTERSTONE</h1>
                            <p style="margin:6px 0 0;color:#d4a853;font-size:9px;letter-spacing:3px;">The Silent Valley</p>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding:40px 32px;">
                            <p style="margin:0;color:#1c1917;font-size:18px;">Hello ${toName},</p>
                            <p style="margin:16px 0 24px;color:#57534e;font-size:14px;line-height:1.7;">
                                Thank you for creating an account with Winterstone Lodge. Please verify your email address to complete your registration.
                            </p>
                            <a href="${verifyUrl}" style="display:inline-block;background:#d4a853;color:#1c1917;padding:14px 32px;text-decoration:none;font-size:12px;letter-spacing:2px;font-weight:bold;">
                                VERIFY EMAIL
                            </a>
                            <p style="margin:24px 0 0;color:#a8a29e;font-size:12px;">
                                This link expires in 24 hours.
                            </p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background:#1c1917;padding:24px;text-align:center;">
                            <p style="margin:0;color:#78716c;font-size:10px;">
                                Bhagsunag Road, Mcleodganj, HP 176216
                            </p>
                        </td>
                    </tr>
                </table>
            </td></tr>
        </table>
    </body>
    </html>
    `;

    return sendEmail({
        to: toEmail,
        subject: 'Verify Your Winterstone Account',
        html,
        text: `Hello ${toName}, Please verify your email by visiting: ${verifyUrl}`,
    });
}

// Booking confirmation email template
export async function sendBookingConfirmationEmail(params: {
    user_email: string;
    user_name: string;
    user_phone: string;
    booking_id: string;
    room_name: string;
    check_in: string;
    check_out: string;
    nights: number;
    base_price: string;
    taxes: string;
    total_price: string;
}): Promise<boolean> {
    const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;font-family:Georgia,serif;background:#f5f5f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
            <tr><td align="center">
                <table width="600" style="max-width:600px;background:#fff;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background:#1c1917;padding:32px;text-align:center;">
                            <h1 style="margin:0;color:#fff;font-size:24px;letter-spacing:8px;font-weight:normal;">WINTERSTONE</h1>
                            <p style="margin:6px 0 0;color:#d4a853;font-size:9px;letter-spacing:3px;">The Silent Valley</p>
                        </td>
                    </tr>
                    <!-- Confirmation Banner -->
                    <tr>
                        <td style="background:linear-gradient(135deg,#d4a853 0%,#b8942f 100%);padding:18px;text-align:center;">
                            <p style="margin:0;color:#1c1917;font-size:10px;letter-spacing:4px;font-weight:bold;">BOOKING CONFIRMED</p>
                        </td>
                    </tr>
                    <!-- Greeting -->
                    <tr>
                        <td style="padding:32px 32px 16px;">
                            <p style="margin:0;color:#1c1917;font-size:18px;">Dear ${params.user_name},</p>
                            <p style="margin:12px 0 0;color:#57534e;font-size:13px;line-height:1.7;">
                                Your reservation at Winterstone Lodge has been confirmed.
                            </p>
                        </td>
                    </tr>
                    <!-- Invoice Box -->
                    <tr>
                        <td style="padding:16px 32px 24px;">
                            <table width="100%" style="background:#fafaf9;border:1px solid #e7e5e4;">
                                <tr>
                                    <td style="padding:16px;background:#1c1917;">
                                        <table width="100%"><tr>
                                            <td><p style="margin:0;color:#d4a853;font-size:10px;letter-spacing:2px;">INVOICE</p></td>
                                            <td style="text-align:right;"><p style="margin:0;color:#a8a29e;font-size:10px;">${params.booking_id}</p></td>
                                        </tr></table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:16px 16px 12px;">
                                        <p style="margin:0;color:#a8a29e;font-size:9px;letter-spacing:2px;">SUITE</p>
                                        <p style="margin:2px 0 0;color:#1c1917;font-size:16px;font-weight:bold;">${params.room_name}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:8px 16px;">
                                        <table width="100%"><tr>
                                            <td width="50%">
                                                <p style="margin:0;color:#a8a29e;font-size:9px;letter-spacing:1px;">CHECK-IN</p>
                                                <p style="margin:2px 0 0;color:#1c1917;font-size:13px;">${params.check_in}</p>
                                            </td>
                                            <td width="50%">
                                                <p style="margin:0;color:#a8a29e;font-size:9px;letter-spacing:1px;">CHECK-OUT</p>
                                                <p style="margin:2px 0 0;color:#1c1917;font-size:13px;">${params.check_out}</p>
                                            </td>
                                        </tr></table>
                                    </td>
                                </tr>
                                <tr><td style="padding:12px 16px 0;"><div style="height:1px;background:#e7e5e4;"></div></td></tr>
                                <tr>
                                    <td style="padding:12px 16px;">
                                        <table width="100%">
                                            <tr>
                                                <td><p style="margin:0;color:#57534e;font-size:12px;">${params.nights} nights</p></td>
                                                <td style="text-align:right;"><p style="margin:0;color:#1c1917;font-size:12px;">${params.base_price}</p></td>
                                            </tr>
                                            <tr>
                                                <td><p style="margin:6px 0 0;color:#57534e;font-size:12px;">Taxes & Fees (12%)</p></td>
                                                <td style="text-align:right;"><p style="margin:6px 0 0;color:#1c1917;font-size:12px;">${params.taxes}</p></td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr><td style="padding:0 16px;"><div style="height:1px;background:#e7e5e4;"></div></td></tr>
                                <tr>
                                    <td style="padding:12px 16px 16px;">
                                        <table width="100%"><tr>
                                            <td><p style="margin:0;color:#1c1917;font-size:13px;font-weight:bold;">TOTAL PAID</p></td>
                                            <td style="text-align:right;"><p style="margin:0;color:#d4a853;font-size:18px;font-weight:bold;">${params.total_price}</p></td>
                                        </tr></table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <!-- Guest Details -->
                    <tr>
                        <td style="padding:0 32px 24px;">
                            <p style="margin:0 0 8px;color:#a8a29e;font-size:9px;letter-spacing:2px;">GUEST</p>
                            <p style="margin:0;color:#1c1917;font-size:13px;">${params.user_name}</p>
                            <p style="margin:2px 0 0;color:#57534e;font-size:12px;">${params.user_email} | ${params.user_phone}</p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background:#1c1917;padding:24px 32px;text-align:center;">
                            <p style="margin:0;color:#a8a29e;font-size:11px;line-height:1.6;">Bhagsunag Road, Mcleodganj, HP 176216</p>
                            <p style="margin:8px 0 0;color:#78716c;font-size:10px;">+91 99582 70492 | winterstone110104@gmail.com</p>
                        </td>
                    </tr>
                </table>
            </td></tr>
        </table>
    </body>
    </html>
    `;

    return sendEmail({
        to: params.user_email,
        subject: `Booking Confirmed - ${params.room_name} | Winterstone Lodge`,
        html,
        text: `Dear ${params.user_name}, Your booking at Winterstone Lodge is confirmed. Room: ${params.room_name}, Check-in: ${params.check_in}, Check-out: ${params.check_out}, Total: ${params.total_price}`,
    });
}

// Password reset email template
export async function sendPasswordResetEmail(
    toEmail: string,
    toName: string,
    resetUrl: string
): Promise<boolean> {
    const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;font-family:Georgia,serif;background:#f5f5f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
            <tr><td align="center">
                <table width="600" style="max-width:600px;background:#fff;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background:#1c1917;padding:32px;text-align:center;">
                            <h1 style="margin:0;color:#fff;font-size:24px;letter-spacing:8px;font-weight:normal;">WINTERSTONE</h1>
                            <p style="margin:6px 0 0;color:#d4a853;font-size:9px;letter-spacing:3px;">The Silent Valley</p>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding:40px 32px;">
                            <p style="margin:0;color:#1c1917;font-size:18px;">Hello ${toName},</p>
                            <p style="margin:16px 0 24px;color:#57534e;font-size:14px;line-height:1.7;">
                                We received a request to reset your password. Click the button below to create a new password.
                            </p>
                            <a href="${resetUrl}" style="display:inline-block;background:#d4a853;color:#1c1917;padding:14px 32px;text-decoration:none;font-size:12px;letter-spacing:2px;font-weight:bold;">
                                RESET PASSWORD
                            </a>
                            <p style="margin:24px 0 0;color:#a8a29e;font-size:12px;">
                                This link expires in 1 hour.
                            </p>
                            <p style="margin:16px 0 0;color:#a8a29e;font-size:12px;">
                                If you didn't request this, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background:#1c1917;padding:24px;text-align:center;">
                            <p style="margin:0;color:#78716c;font-size:10px;">
                                Bhagsunag Road, Mcleodganj, HP 176216
                            </p>
                        </td>
                    </tr>
                </table>
            </td></tr>
        </table>
    </body>
    </html>
    `;

    return sendEmail({
        to: toEmail,
        subject: 'Reset Your Password - Winterstone Lodge',
        html,
        text: `Hello ${toName}, Reset your password by visiting: ${resetUrl} - This link expires in 1 hour.`,
    });
}
