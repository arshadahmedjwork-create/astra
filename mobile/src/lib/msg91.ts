/**
 * MSG91 OTP & SMS API Integration — React Native / Expo
 */

const AUTH_KEY = process.env.EXPO_PUBLIC_MSG91_AUTH_KEY;

// Template IDs
export const TEMPLATES = {
    OTP: '60dd634f76297c6d9859b4e2',
    REGISTRATION: '60defad58575d253c8315b35',
    DELIVERY: '608a3efc3d5a91579c4e001d',
};

/** 
 * Sends a 6-digit OTP to the given 10-digit mobile number.
 */
export async function sendOtp(mobile: string): Promise<void> {
    const url = `https://control.msg91.com/api/v5/otp?template_id=${TEMPLATES.OTP}&mobile=91${mobile}&authkey=${AUTH_KEY}`;
    
    try {
        const response = await fetch(url, { method: 'POST' });
        const data = await response.json();
        if (data.type === 'error') throw new Error(data.message);
        console.log('[MSG91] OTP sent successfully');
    } catch (error) {
        console.error('[MSG91] Error sending OTP:', error);
        throw error;
    }
}

/** 
 * Verifies the OTP the user entered.
 */
export async function verifyOtp(mobile: string, otp: string): Promise<boolean> {
    const url = `https://control.msg91.com/api/v5/otp/verify?otp=${otp}&mobile=91${mobile}&authkey=${AUTH_KEY}`;
    
    try {
        const response = await fetch(url, { method: 'GET' });
        const data = await response.json();
        return data.type === 'success';
    } catch (error) {
        console.error('[MSG91] Error verifying OTP:', error);
        return false;
    }
}

/** 
 * Resends the OTP via text or voice call.
 */
export async function retryOtp(mobile: string, retryType: 'text' | 'voice' = 'text'): Promise<void> {
    const method = retryType === 'voice' ? 'voice' : 'text';
    const url = `https://control.msg91.com/api/v5/otp/retry?authkey=${AUTH_KEY}&mobile=91${mobile}&retrytype=${method}`;
    
    try {
        const response = await fetch(url, { method: 'GET' });
        const data = await response.json();
        if (data.type === 'error') throw new Error(data.message);
    } catch (error) {
        console.error('[MSG91] Error retrying OTP:', error);
        throw error;
    }
}

/**
 * Sends a registration confirmation SMS.
 * Template: Thank You for Registration with Astra Dairy. Your Customer Id: ##var##
 */
export async function sendRegistrationSms(mobile: string, customerId: string): Promise<void> {
    const url = 'https://control.msg91.com/api/v5/flow/';
    const payload = {
        template_id: TEMPLATES.REGISTRATION,
        short_url: '1',
        recipients: [
            {
                mobiles: `91${mobile}`,
                var: customerId
            }
        ]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'authkey': AUTH_KEY!,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        console.log('[MSG91] Registration SMS result:', data);
    } catch (error) {
        console.error('[MSG91] Error sending Registration SMS:', error);
    }
}

/**
 * Sends a delivery confirmation SMS.
 * Template: Dear PATRON, CID NO: ##var1## Your Milk Subscription ##var2## has been delivered. Your balance count: ##var3## Date: ##var4## Thanks, Astra Dairy Farms Pvt Ltd
 */
export async function sendDeliverySms(
    mobile: string, 
    cid: string, 
    subscription: string, 
    balance: string | number, 
    date: string
): Promise<void> {
    const url = 'https://control.msg91.com/api/v5/flow/';
    const payload = {
        template_id: TEMPLATES.DELIVERY,
        short_url: '1',
        recipients: [
            {
                mobiles: `91${mobile}`,
                var1: cid,
                var2: subscription,
                var3: balance.toString(),
                var4: date
            }
        ]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'authkey': AUTH_KEY!,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        console.log('[MSG91] Delivery SMS result:', data);
    } catch (error) {
        console.error('[MSG91] Error sending Delivery SMS:', error);
    }
}
