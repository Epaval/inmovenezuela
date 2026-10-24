import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: string,
  verificationCode: string,
  agentName: string,
  tempPassword?: string // ✅ Parámetro opcional para contraseña temporal
): Promise<void> {
  try {
    await resend.emails.send({
      from: 'InmoVenezuela <onboarding@resend.dev>',
      to: email,
      subject: ' Verifica tu cuenta en InmoVenezuela',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🏠 InmoVenezuela</h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Bienvenido a la plataforma inmobiliaria #1 de Venezuela</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="color: #1f2937; margin-top: 0;">Hola ${agentName},</h2>
            
            <p style="color: #4b5563; line-height: 1.6;">
              Tu cuenta ha sido creada exitosamente. Para activarla y comenzar a publicar propiedades, 
              necesitas verificar tu correo electrónico.
            </p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
              <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">Tu código de verificación es:</p>
              <div style="font-size: 36px; font-weight: bold; color: #1e3a8a; letter-spacing: 4px; font-family: monospace;">
                ${verificationCode}
              </div>
            </div>

            ${tempPassword ? `
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #92400e; margin: 0 0 10px 0; font-size: 14px; font-weight: bold;">
                🔑 Tu contraseña temporal es:
              </p>
              <div style="font-size: 24px; font-weight: bold; color: #92400e; font-family: monospace; background: white; padding: 10px; border-radius: 4px; display: inline-block;">
                ${tempPassword}
              </div>
              <p style="color: #92400e; margin: 10px 0 0 0; font-size: 12px;">
                <strong>Importante:</strong> Al primer inicio de sesión deberás cambiar esta contraseña.
              </p>
            </div>
            ` : ''}

            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/verify-email?email=${encodeURIComponent(email)}" 
                 style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                🚀 Activar mi Cuenta Ahora
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 20px;">
              O copia y pega este enlace en tu navegador:<br>
              <a href="http://localhost:3000/verify-email?email=${encodeURIComponent(email)}" style="color: #2563eb; word-break: break-all;">
                http://localhost:3000/verify-email?email=${encodeURIComponent(email)}
              </a>
            </p>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                 <strong>Importante:</strong> Este código expira en <strong>24 horas</strong>.
              </p>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6; margin-top: 30px;">
              Saludos cordiales,<br>
              <strong style="color: #1e3a8a;">El equipo de InmoVenezuela</strong>
            </p>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
              © 2026 InmoVenezuela. Todos los derechos reservados.
            </p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error al enviar correo:', error);
    throw error;
  }
}