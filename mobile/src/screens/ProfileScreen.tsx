import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Modal, SafeAreaView } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { User, MapPin, Phone, Mail, Calendar, Save, X, Edit3, ChevronLeft, Map as MapIcon, Compass, Package } from 'lucide-react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function ProfileScreen({ navigation }: any) {
    const { customer, updateCustomer } = useAuthStore();
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [fetchingLocation, setFetchingLocation] = useState(false);

    // Editable fields
    const [altMobile, setAltMobile] = useState(customer?.address?.alt_mobile || '');
    const [doorNo, setDoorNo] = useState(customer?.address?.door_no || '');
    const [street, setStreet] = useState(customer?.address?.street || '');
    const [landmark, setLandmark] = useState(customer?.address?.landmark || '');
    const [area, setArea] = useState(customer?.address?.area || '');
    const [pincode, setPincode] = useState(customer?.address?.pincode || '');

    // Map state
    const [location, setLocation] = useState({
        latitude: customer?.address?.lat || 13.0827,
        longitude: customer?.address?.lng || 80.2707,
    });

    const getCurrentLocation = async () => {
        setFetchingLocation(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Permission to access location was denied');
                return;
            }

            let loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            const newCoords = {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
            };
            setLocation(newCoords);

            // Reverse geocode to fill some fields if possible
            const [address] = await Location.reverseGeocodeAsync(newCoords);
            if (address) {
                if (address.name && !doorNo) setDoorNo(address.name);
                if (address.street && !street) setStreet(address.street);
                if (address.district && !area) setArea(address.district);
                if (address.postalCode && !pincode) setPincode(address.postalCode);
                if (address.subregion && !landmark) setLandmark(address.subregion);
            }
        } catch (error: any) {
            Alert.alert('Error', 'Failed to get current location: ' + error.message);
        } finally {
            setFetchingLocation(false);
        }
    };

    const handleSaveAddress = async () => {
        if (!customer?.address?.id) return;
        setLoading(true);

        try {
            const { error } = await supabase
                .from('addresses')
                .update({
                    alt_mobile: altMobile || null,
                    door_no: doorNo || null,
                    street: street || null,
                    landmark: landmark || null,
                    area: area || null,
                    pincode: pincode || null,
                    lat: location.latitude,
                    lng: location.longitude,
                })
                .eq('id', customer.address.id);

            if (error) throw error;

            // Update local state in store
            const updatedCustomer = {
                ...customer,
                address: {
                    ...customer.address!,
                    alt_mobile: altMobile,
                    door_no: doorNo,
                    street: street,
                    landmark,
                    area,
                    pincode: pincode,
                    lat: location.latitude,
                    lng: location.longitude,
                },
            };
            updateCustomer(updatedCustomer);

            Alert.alert('Success', 'Profile and location updated successfully');
            setEditing(false);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const InfoRow = ({ icon: Icon, label, value }: any) => (
        <View className="flex-row items-center bg-white p-4 rounded-2xl mb-3 border border-gray-100">
            <View className="w-10 h-10 bg-[#1B4D3E]/10 rounded-full items-center justify-center mr-4">
                <Icon color="#1B4D3E" size={20} />
            </View>
            <View className="flex-1">
                <Text className="text-xs text-gray-500 uppercase font-bold tracking-wider">{label}</Text>
                <Text className="text-gray-900 font-medium text-base mt-0.5">{value || 'Not provided'}</Text>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-[#1B4D3E] pt-16 pb-6 px-6 rounded-b-[32px] shadow-lg">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
                        <ChevronLeft color="white" size={28} />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold">My Profile</Text>
                    <TouchableOpacity
                        onPress={() => editing ? setEditing(false) : setEditing(true)}
                        className="p-2"
                    >
                        {editing ? <X color="white" size={24} /> : <Edit3 color="white" size={24} />}
                    </TouchableOpacity>
                </View>

                <View className="items-center mt-6">
                    <View className="w-24 h-24 rounded-full bg-white/20 items-center justify-center border-4 border-white/30 overflow-hidden">
                        <User color="white" size={48} />
                    </View>
                    <Text className="text-white text-2xl font-bold mt-4">{customer?.full_name}</Text>
                    <Text className="text-[#D4AF37] font-medium">{customer?.customer_id}</Text>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-6 pb-12">
                {editing ? (
                    <View className="space-y-4 pb-10">
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-lg font-bold text-gray-900">Edit Address</Text>
                            <View className="flex-row gap-2">
                                <TouchableOpacity
                                    onPress={getCurrentLocation}
                                    disabled={fetchingLocation}
                                    className="flex-row items-center bg-[#1B4D3E]/10 px-4 py-2 rounded-full"
                                >
                                    {fetchingLocation ? (
                                        <ActivityIndicator size="small" color="#1B4D3E" />
                                    ) : (
                                        <>
                                            <Compass color="#1B4D3E" size={16} />
                                            <Text className="text-[#1B4D3E] font-bold ml-2 text-xs">Use GPS</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setShowMap(true)}
                                    className="flex-row items-center bg-[#D4AF37]/10 px-4 py-2 rounded-full"
                                >
                                    <MapIcon color="#D4AF37" size={16} />
                                    <Text className="text-[#D4AF37] font-bold ml-2 text-xs">Map</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View>
                            <Text className="text-sm font-semibold text-gray-700 mb-2">Door No / Flat No</Text>
                            <TextInput
                                className="bg-white border border-gray-200 rounded-xl p-4 text-gray-900"
                                value={doorNo}
                                onChangeText={setDoorNo}
                                placeholder="e.g. 12/A"
                            />
                        </View>

                        <View>
                            <Text className="text-sm font-semibold text-gray-700 mb-2">Street / Road</Text>
                            <TextInput
                                className="bg-white border border-gray-200 rounded-xl p-4 text-gray-900"
                                value={street}
                                onChangeText={setStreet}
                                placeholder="Street name"
                            />
                        </View>

                        <View>
                            <Text className="text-sm font-semibold text-gray-700 mb-2">Landmark</Text>
                            <TextInput
                                className="bg-white border border-gray-200 rounded-xl p-4 text-gray-900"
                                value={landmark}
                                onChangeText={setLandmark}
                                placeholder="Near by..."
                            />
                        </View>

                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <Text className="text-sm font-semibold text-gray-700 mb-2">Area</Text>
                                <TextInput
                                    className="bg-white border border-gray-200 rounded-xl p-4 text-gray-900"
                                    value={area}
                                    onChangeText={setArea}
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm font-semibold text-gray-700 mb-2">Pincode</Text>
                                <TextInput
                                    className="bg-white border border-gray-200 rounded-xl p-4 text-gray-900"
                                    value={pincode}
                                    onChangeText={setPincode}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={handleSaveAddress}
                            disabled={loading}
                            className="bg-[#1B4D3E] h-14 rounded-2xl items-center justify-center mt-6 shadow-md"
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <View className="flex-row items-center">
                                    <Save color="white" size={20} />
                                    <Text className="text-white font-bold text-lg ml-2">Save Changes</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="pb-10">
                        <Text className="text-lg font-bold text-gray-900 mb-4">Personal Details</Text>
                        <InfoRow icon={Phone} label="Mobile" value={`+91 ${customer?.mobile}`} />
                        <InfoRow icon={Mail} label="Email" value={customer?.email} />
                        <InfoRow icon={Calendar} label="Date of Birth" value={customer?.dob} />
                        <InfoRow icon={User} label="Gender" value={customer?.gender} />

                        <View className="flex-row items-center justify-between mb-4 mt-6">
                            <Text className="text-lg font-bold text-gray-900">Delivery Address</Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Orders')}
                                className="flex-row items-center bg-[#1B4D3E]/10 px-4 py-2 rounded-full"
                            >
                                <Package color="#1B4D3E" size={16} />
                                <Text className="text-[#1B4D3E] font-bold ml-2 text-xs">My Orders</Text>
                            </TouchableOpacity>
                        </View>
                        <View className="bg-white p-5 rounded-3xl border border-gray-100 mb-4">
                            <Text className="text-gray-900 font-medium leading-6">
                                {customer?.address?.door_no}, {customer?.address?.street}{"\n"}
                                {customer?.address?.landmark && `${customer?.address?.landmark}, `}
                                {customer?.address?.area}, {customer?.address?.city}{"\n"}
                                {customer?.address?.pincode}
                            </Text>
                            <View className="h-[1px] bg-gray-50 my-4" />
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <MapPin color="#D4AF37" size={16} />
                                    <Text className="text-gray-500 text-xs ml-2">Location pinned on map</Text>
                                </View>
                                <TouchableOpacity onPress={() => setShowMap(true)}>
                                    <Text className="text-[#1B4D3E] font-bold text-xs uppercase">View Map</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Map Modal */}
            <Modal visible={showMap} animationType="slide">
                <SafeAreaView className="flex-1 bg-white">
                    <View className="flex-1 relative">
                        <MapView
                            className="flex-1"
                            region={{
                                ...location,
                                latitudeDelta: 0.005,
                                longitudeDelta: 0.005,
                            }}
                            onPress={(e) => editing && setLocation(e.nativeEvent.coordinate)}
                        >
                            <Marker
                                coordinate={location}
                                draggable={editing}
                                onDragEnd={(e) => setLocation(e.nativeEvent.coordinate)}
                            />
                        </MapView>

                        {/* Controls Container */}
                        <View className="absolute top-12 left-6 right-6 flex-row justify-between pointer-events-none">
                            <TouchableOpacity
                                onPress={() => setShowMap(false)}
                                className="bg-white p-3 rounded-full shadow-lg pointer-events-auto"
                            >
                                <X color="#1B4D3E" size={24} />
                            </TouchableOpacity>

                            {editing && (
                                <TouchableOpacity
                                    onPress={getCurrentLocation}
                                    disabled={fetchingLocation}
                                    className="bg-white px-5 py-3 rounded-full shadow-lg flex-row items-center pointer-events-auto"
                                >
                                    {fetchingLocation ? (
                                        <ActivityIndicator size="small" color="#1B4D3E" />
                                    ) : (
                                        <>
                                            <Compass color="#1B4D3E" size={20} />
                                            <Text className="text-[#1B4D3E] font-bold ml-2">Current Location</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>

                        {editing && (
                            <View className="absolute bottom-10 left-6 right-6 pointer-events-none">
                                <TouchableOpacity
                                    onPress={() => setShowMap(false)}
                                    className="bg-[#1B4D3E] h-14 rounded-2xl items-center justify-center shadow-2xl pointer-events-auto"
                                >
                                    <Text className="text-white font-bold text-lg">Pin Selection</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </SafeAreaView>
            </Modal>
        </View>
    );
}

