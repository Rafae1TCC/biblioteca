import nodemailer from "nodemailer"

// Configuración del transporte de correo
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST || "smtp.gmail.com",
  port: Number.parseInt(process.env.EMAIL_SERVER_PORT || "587"),
  secure: process.env.EMAIL_SERVER_SECURE === "true",
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

/**
 * Envía un correo de verificación al usuario
 */
export async function sendVerificationEmail(email: string, nombre: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verificar-email?token=${token}`

  const mailOptions = {
    from: `"BibliotecaHub" <${process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER}>`,
    to: email,
    subject: "Verifica tu correo electrónico - BibliotecaHub",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h1 style="color: #333; text-align: center;">BibliotecaHub</h1>
        <p>Hola ${nombre},</p>
        <p>Gracias por registrarte en BibliotecaHub. Para completar tu registro, por favor verifica tu correo electrónico haciendo clic en el siguiente enlace:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verificar mi correo electrónico</a>
        </div>
        <p>O copia y pega el siguiente enlace en tu navegador:</p>
        <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 5px;">${verificationUrl}</p>
        <p>Este enlace expirará en 24 horas.</p>
        <p>Si no has solicitado este correo, puedes ignorarlo.</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="color: #666; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} BibliotecaHub. Todos los derechos reservados.</p>
      </div>
    `,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log("Correo de verificación enviado:", info.messageId)
    return true
  } catch (error) {
    console.error("Error al enviar correo de verificación:", error)
    throw error
  }
}

/**
 * Envía un correo de restablecimiento de contraseña al usuario
 */
export async function sendPasswordResetEmail(email: string, nombre: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/restablecer-contrasena?token=${token}`

  const mailOptions = {
    from: `"BibliotecaHub" <${process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER}>`,
    to: email,
    subject: "Restablece tu contraseña - BibliotecaHub",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h1 style="color: #333; text-align: center;">BibliotecaHub</h1>
        <p>Hola ${nombre},</p>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Restablecer mi contraseña</a>
        </div>
        <p>O copia y pega el siguiente enlace en tu navegador:</p>
        <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 5px;">${resetUrl}</p>
        <p>Este enlace expirará en 1 hora.</p>
        <p>Si no has solicitado este correo, puedes ignorarlo. Tu contraseña no se modificará.</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="color: #666; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} BibliotecaHub. Todos los derechos reservados.</p>
      </div>
    `,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log("Correo de restablecimiento enviado:", info.messageId)
    return true
  } catch (error) {
    console.error("Error al enviar correo de restablecimiento:", error)
    throw error
  }
}
