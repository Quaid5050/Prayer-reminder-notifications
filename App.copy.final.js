import React, { useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleNotificationAsync, registerForPushNotificationsAsync, clearAllNotifications, printScheduledNotifications } from './notificationUtils';

const PrayerTimesScreen = () => {
    useEffect(() => {
        const fetchPrayerTimes = async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    throw new Error('Location permission not granted');
                }

                const currentTime = new Date();
                console.log(currentTime)
                // Calculate prayer times by adding seconds to the current time
                const addSecondsToTime = (time, seconds) => {
                    time.setSeconds(time.getSeconds() + seconds);
                    const hours = String(time.getHours()).padStart(2, '0');
                    const minutes = String(time.getMinutes()).padStart(2, '0');
                    return `${hours}:${minutes}`;
                };

                const timings = {
                    Isha: addSecondsToTime(currentTime, 70),
                    fajar: addSecondsToTime(currentTime, 70 + 70),
                };

                // Register for push notifications
                await registerForPushNotificationsAsync();
                await clearAllNotifications();
                // Schedule notifications for each prayer time
                const scheduleNotifications = async () => {
                    for (const [prayerName, time] of Object.entries(timings)) {
                        const notificationTitle = `Prayer Time - ${prayerName}`;
                        const notificationBody = `It's time for ${prayerName} prayer (${time})`;

                        await scheduleNotificationAsync(notificationTitle, notificationBody, time);
                    }
                };

                await scheduleNotifications();
                await printScheduledNotifications();

                // Store timings in AsyncStorage
                await AsyncStorage.setItem('prayerTimes', JSON.stringify(timings));
            } catch (error) {
                Alert.alert('Error', error.message);
            }
        };

        // Fetch prayer times and schedule notifications when the component mounts
        fetchPrayerTimes();
    }, []);

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>Prayer Times Screen</Text>
        </View>
    );
};

export default PrayerTimesScreen;
