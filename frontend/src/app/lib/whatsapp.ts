export interface OrderDetails {
    items: {
        name: string;
        quantity: number;
        price: number;
        width?: number;
        height?: number;
        areaM2?: number;
        boxes?: number;
        isPerM2?: boolean;
    }[];
    totalPrice: number;
    invoiceReference?: string;
    customerInfo?: {
        name?: string;
        phone?: string;
        address?: string;
    };
}

const DEFAULT_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';

function sanitizePhoneNumber(phone: string): string {
    if (!phone) return '';
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10 && (cleaned.startsWith('06') || cleaned.startsWith('07'))) {
        cleaned = '212' + cleaned.substring(1);
    }
    if (cleaned.startsWith('00')) {
        cleaned = cleaned.substring(2);
    }
    return cleaned;
}

function formatPrice(amount: number): string {
    return amount.toFixed(2).replace('.', ',') + ' MAD';
}

export function generateWhatsAppLink(order: OrderDetails, customNumber?: string): string {
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

    const header = "*NOUVELLE COMMANDE - ZELIJ MAROC*\n\n";

    const refSection = order.invoiceReference
        ? `*Code commande*: ${order.invoiceReference}\n*Suivi*: ${frontendUrl}/track-order?ref=${order.invoiceReference}\n\n`
        : '';

    const itemsList = order.items
        .map(item => {
            const itemTotal = Number(item.price);
            let details = `*${item.name}*\n`;
            if (item.width && item.height) {
                details += `  ${item.width}m × ${item.height}m\n`;
                details += `  ${formatPrice(itemTotal)}\n`;
            } else {
                details += `  ${item.quantity} × ${Number(item.price).toFixed(2)} MAD\n`;
                details += `  ${formatPrice(itemTotal)}`;
            }
            return details;
        })
        .join("\n\n");

    const separator = "\n" + "─".repeat(30) + "\n";
    const footer = `${separator}*TOTAL: ${formatPrice(order.totalPrice)}*`;

    let customerSection = "";
    if (order.customerInfo && (order.customerInfo.name || order.customerInfo.phone || order.customerInfo.address)) {
        customerSection = "\n\nINFOS CLIENT:\n";
        if (order.customerInfo.name) customerSection += `  Nom: ${order.customerInfo.name}\n`;
        if (order.customerInfo.phone) customerSection += `  Tel: ${order.customerInfo.phone}\n`;
        if (order.customerInfo.address) customerSection += `  Adresse: ${order.customerInfo.address}\n`;
    }

    const fullMessage = `${header}${refSection}${itemsList}${footer}${customerSection}\n\nCommande generée via Zelij Maroc`;

    const encodedMessage = encodeURIComponent(fullMessage);
    const finalNumber = sanitizePhoneNumber(customNumber || DEFAULT_WHATSAPP_NUMBER);

    return `https://wa.me/${finalNumber}?text=${encodedMessage}`;
}
