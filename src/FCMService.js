import messaging from '@react-native-firebase/messaging';
import { Platform, Linking, Alert, PermissionsAndroid } from 'react-native';

// Foreground	When the application is open and in view.
// Background	When the application is open, however in the background(minimised).This typically occurs when the user has pressed the "home" button on the device or has switched to another app via the app switcher.
// Quit	When the device is locked or application is not active or running.The user can quit an app by "swiping it away" via the app switcher UI on the device.

class FCMService {
    register = (onRegister, onNotification, onOpenNotification) => {
        this.checkPermission(onRegister)
        this.createNotificationListeners(onRegister, onNotification, onOpenNotification)
    }

    // registerAppWithFCM = async () => {
    //     if (Platform.OS === 'ios') {
    //         await messaging.registerDeviceForRemoteMessages();
    //         await messaging.setAutoInitEnabled(true);
    //     }
    // }

    //Kiểm tra quyền: phải yêu cầu quyền thông báo ứng dụng trong Alert Dialog
    checkPermission = (onRegister) => {
        messaging().hasPermission().then(enabled => {
            if (enabled) {
                this.getToken(onRegister)
            } else {
                console.log('Ko có quyền')
                // Nếu chưa có thì xin cấp quyền
                Alert.alert(
                    "Warning",
                    "Bật tính năng nhận thông báo!",
                    [
                        {
                            text: "Cancel",
                            onPress: () => console.log("Cancel Pressed"),
                            style: "cancel"
                        },
                        {
                            text: "OK", onPress: () => Linking.openSettings()
                        }
                    ],
                    { cancelable: false }
                );
                // const granted = PermissionsAndroid.request(
                //     PermissionsAndroid.PERMISSIONS.CAMERA,
                //     {
                //         title: "Cool Photo App Camera Permission",
                //         message:
                //             "Cool Photo App needs access to your camera " +
                //             "so you can take awesome pictures.",
                //         buttonNeutral: "Ask Me Later",
                //         buttonNegative: "Cancel",
                //         buttonPositive: "OK"
                //     }
                // );
                // this.requestPermission(onRegister)
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

    //request quyền nhận thống báo của ứng dụng
    requestPermission = (onRegister) => {
        console.log('xin quyền1');
        messaging().requestPermission().then(() => {
            console.log('xin quyền2');
            this.getToken(onRegister)
        }).catch(err => console.log(err))
    }

    createNotificationListeners = (onRegister, onNotification, onOpenNotification) => {
        // Bắt sự kiện khi có notify được push đến và app đang ở trạng thái Foreground
        messaging().onNotificationOpenedApp(remoteMessage => {
            console.log('Có notify đến onNotificationOpenedApp: ', remoteMessage);
            if (remoteMessage) {
                const notification = remoteMessage.notification
                onOpenNotification(notification)
            }
        });

        // Luôn return null
        messaging().getInitialNotification().then(remoteMessage => {
            console.log('Có notify đến getInitialNotification: ', remoteMessage);
            if (remoteMessage) {
                const notification = remoteMessage.notification
                onOpenNotification(notification)
            }
        });

        //Foreground state message
        this.messageListener = messaging().onMessage(remoterMessage => {
            console.log('Có notify đến Foreground State: ', remoterMessage);
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