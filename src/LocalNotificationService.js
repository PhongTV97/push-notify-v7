import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';

class LocalNotificationService {
    configure = (onOpenNotification) => {
        PushNotification.configure({
            onRegister: function (token) {
                console.log('LocalNotificationService onRegister: ', token);
            },
            onNotification: function (notification) {
                console.log('LocalNotificationService onNotification', notification);
                if (!notification?.data) {
                    return
                }
                notification.userInteraction = true;
                onOpenNotification(Platform.OS === 'ios' ? notification.data.item : notification.data);
            },
            permissions: {
                alert: true,
                badge: true,
                sound: true,
            },

            popInitialNotification: true,
            requestPermissions: true
        })
    }

    // unregister = () => {
    //     PushNotification.unregister();
    // }

    showNotification = (id, title, message, data = {}, options = {}) => {
        PushNotification.localNotification({
            ...this.buildAndroidNotification(id, title, message, data, options),
            // ...this.buildIOSNotification(id, title, message, data, options),
            title: title || "",
            message: message || "",
            playSound: options.playSound || false,
            soundName: options.soundName || 'default',
            userInteraction: false
        });
    }

    buildAndroidNotification = (id, title, message, data = {}, options = {}) => {
        return {
            id: id,
            autoCancel: true,
            data: data,
            bigText: message || '',
            subText: title,
        }
    }

    // cancelAllLocalNotifications = () => {
    //     PushNotification.cancelAllLocalNotifications()
    // }

    // removeDeliveredNotificationByID = (notificationId) => {
    //     console.log('removeDeliveredNotificationByID', notificationId);
    //     PushNotification.cancelAllLocalNotifications({ id: `${notificationId}` })
    // }
}

export const localNotification = new LocalNotificationService();
