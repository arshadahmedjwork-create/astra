/**
 * MSG91 OTP & SMS API Integration — Mobile (Via Supabase Edge Function Proxy)
 */
import { supabase } from './supabase';

/** 
 * Sends a 6-digit OTP to the given 10-digit mobile number.
 */
export async function sendOtp(mobile: string): Promise<void> {
    try {
        const { data, error } = await supabase.functions.invoke('msg91', {
            body: { type: 'sendOtp', mobile }
        });
        if (error || data.type === 'error') throw new Error(error?.message || data.message);
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
    try {
        const { data, error } = await supabase.functions.invoke('msg91', {
            body: { type: 'verifyOtp', mobile, otp }
        });
        if (error) throw error;
        return data.type === 'success';
    } catch (error) {
        console.error('[MSG91] Error verifying OTP:', error);
        return false;
    }
}

/** 
 * Resends the OTP (Handled via proxy)
 */
export async function retryOtp(mobile: string, _retryType: 'text' | 'voice' = 'text'): Promise<void> {
    // For now, re-sending OTP is functionally equivalent to sendOtp in our proxy
    return sendOtp(mobile);
}

/**
 * Sends a registration confirmation SMS.
 */
export async function sendRegistrationSms(mobile: string, customerId: string): Promise<void> {
    try {
        const { data, error } = await supabase.functions.invoke('msg91', {
            body: { type: 'registration', mobile, customerId }
        });
        if (error) throw error;
        console.log('[MSG91] Registration SMS result:', data);
    } catch (error) {
        console.error('[MSG91] Error sending Registration SMS:', error);
    }
}

/**
 * Sends a delivery confirmation SMS.
 */
export async function sendDeliverySms(
    mobile: string, 
    cid: string, 
    subscription: string, 
    balance: string | number, 
    date: string
): Promise<void> {
    try {
        const { data, error } = await supabase.functions.invoke('msg91', {
            body: { type: 'delivery', mobile, cid, subscription, balance, date }
        });
        if (error) throw error;
        console.log('[MSG91] Delivery SMS result:', data);
    } catch (error) {
        console.error('[MSG91] Error sending Delivery SMS:', error);
    }
}
