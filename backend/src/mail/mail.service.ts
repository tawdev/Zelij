import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Order } from '../orders/order.entity';

@Injectable()
export class MailService implements OnModuleInit {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(MailService.name);

    constructor(private configService: ConfigService) {
        this.initializeTransporter();
    }

    async onModuleInit() {
        await this.verifyConnection();
    }

    private initializeTransporter() {
        const host = this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com';
        const port = this.configService.get<number>('SMTP_PORT') || 587;
        const user = this.configService.get<string>('SMTP_USER');
        const pass = this.configService.get<string>('SMTP_PASS');

        if (!user || !pass) {
            this.logger.error('❌ CRITICAL: SMTP_USER or SMTP_PASS missing in environment variables. Email services are disabled.');
            return;
        }

        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465, // Use SSL for port 465, TLS/STARTTLS for 587
            auth: {
                user,
                pass,
            },
            tls: {
                rejectUnauthorized: false // Often needed for local dev/different environments
            }
        });
    }

    private async verifyConnection() {
        if (!this.transporter) return;

        try {
            await this.transporter.verify();
            this.logger.log('✅ Connection SMTP vérifiée avec succès ! Prêt à envoyer des devis.');
        } catch (error) {
            this.logger.error('❌ Échec de la connexion SMTP. Vérifiez votre App Password ou port Gmail.', error.message);
        }
    }

    async sendInvoice(order: Order) {
        if (!order.email || !this.transporter) return;

        const htmlContent = this.getEmailTemplate(order, {
            title: 'Devis de Commande',
            subtitle: order.invoiceReference || 'DEV-' + order.id,
            description: `Bonjour <strong>${order.customerName}</strong>,<br><br>Nous avons le plaisir de vous confirmer la réception et la validation de votre commande chez <strong>Mol Trottinette</strong>.`,
            showInvoiceButton: true
        });

        try {
            const senderEmail = this.configService.get<string>('SMTP_USER');
            await this.transporter.sendMail({
                from: `"Mol Trottinette" <${senderEmail}>`,
                to: order.email,
                subject: `Devis de votre commande #${order.id}`,
                html: htmlContent,
            });
            this.logger.log(`✅ Email de devis envoyé avec succès à ${order.email}`);
        } catch (error) {
            this.logger.error(`❌ Erreur lors de l'envoi de l'email pour la commande ${order.id}:`, error.message);
        }
    }

    /**
     * Broadcasts a new content notification (Article or Tip) to all newsletter subscribers.
     * @param recipients Array of decrypted subscriber emails
     * @param content Data about the new article or tip
     */
    async sendNewsletterNotification(recipients: string[], content: { title: string; excerpt: string; type: 'ARTICLE' | 'TIP'; slug?: string }) {
        if (!recipients.length || !this.transporter) return;

        const senderEmail = this.configService.get<string>('SMTP_USER');
        const baseUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        const link = content.type === 'ARTICLE'
            ? `${baseUrl}/blog/post/${content.slug}`
            : `${baseUrl}/blog`; // Tips show on the listing page

        const subject = content.type === 'ARTICLE'
            ? `🆕 Nouvel Article : ${content.title}`
            : `💡 Astuce du Moment : ${content.title}`;

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #2d3748; margin: 0; padding: 0; background-color: #f7fafc; }
                    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
                    .header { background: #0D0D0D; padding: 50px 20px; text-align: center; color: #ffffff; }
                    .content { padding: 40px; text-align: center; }
                    .footer { background: #f7fafc; padding: 25px; text-align: center; font-size: 12px; color: #a0aec0; border-top: 1px solid #edf2f7; }
                    .badge { display: inline-block; padding: 4px 12px; background: #BF1737; color: #ffffff; border-radius: 20px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px; }
                    h2 { margin: 0; font-size: 28px; font-weight: 900; color: #1a202c; line-height: 1.2; text-transform: uppercase; font-style: italic; }
                    .excerpt { margin: 24px 0 32px; color: #718096; font-size: 16px; line-height: 1.6; }
                    .button { display: inline-block; padding: 18px 40px; background: #BF1737; color: #ffffff; text-decoration: none; border-radius: 14px; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 10px 15px -3px rgba(191, 23, 55, 0.3); }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="badge">${content.type === 'ARTICLE' ? 'NOUVEAUTÉ BLOG' : 'ASTUCE D\'EXPERT'}</div>
                        <h2>${content.title}</h2>
                    </div>
                    <div class="content">
                        <p class="excerpt">${content.excerpt}</p>
                        <a href="${link}" class="button">${content.type === 'ARTICLE' ? 'Lire l\'article Complet' : 'Découvrir l\'Astuce'}</a>
                    </div>
                    <div class="footer">
                        <p>Vous recevez cet email car vous êtes abonné à la Newsletter Pro de <strong>Mol Trottinette</strong>.</p>
                        <p>© ${new Date().getFullYear()} Mol Trottinette - Marrakech</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Send in batches to avoid SMTP limits/blocks
        const batchSize = 10;
        for (let i = 0; i < recipients.length; i += batchSize) {
            const batch = recipients.slice(i, i + batchSize);

            try {
                await Promise.all(batch.map(email =>
                    this.transporter.sendMail({
                        from: `"Mol Trottinette" <${senderEmail}>`,
                        to: email,
                        subject: subject,
                        html: htmlContent,
                    })
                ));
                this.logger.log(`📢 Newsletter broadcast: Sent batch ${Math.floor(i / batchSize) + 1} (${batch.length} recipients)`);
            } catch (error) {
                this.logger.error(`❌ Newsletter broadcast failed for a batch near index ${i}:`, error.message);
            }

            // Small delay between batches if needed
            if (i + batchSize < recipients.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }

    /**
     * Sends a premium notification to the administrator with the order PDF attached.
     */
    async sendAdminOrderNotification(order: Order, pdfBuffer: Buffer) {
        if (!this.transporter) {
            this.logger.error('Mailing system not initialized. Could not send admin notification.');
            return;
        }

        const adminEmail = this.configService.get<string>('SMTP_ADMIN_EMAIL') || 'simoibaali2004@gmail.com';
        const senderEmail = this.configService.get<string>('SMTP_USER');

        const htmlContent = this.getEmailTemplate(order, {
            title: '🚨 Nouvelle Commande',
            subtitle: 'Action Requise',
            description: `Une nouvelle commande a été passée par <strong>${order.customerName}</strong>.<br>Un rapport PDF a été joint pour votre gestion administrative.`,
            color: '#99cc00',
            iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 17c-.77 1.333.192 3 1.732 3z'
        });

        try {
            await this.transporter.sendMail({
                from: `"Système MOL" <${senderEmail}>`,
                to: adminEmail,
                subject: `🔔 NOUVELLE COMMANDE : ${order.customerName} - ${order.invoiceReference || order.id}`,
                html: htmlContent,
                attachments: [
                    {
                        filename: `COMMANDE_${order.invoiceReference || order.id}.pdf`,
                        content: pdfBuffer,
                    }
                ]
            });
            this.logger.log(`✅ Notification Admin envoyée pour la commande ${order.id}`);
        } catch (error) {
            this.logger.error(`❌ Échec de la notification Admin pour la commande ${order.id}:`, error.message);
        }
    }

    /**
     * Sends a welcome email to new newsletter subscribers.
     */
    async sendWelcomeEmail(email: string) {
        if (!this.transporter) return;

        const senderEmail = this.configService.get<string>('SMTP_USER');
        const baseUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Inter', Helvetica, Arial, sans-serif; line-height: 1.6; color: #2d3748; margin: 0; padding: 0; background-color: #f7fafc; }
                    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
                    .header { background: #111111; padding: 60px 20px; text-align: center; color: #ffffff; }
                    .content { padding: 48px; text-align: center; }
                    .footer { background: #f7fafc; padding: 32px; text-align: center; font-size: 12px; color: #a0aec0; border-top: 1px solid #edf2f7; }
                    h2 { margin: 0; font-size: 28px; font-weight: 900; color: #1a202c; line-height: 1.2; text-transform: uppercase; }
                    .welcome-text { margin: 24px 0 40px; color: #718096; font-size: 16px; line-height: 1.6; }
                    .button { display: inline-block; padding: 20px 48px; background: #99cc00; color: #000000; text-decoration: none; border-radius: 16px; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div style="margin-bottom: 24px;">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#99cc00" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                            </svg>
                        </div>
                        <h2>Bienvenue !</h2>
                    </div>
                    <div class="content">
                        <p class="welcome-text">Merci de vous être abonné à la Newsletter de <strong>Mol Trottinette</strong>. Vous recevrez désormais nos meilleures astuces et articles en avant-première.</p>
                        <a href="${baseUrl}/blog" class="button">Découvrir le Blog</a>
                    </div>
                    <div class="footer">
                        <p>Vous recevez cet email car vous venez de vous abonner à notre Newsletter.</p>
                        <p>© ${new Date().getFullYear()} Mol Trottinette - Marrakech</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        try {
            await this.transporter.sendMail({
                from: `"Mol Trottinette" <${senderEmail}>`,
                to: email,
                subject: '🚀 Bienvenue dans notre Newsletter !',
                html: htmlContent,
            });
            this.logger.log(`✅ Welcome email sent to ${email}`);
        } catch (error) {
            this.logger.error(`❌ Failed to send welcome email to ${email}:`, error.message);
        }
    }

    /**
     * Sends an automated update to the client when their order status changes.
     */
    async sendOrderStatusUpdate(order: Order) {
        if (!order.email || !this.transporter) return;

        let subject = '';
        let statusTitle = '';
        let statusColor = '#99cc00'; // Brand Lime Green
        let message = '';
        let iconPath = ''; // SVG path

        const status = order.status as string;

        if (status === 'confirmed') {
            return this.sendInvoice(order);
        } else if (status === 'processing') {
            subject = `Commande #${order.id} : Préparation en cours`;
            statusTitle = 'Préparation en cours';
            message = 'Bonne nouvelle ! Votre commande est maintenant en cours de préparation par notre équipe. Nous faisons tout notre possible pour vous l\'expédier rapidement.';
            iconPath = 'M13 10V3L4 14h7v7l9-11h-7z'; // Bolt icon
        } else if (status === 'completed') {
            subject = `Commande #${order.id} : Livrée`;
            statusTitle = 'Commande Livrée';
            statusColor = '#10B981'; // Success Green
            message = 'Votre commande a été marquée comme livrée. Nous espérons que vos nouveaux articles vous plairont ! Merci de votre confiance.';
            iconPath = 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'; // Check icon
        } else if (status === 'cancelled') {
            subject = `Commande #${order.id} : Annulée`;
            statusTitle = 'Commande Annulée';
            statusColor = '#4B5563'; // Gray
            message = 'Nous vous informons que votre commande a été annulée. Si vous n\'êtes pas à l\'origine de cette demande ou si vous avez des questions, n\'hésitez pas à nous contacter.';
            iconPath = 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'; // Cross icon
        } else {
            return;
        }

        const htmlContent = this.getEmailTemplate(order, {
            title: 'Mise à jour de votre commande',
            subtitle: statusTitle,
            description: message,
            color: statusColor,
            iconPath: iconPath
        });

        try {
            const senderEmail = this.configService.get<string>('SMTP_USER');
            await this.transporter.sendMail({
                from: `"Mol Trottinette" <${senderEmail}>`,
                to: order.email,
                subject: subject,
                html: htmlContent,
            });
            this.logger.log(`✅ Email de mise à jour (${status}) envoyé à ${order.email}`);
        } catch (error) {
            this.logger.error(`❌ Échec de l'envoi de l'email (${status}) pour la commande ${order.id}:`, error.message);
        }
    }

    /**
     * Generates a premium HTML email template with consistent branding.
     */
    private getEmailTemplate(order: Order, options: { 
        title: string; 
        subtitle: string; 
        description: string; 
        color?: string; 
        iconPath?: string;
        showInvoiceButton?: boolean;
    }) {
        const primaryColor = options.color || '#99cc00';
        const orderDate = new Date(order.createdAt).toLocaleDateString('fr-FR', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        const itemsHtml = (order.items as any[]).map(item => `
            <tr>
                <td style="padding: 12px 8px; border-bottom: 1px solid #edf2f7; width: 60%;">
                    <div style="font-weight: 700; color: #1a202c; font-size: 13px; line-height: 1.4;">${item.name}</div>
                    <div style="font-size: 11px; color: #718096; margin-top: 4px;">
                        ${item.quantity} x ${Number(item.price).toFixed(2)} MAD
                    </div>
                </td>
                <td style="padding: 12px 8px; border-bottom: 1px solid #edf2f7; text-align: center; color: #4a5568; font-weight: 600; font-size: 12px; width: 15%;">
                    ${item.quantity}
                </td>
                <td style="padding: 12px 8px; border-bottom: 1px solid #edf2f7; text-align: right; color: #1a202c; font-weight: 800; font-size: 13px; width: 25%;">
                    ${(Number(item.price) * item.quantity).toFixed(2)} MAD
                </td>
            </tr>
        `).join('');

        const iconSvg = options.iconPath ? `
            <div style="margin-bottom: 24px;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${primaryColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="${options.iconPath}"></path>
                </svg>
            </div>
        ` : '';

        const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #2d3748; margin: 0; padding: 0; background-color: #f8fafc; }
                    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
                    .header { background: #111111; padding: 40px 20px; text-align: center; color: #ffffff; }
                    .content { padding: 32px 20px; }
                    .footer { background: #f8fafc; padding: 24px; text-align: center; font-size: 12px; color: #a0aec0; border-top: 1px solid #edf2f7; }
                    .status-badge { display: inline-block; padding: 6px 14px; background: ${primaryColor}; color: #000000; border-radius: 10px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px; }
                    .table { width: 100%; border-collapse: collapse; margin-top: 24px; border: 1px solid #edf2f7; border-radius: 12px; }
                    .table th { background: #f8fafc; padding: 10px 8px; text-align: left; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #718096; letter-spacing: 0.05em; border-bottom: 1px solid #edf2f7; }
                    .total-section { margin-top: 24px; padding: 20px; background: #111111; border-radius: 16px; color: #ffffff; }
                    .btn { display: inline-block; padding: 16px 32px; background: ${primaryColor}; color: #000000; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        ${iconSvg}
                        <div class="status-badge">${options.subtitle}</div>
                        <h1 style="margin: 0; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.01em;">${options.title}</h1>
                    </div>
                    <div class="content">
                        <p style="font-size: 14px; color: #4a5568; margin: 0 0 32px;">${options.description}</p>
                        
                        <div style="padding: 20px; background: #f8fafc; border-radius: 16px; border: 1px solid #edf2f7; margin-bottom: 32px;">
                            <h3 style="margin: 0 0 12px; font-size: 11px; text-transform: uppercase; color: ${primaryColor}; font-weight: 900; letter-spacing: 0.1em;">Détails de Livraison</h3>
                            <div style="font-size: 13px; color: #1a202c; font-weight: 600;">${order.customerName}</div>
                            <div style="font-size: 13px; color: #718096; margin-top: 2px;">${order.address || 'N/A'}</div>
                            <div style="font-size: 13px; color: #718096; margin-top: 2px;">${order.phone || 'N/A'}</div>
                        </div>

                        <h3 style="margin: 0; font-size: 13px; text-transform: uppercase; color: #1a202c; font-weight: 900; letter-spacing: 0.05em;">Récapitulatif</h3>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th style="width: 60%;">Article</th>
                                    <th style="width: 15%; text-align: center;">Qté</th>
                                    <th style="width: 25%; text-align: right;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>

                        <div class="total-section">
                            <table style="width: 100%;">
                                <tr>
                                    <td style="font-size: 12px; font-weight: 700; opacity: 0.7; text-transform: uppercase;">Total TTC</td>
                                    <td style="text-align: right; font-size: 20px; font-weight: 900;">${Number(order.totalPrice).toFixed(2)} MAD</td>
                                </tr>
                            </table>
                        </div>

                        <div style="margin-top: 40px; text-align: center;">
                            <a href="${frontendUrl}/track-order?ref=${order.invoiceReference || order.id}" class="btn">Suivre ma commande</a>
                        </div>
                    </div>
                    <div class="footer">
                        <p>Merci pour votre confiance chez <strong>Mol Trottinette</strong>.</p>
                        <p>© ${new Date().getFullYear()} Mol Trottinette - Marrakech</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }
}
