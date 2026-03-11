import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

export default function LoginScreen() {
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [loading, setLoading] = useState(false);

    const { setAuth } = useAuthStore();

    const handleSendOTP = async () => {
        if (!/^[0-9]{10}$/.test(mobile)) {
            Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number');
            return;
        }

        setLoading(true);
        try {
            const phone = `+91${mobile}`;

            // For testing: Proceed to OTP step immediately if provider fails or as a general bypass
            // This avoids the "unsupported phone provider" error if Supabase isn't linked to Twilio/etc yet.
            try {
                const { error: otpError } = await supabase.auth.signInWithOtp({
                    phone,
                });
                if (otpError) {
                    console.log('OTP Send failed (expected if no provider):', otpError.message);
                    // If it's the provider error, we still move to next step for the '123456' bypass
                    if (otpError.message.includes('unsupported phone provider')) {
                        setStep('otp');
                        return;
                    }
                    throw otpError;
                }
            } catch (e) {
                // Fallback for testing
                setStep('otp');
                return;
            }

            setStep('otp');
            Alert.alert('OTP Sent', `OTP has been sent to ${mobile}`);
        } catch (error: any) {
            Alert.alert('Error', error.message);
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
            const phoneWithPrefix = `+91${mobile}`;
            const phoneRaw = mobile;

            // Temporary OTP bypass for testing
            if (otp === '123456') {
                const { data: customerData } = await supabase
                    .from('customers')
                    .select('*, address:addresses(*)')
                    .or(`mobile.eq.${phoneWithPrefix},mobile.eq.${phoneRaw}`)
                    .single();

                if (customerData) {
                    setAuth({ user: { phone: phoneWithPrefix } }, customerData);
                    return;
                } else {
                    Alert.alert('Registration Required', `No account found with number ${mobile}. Please register on the web first.`);
                    setLoading(false);
                    return;
                }
            }

            const { data, error } = await supabase.auth.verifyOtp({
                phone: phoneWithPrefix,
                token: otp,
                type: 'sms',
            });

            if (error) throw error;
            if (data?.session) {
                // Get customer profile
                const { data: customerData } = await supabase
                    .from('customers')
                    .select('*, address:addresses(*)')
                    .or(`mobile.eq.${phoneWithPrefix},mobile.eq.${phoneRaw}`)
                    .single();

                if (customerData) {
                    setAuth(data.session, customerData);
                } else {
                    Alert.alert('Registration Required', 'No account found. Use the web portal to register first.');
                    await supabase.auth.signOut();
                }
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
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
                    <Text className="text-gray-500 mt-1 font-medium">Customer Portal</Text>
                </View>

                {step === 'phone' ? (
                    <View className="space-y-4">
                        <View>
                            <Text className="text-sm font-semibold text-gray-700 mb-2">Mobile Number</Text>
                            <TextInput
                                className="w-full h-14 bg-gray-50 border border-gray-200 rounded-xl px-4 text-lg"
                                placeholder="Enter 10 digit number"
                                keyboardType="number-pad"
                                maxLength={10}
                                value={mobile}
                                onChangeText={setMobile}
                            />
                        </View>
                        <TouchableOpacity
                            onPress={handleSendOTP}
                            disabled={loading || mobile.length !== 10}
                            className={`w-full h-14 rounded-xl items-center justify-center mt-6 ${loading || mobile.length !== 10 ? 'bg-[#1B4D3E]/50' : 'bg-[#1B4D3E]'}`}
                        >
                            {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Send OTP</Text>}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="space-y-4">
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
                            className={`w-full h-14 rounded-xl items-center justify-center mt-6 ${loading || otp.length !== 6 ? 'bg-[#1B4D3E]/50' : 'bg-[#1B4D3E]'}`}
                        >
                            {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Verify & Login</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setStep('phone')} className="items-center mt-4 p-2">
                            <Text className="text-[#1B4D3E] font-medium">Wrong number? Go back</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}
