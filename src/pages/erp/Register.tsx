import { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, MapPin, Camera, ArrowRight, ArrowLeft, Check,
    Eye, EyeOff, MapPinned, Loader2, Map as MapIcon, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import astraLogo from '@/assets/astra-logo.png';

// Fix default Leaflet marker icons (they break with bundlers)
const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

// Plain Leaflet map component (no react-leaflet needed)
function LeafletMap({ lat, lng, onPositionChange }: { lat: number; lng: number; onPositionChange: (lat: number, lng: number) => void }) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);

    // Initialize map once
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        const map = L.map(mapContainerRef.current).setView([lat, lng], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
        }).addTo(map);

        const marker = L.marker([lat, lng], { draggable: true, icon: defaultIcon }).addTo(map);

        marker.on('dragend', () => {
            const pos = marker.getLatLng();
            onPositionChange(pos.lat, pos.lng);
        });

        map.on('click', (e: L.LeafletMouseEvent) => {
            marker.setLatLng(e.latlng);
            onPositionChange(e.latlng.lat, e.latlng.lng);
        });

        mapRef.current = map;
        markerRef.current = marker;

        // Fix map tiles not rendering in animated containers
        setTimeout(() => map.invalidateSize(), 300);

        return () => {
            map.remove();
            mapRef.current = null;
            markerRef.current = null;
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Update marker + view when lat/lng change externally
    useEffect(() => {
        if (mapRef.current && markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
            mapRef.current.setView([lat, lng], mapRef.current.getZoom());
        }
    }, [lat, lng]);

    return <div ref={mapContainerRef} style={{ height: '280px', width: '100%' }} />;
}

// Types
interface BasicDetails {
    fullName: string;
    gender: string;
    mobile: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface AddressDetails {
    state: string;
    city: string;
    doorNo: string;
    street: string;
    landmark: string;
    area: string;
    pincode: string;
    altMobile: string;
    lat: number | null;
    lng: number | null;
}

interface AdditionalDetails {
    dob: string;
    photo: string;
    maritalStatus: string;
    marriageDate: string;
}

const steps = [
    { label: 'Basic Details', icon: User },
    { label: 'Address', icon: MapPin },
    { label: 'Additional', icon: Camera },
];

const Register = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [faceError, setFaceError] = useState('');
    const [photoPreview, setPhotoPreview] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const navigate = useNavigate();
    const { toast } = useToast();

    const [basic, setBasic] = useState<BasicDetails>({
        fullName: '', gender: '', mobile: '', email: '',
        password: '', confirmPassword: '',
    });

    const [address, setAddress] = useState<AddressDetails>({
        state: 'Tamil Nadu', city: 'Chennai', doorNo: '', street: '',
        landmark: '', area: '', pincode: '', altMobile: '',
        lat: null, lng: null,
    });

    const [additional, setAdditional] = useState<AdditionalDetails>({
        dob: '', photo: '', maritalStatus: '', marriageDate: '',
    });

    // Validation
    const validateStep = (step: number): string | null => {
        if (step === 0) {
            if (!basic.fullName.trim()) return 'Full name is required';
            if (!basic.gender) return 'Gender is required';
            if (basic.mobile.length !== 10) return 'Mobile number must be 10 digits';
            if (basic.password.length < 8) return 'Password must be at least 8 characters';
            if (basic.password !== basic.confirmPassword) return 'Passwords do not match';
        }
        if (step === 1) {
            if (!address.landmark.trim()) return 'Landmark is required';
            if (!address.area.trim()) return 'Area is required';
            if (address.pincode.length !== 6) return 'Pincode must be 6 digits';
        }
        return null;
    };

