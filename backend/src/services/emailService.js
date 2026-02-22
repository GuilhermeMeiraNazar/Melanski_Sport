const nodemailer = require('nodemailer');

// Configuração do transporter (será configurado via .env)
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true', // true para 465, false para outras portas
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Gerar código de verificação de 6 dígitos
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Enviar email de verificação
const sendVerificationEmail = async (email, name, code) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || 'Melanski Sport'}" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verificação de Email - Melanski Sport',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            background-color: #f9f9f9;
                        }
                        .header {
                            background-color: #dc143c;
                            color: white;
                            padding: 20px;
                            text-align: center;
                            border-radius: 5px 5px 0 0;
                        }
                        .content {
                            background-color: white;
                            padding: 30px;
                            border-radius: 0 0 5px 5px;
                        }
                        .code {
                            font-size: 32px;
                            font-weight: bold;
                            color: #dc143c;
                            text-align: center;
                            padding: 20px;
                            background-color: #f0f0f0;
                            border-radius: 5px;
                            letter-spacing: 5px;
                            margin: 20px 0;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 20px;
                            color: #666;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Melanski Sport</h1>
                        </div>
                        <div class="content">
                            <h2>Olá, ${name}!</h2>
                            <p>Obrigado por se cadastrar na Melanski Sport!</p>
                            <p>Para completar seu cadastro, utilize o código de verificação abaixo:</p>
                            
                            <div class="code">${code}</div>
                            
                            <p><strong>Este código expira em 15 minutos.</strong></p>
                            
                            <p>Se você não solicitou este cadastro, ignore este email.</p>
                            
                            <p>Atenciosamente,<br>Equipe Melanski Sport</p>
                        </div>
                        <div class="footer">
                            <p>Este é um email automático, por favor não responda.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email enviado:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Erro ao enviar email:', error);
        throw error;
    }
};

// Enviar email de boas-vindas após verificação
const sendWelcomeEmail = async (email, name) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || 'Melanski Sport'}" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Bem-vindo à Melanski Sport! 🎉',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            background-color: #f9f9f9;
                        }
                        .header {
                            background-color: #dc143c;
                            color: white;
                            padding: 20px;
                            text-align: center;
                            border-radius: 5px 5px 0 0;
                        }
                        .content {
                            background-color: white;
                            padding: 30px;
                            border-radius: 0 0 5px 5px;
                        }
                        .button {
                            display: inline-block;
                            padding: 12px 30px;
                            background-color: #dc143c;
                            color: white;
                            text-decoration: none;
                            border-radius: 5px;
                            margin: 20px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 Bem-vindo!</h1>
                        </div>
                        <div class="content">
                            <h2>Olá, ${name}!</h2>
                            <p>Seu email foi verificado com sucesso!</p>
                            <p>Agora você tem acesso completo à nossa loja de artigos esportivos.</p>
                            <p>Explore nossos produtos e aproveite as melhores ofertas!</p>
                            
                            <div style="text-align: center;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="button">
                                    Começar a Comprar
                                </a>
                            </div>
                            
                            <p>Atenciosamente,<br>Equipe Melanski Sport</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Email de boas-vindas enviado');
    } catch (error) {
        console.error('❌ Erro ao enviar email de boas-vindas:', error);
        // Não lança erro pois é apenas informativo
    }
};

module.exports = {
    generateVerificationCode,
    sendVerificationEmail,
    sendWelcomeEmail
};
