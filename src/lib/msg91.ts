/**
 * MSG91 OTP Widget Integration — Web
 * 
 * (TEST MODE: OTP SYSTEM BYPASSED)
 * Use 123456 for all accounts.
 */

/*
const AUTH_KEY = import.meta.env.VITE_MSG91_AUTH_KEY as string;
const WIDGET_ID = import.meta.env.VITE_MSG91_WIDGET_ID as string;
const TOKEN_AUTH = import.meta.env.VITE_MSG91_TOKEN_AUTH as string;
*/

/**
 * Initialises and opens the MSG91 OTP widget for the given mobile number.
 * (TEST MODE: Automatically triggers success)
 */
export function initMsg91Widget(
    mobile: string,
    onSuccess: (data: { message: string; access_token: string }) => void,
    _onFailure: (error: unknown) => void
) {
    console.log('[MSG91] TEST MODE: Bypassing widget init for ' + mobile);
    
    // Ask for the test OTP in a prompt for simplicity in test mode
    const otp = window.prompt("TEST MODE: Enter OTP (use 123456)");
    
    if (otp === "123456") {
        onSuccess({ message: "Success", access_token: "test-token" });
    } else {
        alert("Invalid Test OTP");
    }
}

/**
 * Verifies the JWT access-token.
 * (TEST MODE: Always returns true)
 */
export async function verifyMsg91Token(_accessToken: string): Promise<boolean> {
    return true;
}
