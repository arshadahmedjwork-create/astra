import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Image,
    Modal,
    SafeAreaView,
} from 'react-native';
import { 
    User, MapPin, Camera, ArrowRight, ArrowLeft, Check, 
    Eye, EyeOff, Map as MapIcon, Compass, X, ChevronLeft 
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import bcrypt from 'bcryptjs';
import { supabase } from '../lib/supabase';
import { sendRegistrationSms } from '../lib/msg91';

// Steps definition
const STEPS = [
    { label: 'Basic', icon: User },
    { label: 'Address', icon: MapPin },
    { label: 'Additional', icon: Camera },
];

export default function RegisterScreen({ navigation }: any) {
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    
    // Step 1: Basic Details
    const [fullName, setFullName] = useState('');
    const [gender, setGender] = useState('');
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    // Step 2: Address Details
    const [doorNo, setDoorNo] = useState('');
    const [street, setStreet] = useState('');
    const [landmark, setLandmark] = useState('');
    const [area, setArea] = useState('');
    const [pincode, setPincode] = useState('');
    const [city, setCity] = useState('Chennai');
    const [state, setState] = useState('Tamil Nadu');
    const [altMobile, setAltMobile] = useState('');
    const [location, setLocation] = useState({
        latitude: 13.0827,
        longitude: 80.2707,
    });
    const [showMap, setShowMap] = useState(false);
    const [fetchingLocation, setFetchingLocation] = useState(false);
    
    // Step 3: Additional Details
    const [dob, setDob] = useState('');
    const [photo, setPhoto] = useState<string | null>(null);
    const [maritalStatus, setMaritalStatus] = useState('');
    const [marriageDate, setMarriageDate] = useState('');
    
    const handleNext = () => {
        if (currentStep === 0) {
            if (!fullName.trim()) return Alert.alert('Error', 'Full Name is required');
            if (!gender) return Alert.alert('Error', 'Gender is required');
            if (mobile.length !== 10) return Alert.alert('Error', 'Invalid Mobile Number');
            if (password.length < 8) return Alert.alert('Error', 'Password must be at least 8 characters');
            if (password !== confirmPassword) return Alert.alert('Error', 'Passwords do not match');
        } else if (currentStep === 1) {
            if (!landmark.trim()) return Alert.alert('Error', 'Landmark is required');
            if (!area.trim()) return Alert.alert('Error', 'Area is required');
            if (pincode.length !== 6) return Alert.alert('Error', 'Pincode must be 6 digits');
        }
        setCurrentStep(prev => Math.min(prev + 1, 2));
    };
    
    const handleBack = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
    };
    
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });
        
        if (!result.canceled) {
            setPhoto(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    };
    
    const getCurrentLocation = async () => {
        setFetchingLocation(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                return Alert.alert('Permission Denied', 'Location permission is required to detect your address.');
            }
            
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
            setLocation(coords);
            
            const addresses = await Location.reverseGeocodeAsync(coords);
            if (addresses && addresses.length > 0) {
                const addr = addresses[0];
                if (addr.name) setDoorNo(addr.name);
                if (addr.street) setStreet(addr.street);
                if (addr.district || addr.subregion || addr.city) setArea(addr.district || addr.subregion || addr.city || '');
                if (addr.postalCode) setPincode(addr.postalCode);
                if (addr.city) setCity(addr.city);
                if (addr.region) setState(addr.region);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to get current location.');
        } finally {
            setFetchingLocation(false);
        }
    };
    
    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Hashing password
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            
            // Register Customer
            const { data: customerData, error: customerError } = await supabase
                .from('customers')
                .insert({
                    full_name: fullName,
                    gender: gender,
                    mobile: mobile,
                    email: email || null,
                    password_hash: hash,
                    dob: dob || null,
                    photo_base64: photo || null,
                    marital_status: maritalStatus || null,
                    marriage_date: maritalStatus === 'Married' ? marriageDate || null : null,
                })
                .select()
                .single();
                
            if (customerError) throw customerError;
            
            // Send registration SMS
            try {
                await sendRegistrationSms(mobile, customerData.customer_id);
            } catch (smsError) {
                console.error('Failed to send registration SMS:', smsError);
            }
            
            // Insert Address
            const { error: addressError } = await supabase
                .from('addresses')
                .insert({
                    customer_id: customerData.id,
                    state: state,
                    city: city,
                    door_no: doorNo || null,
                    street: street || null,
                    landmark: landmark,
                    area: area,
                    pincode: pincode,
                    alt_mobile: altMobile || null,
                    lat: location.latitude,
                    lng: location.longitude,
                });
                
            if (addressError) throw addressError;
            
            Alert.alert('Success', 'Account created successfully! Please login.', [
                { text: 'OK', onPress: () => navigation.navigate('Login') }
            ]);
        } catch (error: any) {
            console.error('Registration Error:', error);
            Alert.alert('Registration Failed', error.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };
    
    const InputField = ({ label, value, onChangeText, placeholder, ...props }: any) => (
        <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">{label}</Text>
            <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900"
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#9ca3af"
                {...props}
            />
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                {/* Header */}
                <View className="flex-row items-center px-6 py-4 border-b border-gray-100">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
                        <ChevronLeft color="#1B4D3E" size={28} />
                    </TouchableOpacity>
                    <View className="flex-1 ml-2">
                        <Text className="text-2xl font-bold text-[#1B4D3E]">Create Account</Text>
                        <Text className="text-gray-500 text-xs">Join the Astra Dairy family</Text>
                    </View>
                </View>

                <ScrollView className="flex-1 px-6 pt-6">
                    {/* Progress Steps */}
                    <View className="flex-row justify-between items-center mb-8 px-4">
                        {STEPS.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = index === currentStep;
                            const isCompleted = index < currentStep;
                            
                            return (
                                <React.Fragment key={index}>
                                    <View className="items-center">
                                        <View className={`w-10 h-10 rounded-full items-center justify-center border-2 ${
                                            isActive ? 'bg-[#1B4D3E] border-[#1B4D3E]' : 
                                            isCompleted ? 'bg-[#1B4D3E]/10 border-[#1B4D3E]' : 
                                            'bg-white border-gray-200'
                                        }`}>
                                            {isCompleted ? (
                                                <Check color="#1B4D3E" size={20} />
                                            ) : (
                                                <Icon color={isActive ? 'white' : '#9ca3af'} size={20} />
                                            )}
                                        </View>
                                        <Text className={`text-[10px] mt-1 font-bold uppercase tracking-tighter ${
                                            isActive ? 'text-[#1B4D3E]' : 'text-gray-400'
                                        }`}>
                                            {step.label}
                                        </Text>
                                    </View>
                                    {index < STEPS.length - 1 && (
                                        <View className={`flex-1 h-[2px] mx-2 -mt-4 ${
                                            isCompleted ? 'bg-[#1B4D3E]' : 'bg-gray-200'
                                        }`} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </View>

                    {/* Step Content */}
                    {currentStep === 0 && (
                        <View>
                            <InputField label="Full Name *" value={fullName} onChangeText={setFullName} placeholder="Astra User" />
                            
                            <Text className="text-sm font-semibold text-gray-700 mb-2">Gender *</Text>
                            <View className="flex-row gap-4 mb-4">
                                {['Male', 'Female', 'Other'].map(option => (
                                    <TouchableOpacity 
                                        key={option}
                                        onPress={() => setGender(option)}
                                        className={`flex-1 py-3 rounded-xl border items-center ${
                                            gender === option ? 'bg-[#1B4D3E]/10 border-[#1B4D3E]' : 'bg-white border-gray-200'
                                        }`}
                                    >
                                        <Text className={`${gender === option ? 'text-[#1B4D3E] font-bold' : 'text-gray-500'}`}>{option}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <InputField label="Mobile Number *" value={mobile} onChangeText={setMobile} placeholder="10-digit number" keyboardType="number-pad" maxLength={10} />
                            <InputField label="Email (Optional)" value={email} onChangeText={setEmail} placeholder="astra@example.com" keyboardType="email-address" autoCapitalize="none" />
                            
                            <View className="mb-4">
                                <Text className="text-sm font-semibold text-gray-700 mb-2">Password *</Text>
                                <View className="relative">
                                    <TextInput
                                        className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900 pr-12"
                                        value={password}
                                        onChangeText={setPassword}
                                        placeholder="Min 8 characters"
                                        secureTextEntry={!showPassword}
                                    />
                                    <TouchableOpacity 
                                        onPress={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-4"
                                    >
                                        {showPassword ? <EyeOff color="#9ca3af" size={20} /> : <Eye color="#9ca3af" size={20} />}
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View className="mb-4">
                                <Text className="text-sm font-semibold text-gray-700 mb-2">Confirm Password *</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="Confirm password"
                                    secureTextEntry={!showPassword}
                                />
                            </View>
                        </View>
                    )}

                    {currentStep === 1 && (
                        <View>
                            <View className="flex-row gap-3 mb-6">
                                <TouchableOpacity 
                                    onPress={getCurrentLocation}
                                    disabled={fetchingLocation}
                                    className="flex-1 flex-row items-center justify-center bg-[#1B4D3E]/10 py-4 rounded-2xl border border-[#1B4D3E]/20"
                                >
                                    {fetchingLocation ? <ActivityIndicator size="small" color="#1B4D3E" /> : <Compass color="#1B4D3E" size={20} />}
                                    <Text className="text-[#1B4D3E] font-bold ml-2">Current Location</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    onPress={() => setShowMap(true)}
                                    className="flex-1 flex-row items-center justify-center bg-[#D4AF37]/10 py-4 rounded-2xl border border-[#D4AF37]/20"
                                >
                                    <MapIcon color="#D4AF37" size={20} />
                                    <Text className="text-[#D4AF37] font-bold ml-2">Pin on Map</Text>
                                </TouchableOpacity>
                            </View>

                            <View className="flex-row gap-4">
                                <View className="flex-1">
                                    <InputField label="Door No" value={doorNo} onChangeText={setDoorNo} placeholder="12/A" />
                                </View>
                                <View className="flex-[2]">
                                    <InputField label="Street Name" value={street} onChangeText={setStreet} placeholder="Street name" />
                                </View>
                            </View>

                            <InputField label="Landmark *" value={landmark} onChangeText={setLandmark} placeholder="Near landmark..." />
                            
                            <View className="flex-row gap-4">
                                <View className="flex-1">
                                    <InputField label="Area *" value={area} onChangeText={setArea} placeholder="Area name" />
                                </View>
                                <View className="flex-1">
                                    <InputField label="Pincode *" value={pincode} onChangeText={setPincode} placeholder="600018" keyboardType="number-pad" maxLength={6} />
                                </View>
                            </View>

                            <InputField label="Alternate Mobile" value={altMobile} onChangeText={setAltMobile} placeholder="Alternate number" keyboardType="number-pad" maxLength={10} />
                        </View>
                    )}

                    {currentStep === 2 && (
                        <View>
                            <InputField label="Date of Birth (YYYY-MM-DD)" value={dob} onChangeText={setDob} placeholder="1990-01-01" />

                            <Text className="text-sm font-semibold text-gray-700 mb-2">Profile Photo</Text>
                            <TouchableOpacity 
                                onPress={pickImage}
                                className="w-full h-48 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl items-center justify-center mb-6 overflow-hidden"
                            >
                                {photo ? (
                                    <Image source={{ uri: photo }} className="w-full h-full" resizeMode="cover" />
                                ) : (
                                    <View className="items-center">
                                        <Camera color="#9ca3af" size={48} />
                                        <Text className="text-gray-400 mt-2 font-medium">Click to upload photo</Text>
                                        <Text className="text-gray-300 text-xs">Clear face photo required</Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            <Text className="text-sm font-semibold text-gray-700 mb-2">Marital Status</Text>
                            <View className="flex-row gap-4 mb-4">
                                {['Single', 'Married'].map(option => (
                                    <TouchableOpacity 
                                        key={option}
                                        onPress={() => setMaritalStatus(option)}
                                        className={`flex-1 py-3 rounded-xl border items-center ${
                                            maritalStatus === option ? 'bg-[#1B4D3E]/10 border-[#1B4D3E]' : 'bg-white border-gray-200'
                                        }`}
                                    >
                                        <Text className={`${maritalStatus === option ? 'text-[#1B4D3E] font-bold' : 'text-gray-500'}`}>{option}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {maritalStatus === 'Married' && (
                                <InputField label="Marriage Anniversary (YYYY-MM-DD)" value={marriageDate} onChangeText={setMarriageDate} placeholder="YYYY-MM-DD" />
                            )}
                        </View>
                    )}

                    <View className="flex-row gap-4 mt-8 pb-12">
                        {currentStep > 0 && (
                            <TouchableOpacity 
                                onPress={handleBack}
                                className="flex-1 flex-row items-center justify-center bg-gray-100 h-14 rounded-2xl"
                            >
                                <ArrowLeft color="#1B4D3E" size={20} />
                                <Text className="text-[#1B4D3E] font-bold ml-2 text-lg">Back</Text>
                            </TouchableOpacity>
                        )}
                        
                        <TouchableOpacity 
                            onPress={currentStep === 2 ? handleSubmit : handleNext}
                            disabled={loading}
                            className={`flex-[2] flex-row items-center justify-center h-14 rounded-2xl shadow-lg ${
                                loading ? 'bg-[#1B4D3E]/70' : 'bg-[#1B4D3E]'
                            }`}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Text className="text-white font-bold text-lg mr-2">
                                        {currentStep === 2 ? 'Create Account' : 'Next Step'}
                                    </Text>
                                    {currentStep === 2 ? <Check color="white" size={20} /> : <ArrowRight color="white" size={20} />}
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Map Modal */}
            <Modal visible={showMap} animationType="slide">
                <SafeAreaView className="flex-1 bg-white">
                    <View className="flex-1">
                        <MapView
                            className="flex-1"
                            initialRegion={{
                                ...location,
                                latitudeDelta: 0.005,
                                longitudeDelta: 0.005,
                            }}
                            onPress={(e) => setLocation(e.nativeEvent.coordinate)}
                        >
                            <Marker 
                                coordinate={location} 
                                draggable 
                                onDragEnd={(e) => setLocation(e.nativeEvent.coordinate)}
                            />
                        </MapView>
                        
                        <View className="absolute top-12 left-6 right-6 flex-row justify-between">
                            <TouchableOpacity onPress={() => setShowMap(false)} className="bg-white p-3 rounded-full shadow-lg">
                                <X color="#1B4D3E" size={24} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={getCurrentLocation} className="bg-white px-5 py-3 rounded-full shadow-lg flex-row items-center">
                                <Compass color="#1B4D3E" size={20} />
                                <Text className="text-[#1B4D3E] font-bold ml-2">My Location</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <View className="absolute bottom-10 left-6 right-6">
                            <TouchableOpacity 
                                onPress={() => {
                                    setShowMap(false);
                                    Alert.alert('Location Pinned', 'Map coordinates saved for your address.');
                                }} 
                                className="bg-[#1B4D3E] h-14 rounded-2xl items-center justify-center shadow-2xl"
                            >
                                <Text className="text-white font-bold text-lg">Confirm Location</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}
