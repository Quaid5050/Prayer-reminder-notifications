import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PrayerTimesApi from './namaz-timing-api';
import { scheduleNotificationAsync, registerForPushNotificationsAsync, clearAllNotifications, printScheduledNotifications } from './notificationUtils';

const PrayerTimesScreen = () => {
  const [prayerTimes, setPrayerTimes] = useState(null);

  const fetchPrayerTimes = async () => {
    try {
      // Retrieve old data from AsyncStorage
      const storedTimings = await AsyncStorage.getItem('prayerTimes');
      const storedTimingsObject = JSON.parse(storedTimings);

      PrayerTimesApi().then(async (timings) => {
        if (JSON.stringify(storedTimingsObject) !== JSON.stringify(timings)) {
          // Update AsyncStorage with new data
          await AsyncStorage.setItem('prayerTimes', JSON.stringify(timings));
          console.log('Prayer times updated in AsyncStorage:', timings);
          setPrayerTimes(timings)

          // Register for push notifications
          await registerForPushNotificationsAsync();

          //clear old secheule notifications
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

        } else {
          console.log('Prayer times in AsyncStorage:', storedTimingsObject);
          printScheduledNotifications()
          setPrayerTimes(storedTimingsObject)
        }
      }).catch(() => {
        console.log('Prayer times in AsyncStorage:', storedTimingsObject);
        setPrayerTimes(storedTimingsObject)
      })

    } catch (error) {
      alert('Error', error.message);
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
