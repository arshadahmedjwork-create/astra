import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
    Package, 
    Truck, 
    Navigation, 
    Phone, 
    Clock, 
    ChevronLeft,
    MapPin,
    RotateCcw
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import driverIconUrl from '@/assets/driver.png';

// Fix Leaflet marker icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

const DriverIcon = L.icon({
    iconUrl: driverIconUrl,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -20]
});

const RecenterMap = ({ coords }: { coords: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        if (coords[0] !== 0) {
            map.setView(coords, map.getZoom());
        }
    }, [coords, map]);
    return null;
};

const AdminOrderTracking = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState<any>(null);
    const [driverLocation, setDriverLocation] = useState<[number, number]>([13.0827, 80.2707]);
    const [customerLocation, setCustomerLocation] = useState<[number, number] | null>(null);
    const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
    const [loading, setLoading] = useState(true);
    const [eta, setEta] = useState('Calculating...');

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    customers (
                        id,
                        full_name,
                        mobile,
                        addresses (lat, lng, door_no, street, area, city)
                    ),
                    drivers (*)
                `)
                .eq('id', orderId)
                .single();

            if (error) throw error;
            setOrder(data);

            const addr = data.customers?.addresses?.[0];
            if (addr && addr.lat && addr.lng) {
                setCustomerLocation([addr.lat, addr.lng]);
            }

            if (data.drivers && data.drivers.current_lat && data.drivers.current_lng) {
                setDriverLocation([data.drivers.current_lat, data.drivers.current_lng]);
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOSRMRoute = async (start: [number, number], end: [number, number]) => {
        try {
            const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.routes && data.routes.length > 0) {
                const coords = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
                setRouteCoords(coords);
                
                const distanceKm = data.routes[0].distance / 1000;
                const mins = Math.max(1, Math.round(distanceKm * 4));
                setEta(`${mins} min${mins > 1 ? 's' : ''}`);
            }
        } catch (e) {
            console.error('Error fetching OSRM route:', e);
        }
    };

    useEffect(() => {
        if (customerLocation && driverLocation) {
            fetchOSRMRoute(driverLocation, customerLocation);
        }
    }, [customerLocation]);

    useEffect(() => {
        if (!order?.driver_id) return;

        const channel = supabase
            .channel(`admin-tracking-${orderId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'drivers',
                filter: `id=eq.${order.driver_id}`,
            }, (payload) => {
                if (payload.new.current_lat && payload.new.current_lng) {
                    const newLoc: [number, number] = [payload.new.current_lat, payload.new.current_lng];
                    setDriverLocation(newLoc);
                    if (customerLocation) {
                        fetchOSRMRoute(newLoc, customerLocation);
                    }
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [order?.driver_id, customerLocation]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-20">
                <p className="text-muted-foreground">Order not found.</p>
                <Link to="/admin/orders">
                    <Button variant="link">Back to Deliveries</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/admin/orders">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Order Tracking</h1>
                        <p className="text-sm text-muted-foreground">Order ID: {orderId?.toString().slice(0, 8).toUpperCase()}</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={fetchOrderDetails} className="gap-2">
                    <RotateCcw className="w-4 h-4" /> Refresh
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map Section */}
                <Card className="lg:col-span-2 border-border/50 overflow-hidden min-h-[500px] relative">
                    <MapContainer 
                        center={driverLocation} 
                        zoom={14} 
                        style={{ height: '500px', width: '100%' }}
                        scrollWheelZoom={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <RecenterMap coords={driverLocation} />
                        
                        {customerLocation && (
                            <Marker position={customerLocation} icon={DefaultIcon}>
                                <Popup>
                                    <div className="p-1">
                                        <p className="font-bold text-primary">{order.customers?.full_name}</p>
                                        <p className="text-xs text-muted-foreground">{order.customers?.addresses?.[0]?.area}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        )}

                        <Marker position={driverLocation} icon={DriverIcon}>
                            <Popup>
                                <div className="p-1">
                                    <p className="font-bold text-accent">{order.drivers?.full_name}</p>
                                    <p className="text-xs text-muted-foreground">Delivery Partner</p>
                                </div>
                            </Popup>
                        </Marker>

                        {routeCoords.length > 0 && (
                            <Polyline
                                positions={routeCoords}
                                color="hsl(var(--primary))"
                                weight={4}
                                opacity={0.7}
                                dashArray="10, 10"
                            />
                        )}
                    </MapContainer>
                </Card>

                {/* Details Section */}
                <div className="space-y-6">
                    <Card className="border-border/50 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Estimated Arrival</p>
                                    <h2 className="text-2xl font-black text-primary">{eta}</h2>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-secondary/20 rounded-xl border border-border/50">
                                    <h3 className="text-sm font-bold flex items-center gap-2 mb-2">
                                        <Truck className="w-4 h-4 text-primary" /> Delivery Partner
                                    </h3>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-foreground">{order.drivers?.full_name}</p>
                                            <p className="text-xs text-muted-foreground">{order.drivers?.vehicle_no}</p>
                                        </div>
                                        <a href={`tel:${order.drivers?.phone}`}>
                                            <Button size="icon" variant="outline" className="rounded-full text-green-600 border-green-200 bg-green-50">
                                                <Phone className="w-4 h-4" />
                                            </Button>
                                        </a>
                                    </div>
                                </div>

                                <div className="p-4 bg-secondary/20 rounded-xl border border-border/50">
                                    <h3 className="text-sm font-bold flex items-center gap-2 mb-2">
                                        <MapPin className="w-4 h-4 text-primary" /> Customer Address
                                    </h3>
                                    <p className="text-sm font-medium">{order.customers?.full_name}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {order.customers?.addresses?.[0]?.door_no}, {order.customers?.addresses?.[0]?.street},<br />
                                        {order.customers?.addresses?.[0]?.area}, {order.customers?.addresses?.[0]?.city}
                                    </p>
                                    <p className="text-xs font-bold text-primary mt-2">{order.customers?.mobile}</p>
                                </div>

                                <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                                    <h3 className="text-sm font-bold flex items-center gap-2 mb-2 text-primary">
                                        <Package className="w-4 h-4" /> Order Status
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                        <p className="text-xs font-bold uppercase text-amber-600">{order.status.replace(/_/g, ' ')}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderTracking;