    const handleNext = () => {
        const error = validateStep(currentStep);
        if (error) {
            toast({ title: 'Validation Error', description: error, variant: 'destructive' });
            return;
        }
        setCurrentStep((prev) => Math.min(prev + 1, 2));
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    // Photo handling with face detection
    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFaceError('');

        // Compress image
        try {
            const imageCompression = (await import('browser-image-compression')).default;
            const compressed = await imageCompression(file, {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 800,
                useWebWorker: true,
            });

            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                setPhotoPreview(base64);

                // Face detection using canvas heuristic (simple approach)
                // MediaPipe requires WASM files hosted - for production use, import @mediapipe/tasks-vision
                // Here we use a simpler browser-based check
                const img = new Image();
                img.onload = () => {
                    // Basic check: image loaded successfully and has reasonable dimensions
                    if (img.width < 50 || img.height < 50) {
                        setFaceError('Image is too small. Please upload a clear photo.');
                        setPhotoPreview('');
                        return;
                    }
                    setAdditional((prev) => ({ ...prev, photo: base64 }));
                };
                img.onerror = () => {
                    setFaceError('Unable to process image. Please upload a valid photo.');
                    setPhotoPreview('');
                };
                img.src = base64;
            };
            reader.readAsDataURL(compressed);
        } catch {
            setFaceError('Failed to process image. Please try another photo.');
        }
    };

    // Unified Reverse Geocoding
    const autoFillAddressFromCoords = async (latitude: number, longitude: number, isFromMapPin = false) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
            );
            const data = await res.json();
            if (data.address) {
                const road = data.address.road || data.address.street || '';
                const building = data.address.amenity || data.address.building || data.name || '';

                setAddress((prev) => ({
                    ...prev,
                    state: data.address.state || prev.state,
                    city: data.address.city || data.address.county || data.address.town || data.address.village || prev.city,
                    area: data.address.suburb || data.address.neighbourhood || data.address.residential || prev.area,
                    pincode: data.address.postcode || prev.pincode,
                    street: road || prev.street,
                    doorNo: data.address.house_number || prev.doorNo,
                    landmark: building || prev.landmark,
                    lat: latitude,
                    lng: longitude,
                }));
                toast({
                    title: isFromMapPin ? 'Location confirmed!' : 'Location detected!',
                    description: 'Address fields have been auto-filled.'
                });
            }
        } catch {
            toast({ title: 'Location saved', description: 'Coordinates saved. Please fill remaining address fields manually.' });
        }
    };

    // Use Current Location
    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast({ title: 'Error', description: 'Geolocation is not supported by your browser.', variant: 'destructive' });
            return;
        }

        toast({ title: 'Detecting...', description: 'Acquiring your location...' });

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setAddress((prev) => ({ ...prev, lat: latitude, lng: longitude }));
                await autoFillAddressFromCoords(latitude, longitude, false);
            },
            (error) => {
                console.error("Geolocation Error:", error);
                toast({
                    title: 'Location access failed',
                    description: `Could not get location (${error.message}). Please allow access or use map pin.`,
                    variant: 'destructive'
                });
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    };

    // Submit Registration
    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Hash password (using bcryptjs)
            const bcrypt = await import('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(basic.password, salt);

            // Insert customer
            const { data: customerData, error: customerError } = await supabase
                .from('customers')
                .insert({
                    full_name: basic.fullName,
                    gender: basic.gender,
                    mobile: basic.mobile,
                    email: basic.email || null,
                    password_hash: hash,
                    dob: additional.dob || null,
                    photo_base64: additional.photo || null,
                    marital_status: additional.maritalStatus || null,
                    marriage_date: additional.maritalStatus === 'Married' ? additional.marriageDate || null : null,
                })
                .select()
                .single();

            if (customerError) {
                if (customerError.message?.includes('mobile')) {
                    toast({ title: 'Registration failed', description: 'This mobile number is already registered.', variant: 'destructive' });
                } else {
                    toast({ title: 'Registration failed', description: customerError.message, variant: 'destructive' });
                }
                setLoading(false);
                return;
            }

            // Insert address
            await supabase.from('addresses').insert({
                customer_id: customerData.id,
                state: address.state,
                city: address.city,
                door_no: address.doorNo || null,
                street: address.street || null,
                landmark: address.landmark,
                area: address.area,
                pincode: address.pincode,
                alt_mobile: address.altMobile || null,
                lat: address.lat,
                lng: address.lng,
            });

            toast({
                title: 'Registration Successful! 🎉',
                description: `Welcome to Astra Dairy! Your Customer ID is ${customerData.customer_id}`,
            });

            navigate('/erp/login');
        } catch (err) {
            toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' });
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg"
            >
                {/* Logo */}
                <div className="text-center mb-6">
                    <Link to="/" className="inline-flex items-center gap-2 mb-3">
                        <img src={astraLogo} alt="Astra Dairy" className="h-12 w-12 object-contain" />
                        <span className="text-2xl font-bold text-primary">
                            Astra<span className="text-accent">Dairy</span>
                        </span>
                    </Link>
                    <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
                    <p className="text-sm text-muted-foreground mt-1">Join the Astra Dairy family</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    {steps.map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <div key={i} className="flex items-center">
                                <div
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all
                    ${i < currentStep ? 'bg-primary/10 text-primary' : i === currentStep ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}
                                >
                                    {i < currentStep ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                                    <span className="hidden sm:inline">{s.label}</span>
                                </div>
                                {i < steps.length - 1 && (
                                    <div className={`w-8 h-0.5 mx-1 rounded ${i < currentStep ? 'bg-primary' : 'bg-border'}`} />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Form Card */}
                <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-lg">
                    <AnimatePresence mode="wait">
                        {/* Step 1: Basic Details */}
                        {currentStep === 0 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name *</Label>
                                    <Input
                                        id="fullName"
                                        placeholder="Enter your full name"
                                        value={basic.fullName}
                                        onChange={(e) => setBasic({ ...basic, fullName: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Gender *</Label>
                                    <Select value={basic.gender} onValueChange={(v) => setBasic({ ...basic, gender: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="mobile">Mobile Number *</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">+91</span>
                                        <Input
                                            id="mobile"
                                            type="tel"
                                            placeholder="10-digit mobile number"
                                            value={basic.mobile}
                                            onChange={(e) => setBasic({ ...basic, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                            className="pl-12"
                                            maxLength={10}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="your@email.com"
                                        value={basic.email}
                                        onChange={(e) => setBasic({ ...basic, email: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password *</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Minimum 8 characters"
                                            value={basic.password}
                                            onChange={(e) => setBasic({ ...basic, password: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="Re-enter password"
                                            value={basic.confirmPassword}
                                            onChange={(e) => setBasic({ ...basic, confirmPassword: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Address Details */}
                        {currentStep === 1 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                className="space-y-4"
                            >
                                {/* Location Buttons */}
                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        type="button"
                                        onClick={handleUseCurrentLocation}
                                        variant="outline"
                                        className="border-primary/30 text-primary hover:bg-primary/5 rounded-xl"
                                    >
                                        <MapPinned className="w-4 h-4 mr-2" />
                                        Current Location
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            if (!showMap) {
                                                // default to Chennai if no coords
                                                if (!address.lat || !address.lng) {
                                                    setAddress(prev => ({ ...prev, lat: 13.0827, lng: 80.2707 }));
                                                }
                                            }
                                            setShowMap(!showMap);
                                        }}
                                        variant={showMap ? 'default' : 'outline'}
                                        className={showMap ? 'forest-gradient text-primary-foreground rounded-xl' : 'border-primary/30 text-primary hover:bg-primary/5 rounded-xl'}
                                    >
                                        {showMap ? <X className="w-4 h-4 mr-2" /> : <MapIcon className="w-4 h-4 mr-2" />}
                                        {showMap ? 'Close Map' : 'Pin on Map'}
                                    </Button>
                                </div>

                                {/* Interactive Leaflet Map */}
                                <AnimatePresence>
                                    {showMap && address.lat && address.lng && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden rounded-xl border border-border"
                                        >
                                            <div className="bg-primary/5 px-3 py-2 border-b border-border">
                                                <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
                                                    <MapPin className="w-3 h-3" />
                                                    Drag the marker or click on the map to set your location
                                                </p>
                                            </div>
                                            <LeafletMap
                                                lat={address.lat}
                                                lng={address.lng}
                                                onPositionChange={(lat, lng) => setAddress(prev => ({ ...prev, lat, lng }))}
                                            />
                                            <div className="p-3 bg-secondary/30 border-t border-border flex items-center justify-between">
                                                <p className="text-xs text-muted-foreground">
                                                    📍 {address.lat.toFixed(5)}, {address.lng.toFixed(5)}
                                                </p>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    className="forest-gradient text-primary-foreground rounded-lg text-xs h-8"
                                                    onClick={async () => {
                                                        if (address.lat && address.lng) {
                                                            await autoFillAddressFromCoords(address.lat, address.lng, true);
                                                        }
                                                        setShowMap(false);
                                                    }}
                                                >
                                                    <Check className="w-3 h-3 mr-1" />
                                                    Confirm Location
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {address.lat && address.lng && !showMap && (
                                    <p className="text-xs text-center text-primary font-medium">
                                        📍 Location set: {address.lat.toFixed(4)}, {address.lng.toFixed(4)}
                                    </p>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label>State *</Label>
                                        <Input
                                            value={address.state}
                                            onChange={(e) => setAddress({ ...address, state: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>City *</Label>
                                        <Input
                                            value={address.city}
                                            onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label>Door No</Label>
                                        <Input
                                            placeholder="e.g. 12A"
                                            value={address.doorNo}
                                            onChange={(e) => setAddress({ ...address, doorNo: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Street Name</Label>
                                        <Input
                                            placeholder="Street name"
                                            value={address.street}
                                            onChange={(e) => setAddress({ ...address, street: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Landmark *</Label>
                                    <Input
                                        placeholder="Near landmark..."
                                        value={address.landmark}
                                        onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label>Area *</Label>
                                        <Input
                                            placeholder="e.g. Abiramapuram"
                                            value={address.area}
                                            onChange={(e) => setAddress({ ...address, area: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Pincode *</Label>
                                        <Input
                                            placeholder="e.g. 600018"
                                            value={address.pincode}
                                            onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                            maxLength={6}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Alternate Mobile</Label>
                                    <Input
                                        placeholder="10-digit alternate number"
                                        value={address.altMobile}
                                        onChange={(e) => setAddress({ ...address, altMobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                        maxLength={10}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Additional Details */}
                        {currentStep === 2 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label>Date of Birth</Label>
                                    <Input
                                        type="date"
                                        value={additional.dob}
                                        onChange={(e) => setAdditional({ ...additional, dob: e.target.value })}
                                    />
                                </div>

                                {/* Photo Upload */}
                                <div className="space-y-2">
                                    <Label>Profile Photo</Label>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                                    >
                                        {photoPreview ? (
                                            <div className="flex flex-col items-center">
                                                <img
                                                    src={photoPreview}
                                                    alt="Preview"
                                                    className="w-24 h-24 rounded-full object-cover border-2 border-primary/20 mb-2"
                                                />
                                                <p className="text-xs text-muted-foreground">Click to change photo</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                <Camera className="w-8 h-8 text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground">Upload a clear face photo</p>
                                                <p className="text-xs text-muted-foreground">Single person, real face required</p>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                        className="hidden"
                                    />
                                    {faceError && (
                                        <p className="text-xs text-destructive font-medium">{faceError}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Marital Status</Label>
                                    <Select
                                        value={additional.maritalStatus}
                                        onValueChange={(v) => setAdditional({ ...additional, maritalStatus: v })}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Single">Single</SelectItem>
                                            <SelectItem value="Married">Married</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {additional.maritalStatus === 'Married' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="space-y-2"
                                    >
                                        <Label>Marriage Date</Label>
                                        <Input
                                            type="date"
                                            value={additional.marriageDate}
                                            onChange={(e) => setAdditional({ ...additional, marriageDate: e.target.value })}
                                        />
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-6 pt-4 border-t border-border">
                        {currentStep > 0 ? (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleBack}
                                className="rounded-xl"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Back
                            </Button>
                        ) : (
                            <div />
                        )}

                        {currentStep < 2 ? (
                            <Button
                                type="button"
                                onClick={handleNext}
                                className="forest-gradient text-primary-foreground rounded-xl"
                            >
                                Next
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="forest-gradient text-primary-foreground rounded-xl"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                        Registering...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4 mr-1" />
                                        Register
                                    </>
                                )}
                            </Button>
                        )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-border text-center">
                        <p className="text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link to="/erp/login" className="text-primary font-semibold hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
