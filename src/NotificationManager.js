import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import {Platform} from 'react-native'
//import firebase from 'react-native-firebase';
//import { openDrawer } from 'react-navigation-drawer/lib/typescript/src/routers/DrawerActions';


class NotificationManager {

    configure = ( onRegister, onNotification, onOpenNotification, senderID) => {
        PushNotification.configure({
            // (optional) Called when Token is generated (iOS and Android)
            onRegister: function(token) {
              onRegister(token)  
              console.log('[NotificationManager] onRegister token:', token);
            },

            onNotification: function(notification) {
                console.log("[NotificationManager] onNotification:", notification);

                if (Platform.OS === 'ios') {
                    if (notification.data.openedInForeground) {
                        notification.userInteraction = true
                    } 
                } 
                
                if (notification.userInteraction) {
                    onOpenNotification(notification)
                } else {
                    onNotification(notification)
                }

                if (Platform.OS === 'android') {
                    notification.userInteraction = true 
                } 
            
                // process the notification

                if (Platform.OS === 'ios') {
                    if (!notification.data.openedInForeground) {
                        notification.finish('UIBackgroundFetchResultNoData')
                    }
                } else {
                    notification.finish('UIBackgroundFetchResultNoData');
                }           
            },
            permissions: {
                alert: true,
                badge: true,
                sound: true
            },
            popInitialNotification: true,
            // ANDROID ONLY: GCM or FCM Sender ID (product_number) (optional - not required for local notifications, but is need to receive remote push notifications)
            senderID: senderID,
        })
    };

    _buildAndroidNotification = (id, title, message, data = {}, options = {}) => {
        return {
            id: id,
            autoCancel: true,
            largeIcon: options.largeIcon || "ic_launcher",
            smallIcon: options.smallIcon || "ic_launcher",
            bigText : message || '',
            subText : title || '',
            vibrate: options.vibrate || false, 
            vibration: options.vibration || 300, 
            priority: options.priority || "high",
            importance: options.importance || "high",
            data: data
        }
    }

    _buildIOSNotification = (id, title, message, data = {}, options = {}) => {
        return {
            alertAction: options.alertAction || 'view',
            category: options.category || '',
            userInfo: {
                id: id,
                item: data,
            }    
        }
    }

    showNotification = (id, title, message, data = {}, options = {}) => {
        PushNotification.localNotification({
            /* Android Only Properties */
            ...this._buildAndroidNotification(id, title, message, data, options),
            /* iOS only properties */
            ...this._buildIOSNotification(id, title, message, data, options),
            /* iOS and Android properties */
            title: title || '',
            message: message || '',
            playSound: options.playSound || true,
            soundName: options.soundName || 'default',
            userInteraction: false //if the notification was opened  by the user from the notification area or not
        })
    }
    
    cancelAllLocalNotification = () => {
        if (Platform.OS === 'ios') {
            PushNotificationIOS.removeAllDeliveredNotifications()
        } else {
            PushNotification.cancelAllLocalNotifications()
        }
    }

    unregister = () => {
        PushNotification.unregister()
    }

} 

export const notificationManager = new NotificationManager()