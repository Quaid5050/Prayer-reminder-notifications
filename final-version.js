import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PrayerTimesScreen = () => {
    const [prayerTimes, setPrayerTimes] = useState(null);

    const fetchPrayerTimes = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                throw new Error('Location permission not granted');
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            const currentDate = new Date();
            const day = String(currentDate.getDate()).padStart(2, '0');
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const year = String(currentDate.getFullYear());

            const formattedDate = `${day}-${month}-${year}`;
            const method = 2;

            const url = `http://api.aladhan.com/v1/timings/${formattedDate}?latitude=${latitude}&longitude=${longitude}&method=${method}`;
            //const url = "http://api.aladhan.com/v1/timingsByCity?city=karachi&country=Pakistan&method=8"
            const response = await fetch(url);
            const data = await response.json();
            const timings = data.data.timings;

            // Retrieve old data from AsyncStorage
            const storedTimings = await AsyncStorage.getItem('prayerTimes');
            const storedTimingsObject = JSON.parse(storedTimings);

            // Check if the new data is different from the old data
            if (JSON.stringify(storedTimingsObject) !== JSON.stringify(timings)) {
                // Update AsyncStorage with new data
                await AsyncStorage.setItem('prayerTimes', JSON.stringify(timings));
                console.log('Prayer times updated in AsyncStorage:', timings);
                setPrayerTimes(timings)
            } else {
                console.log('Prayer times in AsyncStorage:', storedTimingsObject);
                setPrayerTimes(storedTimingsObject)
            }

            ;
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    useEffect(() => {
        // Fetch prayer times when the component mounts
        fetchPrayerTimes();
    }, []);

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {prayerTimes ? (
                Object.entries(prayerTimes).map(([prayerName, time]) => (
                    <Text key={prayerName}>
                        {prayerName}: {time}
                    </Text>
                ))
            ) : (
                <Text>No prayer times available</Text>
            )}
        </View>
    );
};

export default PrayerTimesScreen;
