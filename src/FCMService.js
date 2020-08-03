import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

class FCMService {
    register = (onRegister, onNotification, onOpenNotification) => {
        this.checkPermission(onRegister)
        this.createNotificationListeners(onRegister, onNotification, onOpenNotification)
    }

    registerAppWithFCM = async () => {
        if (Platform.OS === 'ios') {
            await messaging.registerDeviceForRemoteMessages();
            await messaging.setAutoInitEnabled(true);
        }
    }

    checkPermission = (onRegister) => {
        messaging().hasPermission().then(enabled => {
            if (enabled) {
                this.getToken(onRegister)
            } else {
                this.requestPermission(onRegister)
            }
        }).catch(err => console.log('Permission reject'))
    }

    getToken = (onRegister) => {
        messaging().getToken().then(fcmToken => {
            if (fcmToken) {
                onRegister(fcmToken)
            } else {
                console.log('User does not have a device token');
            }
        }).catch(err => {
            console.log(err);
        })
    }

    requestPermission = (onRegister) => {
        messaging().requestPermission().then(() => {
            this.getToken(onRegister)
        }).catch(err => console.log(err))
    }

    createNotificationListeners = (onRegister, onNotification, onOpenNotification) => {
        messaging().onNotificationOpenedApp(remoteMessage => {
            console.log('onNotificartionOpenedApp Notification');
            if (remoteMessage) {
                const notification = remoteMessage.notification
                onOpenNotification(notification)
            }
        });

        messaging().getInitialNotification().then(remoteMessage => {
            console.log('getInitialNotification');
            if (remoteMessage) {
                const notification = remoteMessage.notification
                onOpenNotification(notification)
            }
        });

        //Foreground state message
        this.messageListener = messaging().onMessage(async remoterMessage => {
            console.log('A new FCM message arrived! ', remoterMessage);
            if (remoterMessage) {
                let notification = null
                if (Platform.OS === 'ios') {
                    notification = remoterMessage.data.notification
                } else {
                    notification = remoterMessage.notification
                }
                onNotification(notification)
            }
        });

        //Trigger when have new token
        messaging().onTokenRefresh(fcmToken => {
            console.log('New Token Refresh: ', fcmToken);
            onRegister(fcmToken)
        })
    }

    unRegister() {
        this.messageListener();
    }
}

export const fcmService = new FCMService();