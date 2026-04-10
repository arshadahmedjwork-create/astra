import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Image,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { sendOtp, verifyOtp, retryOtp } from '../lib/msg91';
import { useAuthStore } from '../stores/authStore';

export default function LoginScreen() {
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const { setAuth } = useAuthStore();

    const startResendTimer = () => {
        setResendTimer(30);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleSendOTP = async () => {
        if (!/^[0-9]{10}$/.test(mobile)) {
            Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number');
            return;
        }

        setLoading(true);
        try {
            await sendOtp(mobile);
            setStep('otp');
            startResendTimer();
            Alert.alert('OTP Sent', `A 6-digit OTP has been sent to +91 ${mobile}`);
        } catch (error: any) {
            console.error('[LoginScreen] sendOtp error:', error);
            Alert.alert('Failed to Send OTP', error.message || 'Please check your internet connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (resendTimer > 0) return;
        setLoading(true);
        try {
            await retryOtp(mobile, 'text');
            startResendTimer();
            Alert.alert('OTP Resent', `A new OTP has been sent to +91 ${mobile}`);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to resend OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (otp.length !== 6) {
            Alert.alert('Invalid OTP', 'Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);
        try {
            const verified = await verifyOtp(mobile, otp);

            if (!verified) {
                Alert.alert('Invalid OTP', 'The OTP you entered is incorrect. Please try again.');
                setLoading(false);
                return;
            }

            // OTP verified — look up the customer or driver in Supabase
            const phoneWithPrefix = `+91${mobile}`;
            const phoneRaw = mobile;

            // TEST BYPASS for 8888888888
            if (mobile === '8888888888') {
                setAuth(
                    { user: { phone: phoneWithPrefix } },
                    {
                        id: 'test-customer-id',
                        customer_id: 'ASTRA-TEST-001',
                        mobile: phoneWithPrefix,
                        full_name: 'Test Customer (Bypass)',
                        wallet_balance: 1000,
                        address: {
                            id: 'test-addr',
                            door_no: '100',
                            street: 'Test Street',
                            landmark: 'Test Office',
                            area: 'Test Area',
                            city: 'Chennai',
                            state: 'TN',
                            pincode: '600001',
                            alt_mobile: mobile
                        }
                    },
                    null
                );
                return;
            }

            const [customerRes, driverRes] = await Promise.all([
                supabase
                    .from('customers')
                    .select('*, address:addresses(*)')
                    .or(`mobile.eq.${phoneWithPrefix},mobile.eq.${phoneRaw}`)
                    .single(),
                supabase
                    .from('drivers')
                    .select('*')
                    .or(`phone.eq.${phoneWithPrefix},phone.eq.${phoneRaw}`)
                    .single(),
            ]);

            if (customerRes.data || driverRes.data) {
                setAuth(
                    { user: { phone: phoneWithPrefix } },
                    customerRes.data || null,
                    driverRes.data || null
                );
            } else {
                Alert.alert(
                    'Access Denied',
                    `No account found for +91 ${mobile}. Please ensure you are registered.`
                );
            }
        } catch (error: any) {
            Alert.alert('Login Failed', error.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-[#1B4D3E] justify-center items-center px-6"
        >
            <View className="bg-white/95 w-full max-w-sm rounded-[32px] p-8 shadow-2xl">
                <View className="mb-6 items-center">
                    <Image
                        source={require('../../assets/logo.png')}
                        className="w-20 h-20 mb-2"
                        resizeMode="contain"
                    />
                    <Text className="text-3xl font-bold text-[#1B4D3E]">
                        Astra<Text className="text-[#D4AF37]">Dairy</Text>
                    </Text>
                    <Text className="text-gray-500 mt-1 font-medium italic">Customer &amp; Driver Portal</Text>
                </View>

                {step === 'phone' ? (
                    <View className="space-y-4">
                        <View>
                            <Text className="text-sm font-semibold text-gray-700 mb-2">Mobile Number</Text>
                            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                                <View className="px-3 py-4 border-r border-gray-200 bg-gray-100">
                                    <Text className="text-gray-600 font-medium">+91</Text>
                                </View>
                                <TextInput
                                    className="flex-1 h-14 px-4 text-lg"
                                    placeholder="Enter 10 digit number"
                                    keyboardType="number-pad"
                                    maxLength={10}
                                    value={mobile}
                                    onChangeText={setMobile}
                                />
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={handleSendOTP}
                            disabled={loading || mobile.length !== 10}
                            className={`w-full h-14 rounded-xl items-center justify-center mt-6 ${
                                loading || mobile.length !== 10 ? 'bg-[#1B4D3E]/50' : 'bg-[#1B4D3E]'
                            }`}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-lg">Send OTP</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="space-y-4">
                        <View className="items-center mb-2">
                            <Text className="text-sm text-gray-500">OTP sent to</Text>
                            <Text className="text-base font-bold text-[#1B4D3E]">+91 {mobile}</Text>
                        </View>

                        <View>
                            <Text className="text-sm font-semibold text-gray-700 mb-2">Enter OTP</Text>
                            <TextInput
                                className="w-full h-14 bg-gray-50 border border-gray-200 rounded-xl px-4 text-center text-2xl tracking-[12px]"
                                placeholder="------"
                                keyboardType="number-pad"
                                maxLength={6}
                                value={otp}
                                onChangeText={setOtp}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={handleVerifyOTP}
                            disabled={loading || otp.length !== 6}
                            className={`w-full h-14 rounded-xl items-center justify-center mt-4 ${
                                loading || otp.length !== 6 ? 'bg-[#1B4D3E]/50' : 'bg-[#1B4D3E]'
                            }`}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-lg">Verify &amp; Login</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleResendOTP}
                            disabled={loading || resendTimer > 0}
                            className="items-center mt-2 p-2"
                        >
                            <Text className={`font-medium ${resendTimer > 0 ? 'text-gray-400' : 'text-[#1B4D3E]'}`}>
                                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => { setStep('phone'); setOtp(''); }}
                            className="items-center mt-1 p-2"
                        >
                            <Text className="text-[#1B4D3E] font-medium">← Wrong number? Go back</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}
