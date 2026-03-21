import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { supabase } from './lib/supabase';

export const LOCATION_TRACKING_TASK = 'LOCATION_TRACKING_TASK';

export async function startBackgroundLocation(driverId: string) {
    const { status } = await Location.requestBackgroundPermissionsAsync();
    if (status !== 'granted') {
        console.error('Background location permission denied');
        return false;
    }

    await Location.startLocationUpdatesAsync(LOCATION_TRACKING_TASK, {
        accuracy: Location.Accuracy.High,
        timeInterval: 15000,
        distanceInterval: 10,
        foregroundService: {
            notificationTitle: "Astra Delivery",
            notificationBody: "Sharing location for active delivery",
            notificationColor: "#1B4D3E",
        },
    });

    // Store driver ID globally or in a way the task can access it
    // For now, we'll use a hack or assume the task can get it from somewhere
    (global as any).currentDriverId = driverId;
    return true;
}

export async function stopBackgroundLocation() {
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TRACKING_TASK);
    if (hasStarted) {
        await Location.stopLocationUpdatesAsync(LOCATION_TRACKING_TASK);
    }
}

TaskManager.defineTask(LOCATION_TRACKING_TASK, async ({ data, error }: any) => {
    if (error) {
        console.error('Background Location Error:', error);
        return;
    }
    if (data) {
        const { locations } = data;
        const [location] = locations;
        if (location) {
            const driverId = (global as any).currentDriverId;
            if (driverId) {
                await supabase
                    .from('drivers')
                    .update({
                        current_lat: location.coords.latitude,
                        current_lng: location.coords.longitude,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', driverId);
            }
        }
    }
});
