
import * as Location from 'expo-location';

export default async function PrayerTimesApi() {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
            throw new Error('Location permission not granted');
        }

        //now i get user location lat and long
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
        if (data) {
            if (data.status == "OK") {
                const timings = data.data.timings;
                return timings;
            } else {
                console.log("API request fail")
            }
        }
    } catch (error) {
        console.log(error)
    }
}