const nodemailer = require('nodemailer');
const credentialsService = require('./credentialsService');

// Configuração do transporter (usa credentialsService ou fallback para .env)
const createTransporter = async () => {
    try {
        const credentials = await credentialsService.getCredentials('email');
        
        return nodemailer.createTransport({
            host: credentials.host,
            port: parseInt(credentials.port) || 587,
            secure: credentials.secure === 'true' || credentials.secure === true,
            auth: {
                user: credentials.user,
                pass: credentials.password
            }
        });
    } catch (error) {
        // Fallback para .env se credentialsService falhar
        console.warn('⚠️ Usando credenciais de email do .env (fallback)');
        return nodemailer.createTransporter({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
};

// Gerar código de verificação de 6 dígitos
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Enviar email de verificação
const sendVerificationEmail = async (email, name, code) => {
    try {
        const transporter = await createTransporter();
        const credentials = await credentialsService.getCredentials('email').catch(() => ({}));
        const fromName = credentials.from_name || process.env.EMAIL_FROM_NAME || 'Melanski Sport';
        const fromEmail = credentials.user || process.env.EMAIL_USER;

        const mailOptions = {
            from: `"${fromName}" <${fromEmail}>`,
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
        const transporter = await createTransporter();
        const credentials = await credentialsService.getCredentials('email').catch(() => ({}));
        const fromName = credentials.from_name || process.env.EMAIL_FROM_NAME || 'Melanski Sport';
        const fromEmail = credentials.user || process.env.EMAIL_USER;
        const urlCredentials = await credentialsService.getCredentials('urls').catch(() => ({}));
        const frontendUrl = urlCredentials.frontend_url || process.env.FRONTEND_URL || 'http://localhost:5173';

        const mailOptions = {
            from: `"${fromName}" <${fromEmail}>`,
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
                                <a href="${frontendUrl}" class="button">
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

// Enviar email para novo usuário administrativo
const sendUserCreatedEmail = async (email, name, role, password) => {
    try {
        const transporter = await createTransporter();
        const credentials = await credentialsService.getCredentials('email').catch(() => ({}));
        const fromName = credentials.from_name || process.env.EMAIL_FROM_NAME || 'Melanski Sport';
        const fromEmail = credentials.user || process.env.EMAIL_USER;
        const urlCredentials = await credentialsService.getCredentials('urls').catch(() => ({}));
        const frontendUrl = urlCredentials.frontend_url || process.env.FRONTEND_URL || 'http://localhost:5173';

        const roleNames = {
            developer: 'Desenvolvedor',
            administrator: 'Administrador',
            operator: 'Operador'
        };

        const mailOptions = {
            from: `"${fromName}" <${fromEmail}>`,
            to: email,
            subject: 'Bem-vindo à Equipe Melanski Sport! 🎉',
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
                        .credentials {
                            background-color: #f0f0f0;
                            padding: 20px;
                            border-radius: 5px;
                            margin: 20px 0;
                            border-left: 4px solid #dc143c;
                        }
                        .password {
                            font-size: 18px;
                            font-weight: bold;
                            color: #dc143c;
                            font-family: monospace;
                            letter-spacing: 1px;
                            margin: 10px 0;
                        }
                        .warning {
                            background-color: #fff3cd;
                            border: 1px solid #ffc107;
                            padding: 15px;
                            border-radius: 5px;
                            margin: 20px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 Bem-vindo à Equipe!</h1>
                        </div>
                        <div class="content">
                            <h2>Olá, ${name}!</h2>
                            <p>Você foi adicionado como <strong>${roleNames[role]}</strong> no sistema Melanski Sport.</p>
                            
                            <div class="credentials">
                                <h3>Suas Credenciais de Acesso:</h3>
                                <p><strong>Email:</strong> ${email}</p>
                                <p><strong>Senha Temporária:</strong></p>
                                <div class="password">${password}</div>
                            </div>

                            <div class="warning">
                                <strong>⚠️ IMPORTANTE:</strong>
                                <ul>
                                    <li>Esta é uma senha temporária</li>
                                    <li>Você será solicitado a alterá-la no primeiro login</li>
                                    <li>Não compartilhe esta senha com ninguém</li>
                                    <li>Guarde-a em local seguro até fazer o primeiro acesso</li>
                                </ul>
                            </div>

                            <p>Para acessar o painel administrativo:</p>
                            <ol>
                                <li>Acesse: <a href="${frontendUrl}">${frontendUrl}</a></li>
                                <li>Clique em "Minha Conta"</li>
                                <li>Faça login com suas credenciais</li>
                                <li>Altere sua senha no primeiro acesso</li>
                            </ol>
                            
                            <p>Atenciosamente,<br>Equipe Melanski Sport</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Email de criação de usuário enviado');
    } catch (error) {
        console.error('❌ Erro ao enviar email de criação:', error);
        throw error;
    }
};

// Enviar email quando role de cliente é alterado para administrativo
const sendUserRoleChangedEmail = async (email, name, newRole, password) => {
    try {
        const transporter = await createTransporter();
        const credentials = await credentialsService.getCredentials('email').catch(() => ({}));
        const fromName = credentials.from_name || process.env.EMAIL_FROM_NAME || 'Melanski Sport';
        const fromEmail = credentials.user || process.env.EMAIL_USER;
        const urlCredentials = await credentialsService.getCredentials('urls').catch(() => ({}));
        const frontendUrl = urlCredentials.frontend_url || process.env.FRONTEND_URL || 'http://localhost:5173';

        const roleNames = {
            developer: 'Desenvolvedor',
            administrator: 'Administrador',
            operator: 'Operador'
        };

        const mailOptions = {
            from: `"${fromName}" <${fromEmail}>`,
            to: email,
            subject: 'Sua Conta Foi Atualizada - Melanski Sport',
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
                        .credentials {
                            background-color: #f0f0f0;
                            padding: 20px;
                            border-radius: 5px;
                            margin: 20px 0;
                            border-left: 4px solid #dc143c;
                        }
                        .password {
                            font-size: 18px;
                            font-weight: bold;
                            color: #dc143c;
                            font-family: monospace;
                            letter-spacing: 1px;
                            margin: 10px 0;
                        }
                        .warning {
                            background-color: #fff3cd;
                            border: 1px solid #ffc107;
                            padding: 15px;
                            border-radius: 5px;
                            margin: 20px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 Sua Conta Foi Atualizada!</h1>
                        </div>
                        <div class="content">
                            <h2>Olá, ${name}!</h2>
                            <p>Sua conta de cliente foi atualizada para <strong>${roleNames[newRole]}</strong> no sistema Melanski Sport.</p>
                            <p>Agora você tem acesso ao painel administrativo!</p>
                            
                            <div class="credentials">
                                <h3>Suas Novas Credenciais:</h3>
                                <p><strong>Email:</strong> ${email}</p>
                                <p><strong>Nova Senha Temporária:</strong></p>
                                <div class="password">${password}</div>
                            </div>

                            <div class="warning">
                                <strong>⚠️ IMPORTANTE:</strong>
                                <ul>
                                    <li>Por segurança, sua senha anterior foi alterada</li>
                                    <li>Esta é uma senha temporária</li>
                                    <li>Você será solicitado a alterá-la no primeiro login</li>
                                    <li>Não compartilhe esta senha com ninguém</li>
                                </ul>
                            </div>

                            <p>Para acessar o painel administrativo:</p>
                            <ol>
                                <li>Acesse: <a href="${frontendUrl}">${frontendUrl}</a></li>
                                <li>Clique em "Minha Conta"</li>
                                <li>Faça login com suas novas credenciais</li>
                                <li>Altere sua senha no primeiro acesso</li>
                            </ol>
                            
                            <p>Atenciosamente,<br>Equipe Melanski Sport</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Email de mudança de role enviado');
    } catch (error) {
        console.error('❌ Erro ao enviar email de mudança:', error);
        throw error;
    }
};

module.exports = {
    generateVerificationCode,
    sendVerificationEmail,
    sendWelcomeEmail,
    sendUserCreatedEmail,
    sendUserRoleChangedEmail
};
