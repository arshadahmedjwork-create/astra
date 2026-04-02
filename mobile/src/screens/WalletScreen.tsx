import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Wallet, Plus, History, ArrowUpRight, ArrowDownLeft, ChevronLeft, AlertCircle } from 'lucide-react-native';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';

export default function WalletScreen({ navigation }: any) {
    const { customer, refreshProfile } = useAuthStore();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [addAmount, setAddAmount] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!customer?.id) return;
        fetchTransactions();
    }, [customer?.id]);

    const fetchTransactions = async () => {
        const { data, error } = await supabase
            .from('wallet_transactions')
            .select('*')
            .eq('customer_id', customer?.id)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setTransactions(data);
        }
        setLoading(false);
    };

    const handleAddFunds = async () => {
        if (!addAmount || isNaN(Number(addAmount))) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount');
            return;
        }

        setProcessing(true);
        // Mocking successful update for now
        const { data, error } = await supabase.rpc('add_wallet_funds', {
            cust_id: customer?.id,
            amount_to_add: Number(addAmount),
            desctext: 'Mobile Wallet Top-up'
        });

        if (error) {
            Alert.alert('Error', 'Failed to add funds: ' + error.message);
        } else {
            Alert.alert('Success', '₹' + addAmount + ' added to your wallet!');
            setAddAmount('');
            await refreshProfile();
            fetchTransactions();
        }
        setProcessing(false);
    };

    return (
        <SafeAreaView className="flex-1 bg-[#FDFDFD]">
            <View className="flex-row items-center justify-between px-6 py-4">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
                    <ChevronLeft color="#1B4D3E" size={28} />
                </TouchableOpacity>
                <Text className="text-xl font-black text-[#1B4D3E]">My Wallet</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                {/* Balance Card */}
                <View className="bg-[#1B4D3E] rounded-[40px] p-8 my-4 shadow-2xl relative overflow-hidden">
                    <View className="z-10">
                        <View className="flex-row items-center mb-2 opacity-60">
                            <Wallet color="white" size={16} />
                            <Text className="text-white text-xs font-bold uppercase ml-2 tracking-widest">Available Balance</Text>
                        </View>
                        <Text className="text-white text-5xl font-black">₹{customer?.wallet_balance?.toLocaleString() || '0.00'}</Text>
                        <Text className="text-white/40 text-[10px] mt-4 italic font-bold">
                            *Auto-deduction for daily deliveries enabled
                        </Text>
                    </View>
                    {/* Decorative Elements */}
                    <View className="absolute -right-20 -top-20 w-60 h-60 bg-white/5 rounded-full" />
                    <View className="absolute -left-20 -bottom-20 w-40 h-40 bg-black/10 rounded-full" />
                </View>

                {/* Quick Add Section */}
                <View className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm mb-6 mt-2">
                    <View className="flex-row items-center mb-6">
                        <View className="w-10 h-10 bg-[#D4AF37]/10 rounded-full items-center justify-center mr-3">
                            <Plus color="#D4AF37" size={20} />
                        </View>
                        <Text className="text-lg font-black text-gray-900">Add Money</Text>
                    </View>

                    <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-2 border border-gray-100 mb-6">
                        <Text className="text-2xl font-black text-gray-400 mr-2">₹</Text>
                        <TextInput
                            value={addAmount}
                            onChangeText={setAddAmount}
                            placeholder="Enter Amount"
                            keyboardType="numeric"
                            className="flex-1 text-2xl font-black text-gray-900"
                        />
                    </View>

                    <View className="flex-row justify-between mb-6">
                        {[100, 500, 1000].map(amt => (
                            <TouchableOpacity
                                key={amt}
                                onPress={() => setAddAmount(amt.toString())}
                                className="bg-[#1B4D3E]/5 px-5 py-3 rounded-xl border border-[#1B4D3E]/10"
                            >
                                <Text className="text-[#1B4D3E] font-black">+₹{amt}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity
                        onPress={handleAddFunds}
                        disabled={processing}
                        className="bg-[#1B4D3E] h-16 rounded-2xl items-center justify-center shadow-lg shadow-[#1B4D3E]/20"
                    >
                        {processing ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-lg font-black">Proceed to Pay</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Transactions History */}
                <View className="mb-10">
                    <View className="flex-row items-center justify-between mb-6">
                        <View className="flex-row items-center">
                            <History color="#1B4D3E" size={20} />
                            <Text className="text-lg font-black text-gray-900 ml-2">Recent Transactions</Text>
                        </View>
                    </View>

                    <View className="space-y-4">
                        {loading ? (
                            <ActivityIndicator color="#1B4D3E" className="py-10" />
                        ) : transactions.length > 0 ? (
                            transactions.map((tx) => (
                                <View key={tx.id} className="bg-white border border-gray-50 rounded-[28px] p-5 flex-row items-center justify-between shadow-sm">
                                    <View className="flex-row items-center">
                                        <View className={`w-12 h-12 rounded-2xl items-center justify-center ${
                                            tx.type === 'credit' ? 'bg-emerald-50' : 'bg-red-50'
                                        }`}>
                                            {tx.type === 'credit' ? (
                                                <ArrowDownLeft color="#10B981" size={24} />
                                            ) : (
                                                <ArrowUpRight color="#EF4444" size={24} />
                                            )}
                                        </View>
                                        <View className="ml-4">
                                            <Text className="text-sm font-black text-gray-900">{tx.description || 'Wallet Transaction'}</Text>
                                            <Text className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                                                {new Date(tx.created_at).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="items-end">
                                        <Text className={`text-base font-black ${
                                            tx.type === 'credit' ? 'text-emerald-600' : 'text-red-600'
                                        }`}>
                                            {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount}
                                        </Text>
                                        <View className="flex-row items-center mt-1">
                                            <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1" />
                                            <Text className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">{tx.status}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View className="items-center py-10 opacity-20">
                                <AlertCircle color="gray" size={40} />
                                <Text className="mt-2 font-bold">No transactions found</Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
