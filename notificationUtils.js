import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
    }

    const { data } = await Notifications.getExpoPushTokenAsync({ experienceId: '@your-username/your-app-slug' });
    token = data;
    console.log(token);

    return token;
}



export async function scheduleNotificationAsync(title, body, time) {
    // Split the time into hours and minutes
    const [hours, minutes] = time.split(':');

    // Set the notification time to today's date with the specified time
    const date = new Date();
    date.setHours(hours, minutes, 0);

    // Check if the notification time has already passed for today
    if (date < new Date()) {
        // If it has passed, set the notification time to tomorrow with the specified time
        date.setDate(date.getDate() + 1);
    }

    // Set the notification to repeat every day at the specified time
    const trigger = {
        hour: Number(hours),
        minute: Number(minutes),
        repeats: true, // Set to true to repeat the notification every day
    };

    // Schedule the notification
    try {
        const response = await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                sound: 'default',
                autoDismiss: false,
                sticky: false,
            },
            trigger,
        });
        // console.log(response);

    } catch (error) {
        console.log('error', error);
    }
}



export async function clearAllNotifications() {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log('All notifications cleared.');
    } catch (error) {
        console.log('Error clearing notifications:', error);
    }
}

export async function printScheduledNotifications() {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log(scheduledNotifications);
};
