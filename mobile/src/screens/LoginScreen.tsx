import React, { useState, useRef, useEffect } from 'react';
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
import { sendOtp, verifyOtp } from '../lib/msg91';
import { useAuthStore } from '../stores/authStore';

export default function LoginScreen({ navigation }: any) {
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const otpInputRef = useRef<TextInput>(null);

    const { setAuth } = useAuthStore();

    useEffect(() => {
        if (step === 'otp') {
            // Auto-focus OTP input when moving to OTP step
            setTimeout(() => otpInputRef.current?.focus(), 500);
        }
    }, [step]);

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
        } catch (error: any) {
            console.error('[LoginScreen] sendOtp error:', error);
            Alert.alert('Failed to Send OTP', error.message || 'Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (code = otp) => {
        if (code.length !== 6) return;

        setLoading(true);
        try {
            const verified = await verifyOtp(mobile, code);

            if (!verified) {
                Alert.alert('Invalid OTP', 'The code you entered is incorrect. Please try again.');
                setLoading(false);
                return;
            }

            const phoneWithPrefix = `+91${mobile}`;
            const phoneRaw = mobile;

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
                Alert.alert('Access Denied', `No account found for +91 ${mobile}.`);
            }
        } catch (error: any) {
            Alert.alert('Login Failed', error.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    const renderOTPSlots = () => {
        const slots = [];
        for (let i = 0; i < 6; i++) {
            const char = otp[i] || '';
            const isActive = otp.length === i;
            slots.push(
                <View 
                    key={i} 
                    className={`w-12 h-14 bg-gray-100 rounded-xl border-2 items-center justify-center
                        ${isActive ? 'border-[#D4AF37] bg-white' : 'border-transparent'}`}
                >
                    <Text className="text-2xl font-bold text-[#1B4D3E]">{char}</Text>
                </View>
            );
        }
        return slots;
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-[#1B4D3E] justify-center items-center px-6"
        >
            <View className="bg-white/95 w-full max-w-sm rounded-[40px] p-8 shadow-2xl">
                <View className="mb-8 items-center">
                    <Image
                        source={require('../../assets/logo.png')}
                        className="w-20 h-20 mb-3"
                        resizeMode="contain"
                    />
                    <Text className="text-4xl font-black text-[#1B4D3E] tracking-tighter">
                        Astra<Text className="text-[#D4AF37]">Dairy</Text>
                    </Text>
                    <Text className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">
                        {step === 'phone' ? 'Premium Pure Milk' : 'Secure Verification'}
                    </Text>
                </View>

                {step === 'phone' ? (
                    <View className="space-y-6">
                        <View>
                            <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Mobile Access</Text>
                            <View className="flex-row items-center bg-gray-100/80 rounded-2xl overflow-hidden border border-gray-100">
                                <View className="px-5 py-5 bg-gray-200/50">
                                    <Text className="text-gray-500 font-black">+91</Text>
                                </View>
                                <TextInput
                                    className="flex-1 h-16 px-5 text-xl font-bold text-[#1B4D3E]"
                                    placeholder="Mobile Number"
                                    keyboardType="number-pad"
                                    maxLength={10}
                                    value={mobile}
                                    placeholderTextColor="#9ca3af"
                                    onChangeText={setMobile}
                                />
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={handleSendOTP}
                            disabled={loading || mobile.length !== 10}
                            className={`w-full h-16 rounded-2xl items-center justify-center shadow-lg active:scale-95 transition-all ${
                                loading || mobile.length !== 10 ? 'bg-[#1B4D3E]/50' : 'bg-[#1B4D3E]'
                            }`}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <View className="flex-row items-center">
                                    <Text className="text-white font-black text-lg mr-2 uppercase tracking-widest">Get Secure OTP</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="space-y-6">
                        <View className="items-center mb-2">
                            <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Verify Code</Text>
                            <Text className="text-lg font-black text-[#1B4D3E]">+91 {mobile}</Text>
                        </View>

                        <TouchableOpacity 
                            activeOpacity={1}
                            onPress={() => otpInputRef.current?.focus()}
                            className="flex-row justify-between mb-4"
                        >
                            {renderOTPSlots()}
                        </TouchableOpacity>

                        <TextInput
                            ref={otpInputRef}
                            className="absolute -left-[9999px]"
                            keyboardType="number-pad"
                            maxLength={6}
                            value={otp}
                            onChangeText={(val) => {
                                setOtp(val);
                                if (val.length === 6) handleVerifyOTP(val);
                            }}
                        />

                        <TouchableOpacity
                            onPress={() => handleVerifyOTP()}
                            disabled={loading || otp.length !== 6}
                            className={`w-full h-16 rounded-2xl items-center justify-center shadow-lg active:scale-95 transition-all ${
                                loading || otp.length !== 6 ? 'bg-[#1B4D3E]/50' : 'bg-[#1B4D3E]'
                            }`}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-black text-lg uppercase tracking-widest">Verify & Access</Text>
                            )}
                        </TouchableOpacity>

                        <View className="flex-row justify-between items-center mt-2 px-1">
                            <TouchableOpacity
                                onPress={() => { setStep('phone'); setOtp(''); }}
                                className="py-2"
                            >
                                <Text className="text-gray-400 font-bold text-xs">← CHANGE</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleSendOTP}
                                disabled={loading || resendTimer > 0}
                                className="py-2"
                            >
                                <Text className={`font-bold text-xs underline ${resendTimer > 0 ? 'text-gray-300' : 'text-[#D4AF37]'}`}>
                                    {resendTimer > 0 ? `RESEND IN ${resendTimer}S` : 'RESEND CODE'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                <View className="mt-8 pt-6 border-t border-gray-100 items-center">
                    <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest">Membership required</Text>
                    <TouchableOpacity 
                        onPress={() => navigation.navigate('Register')}
                        className="mt-2"
                    >
                        <Text className="text-[#1B4D3E] font-black text-lg border-b-2 border-[#D4AF37]">Create Account</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
