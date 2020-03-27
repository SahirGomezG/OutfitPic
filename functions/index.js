//import functions from 'firebase-functions';
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// initializes your application
admin.initializeApp(functions.config().firebase);

exports.sendPushNotification = functions.firestore
  .document('outfitPolls/{pollId}')
  .onCreate(event => {
    const writeData = event.data.data();
    let payload = {
      notification: {
        title: 'New Poll from: ',
        body: writeData.user.name,
        sound: 'default',
        badge: '',
      },
    };
    let pushToken =
      'eBxLg61a3UFBmvOT9mA-MK:APA91bFJoeCUGODczo7b-KtIKcHOHYP-E4ecM7h5juKztjvW77L2fSUD-TKK_34nriiS9AcTqKTkaxJCOeU9PHfh0nr9eMPCbutNQ0rFVZzellT1EiDbbeerrO2ux9DdT7yYBiS1Iuxq';
    admin.messaging().sendToDevice(pushToken, payload);
  });
