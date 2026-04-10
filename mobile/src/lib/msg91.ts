/**
 * MSG91 Standard OTP API — React Native / Expo
 *
 * (TEST MODE: OTP SYSTEM BYPASSED)
 * Use 123456 for all accounts.
 */

// const AUTH_KEY = process.env.EXPO_PUBLIC_MSG91_AUTH_KEY!;
// const TEMPLATE_ID = process.env.EXPO_PUBLIC_MSG91_TEMPLATE_ID!;
// const OTP_API = 'https://control.msg91.com/api/v5/otp';

/** Sends a 6-digit OTP to the given 10-digit mobile number.
 *  (Bypassed for testing) */
export async function sendOtp(mobile: string): Promise<void> {
    console.log('[MSG91] TEST MODE: Bypassing sendOtp for ' + mobile);
    return;
}

/** Verifies the OTP the user entered.
 *  (Bypassed for testing — accept 123456) */
export async function verifyOtp(mobile: string, otp: string): Promise<boolean> {
    console.log('[MSG91] TEST MODE: Verifying OTP for ' + mobile);
    return otp === '123456';
}

/** Resends the OTP via text or voice call.
 *  (Bypassed for testing) */
export async function retryOtp(mobile: string, retryType: 'text' | 'voice' = 'text'): Promise<void> {
    console.log('[MSG91] TEST MODE: Bypassing retryOtp for ' + mobile);
    return;
}
