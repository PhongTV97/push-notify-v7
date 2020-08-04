import React, { Component } from 'react'
import { Text, View } from 'react-native'
import { fcmService } from './src/FCMService';
import { localNotification } from './src/LocalNotificationService'

export default class App extends Component {
  componentDidMount() {
    // fcmService.registerAppWithFCM();
    fcmService.register(this.onRegister, this.onNotification, this.onOpenNotification);
    localNotification.configure(this.onOpenNotification)
  }

  onRegister(token) {
    console.log('token', token);
  }

  onNotification(notify) {
    console.log('new Notifi', notify)
    const options = {
      soundName: 'default',
      playSound: true,
    }
    localNotification.showNotification(0, notify.title, notify.body, notify, options)
  }

  onOpenNotification(notify) {
    console.log('open Notify', notify)
  }

  componentWillUnmount() {
    fcmService.unRegister();
  }

  render() {
    return (
      <View>
        <Text>Test Notify</Text>
      </View>
    )
  }
}
