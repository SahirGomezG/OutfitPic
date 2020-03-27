//import functions from 'firebase-functions';
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// initializes your application
admin.initializeApp(functions.config().firebase);

exports.sendPushNotification = functions.firestore
  .document('outfitPolls/{pollId}')
  .onCreate((snap, context) => {
    const postData = snap.data();
    const author = postData.user.name;
    console.log('PollId:', context.params.pushId, 'Data:', postData);
    let payload = {
      notification: {
        title: 'New OutfitPic Post',
        body: `Hey! new Poll from ${author}, check it out.`,
        sound: 'default',
      },
    };
    let pushToken =
      'eBxLg61a3UFBmvOT9mA-MK:APA91bFJoeCUGODczo7b-KtIKcHOHYP-E4ecM7h5juKztjvW77L2fSUD-TKK_34nriiS9AcTqKTkaxJCOeU9PHfh0nr9eMPCbutNQ0rFVZzellT1EiDbbeerrO2ux9DdT7yYBiS1Iuxq';
    return admin
      .messaging()
      .sendToDevice(pushToken, payload)
      .then(response => {
        return console.log('Successfully sent message:', response);
      })
      .catch(error => {
        return console.log('Error sending message:', error);
      });
  });

exports.pushNotificationChat = functions.database
  .ref('/messages/{pushId}')
  .onCreate((snapshot, context) => {
    // Grab the current value of what was written to the Realtime Database.
    const message = snapshot.val();
    const myId = context.auth.uid;
    let nodeId = context.params.pushId;
    let uid = nodeId.slice(28);
    console.log(
      'Message ID:',
      nodeId,
      'myId:',
      myId,
      'targetId:',
      uid,
      'Message Data:',
      message,
    );
    let payload = {
      notification: {
        title: 'OutfitPic Chat',
        body: 'New message from your friend ',
        sound: 'default',
      },
    };
    let pushToken =
      'c6vZv4DeKU0msgx5oHII_g:APA91bH29ui97WbqtHhDCnYo7iIOf8iQChLJZZfdLsxka8EqjUsnbCqdLMcnOvT5Uir4SfEPPKZ5o6_sNSegj3lcx6l9GHbNhV062_47G9P3Gc7VagaYfQ66hirBHn9QaTyNRkPCVSbI';
    return admin
      .messaging()
      .sendToDevice(pushToken, payload)
      .then(response => {
        return console.log('Successfully sent message:', response);
      })
      .catch(error => {
        return console.log('Error sending message:', error);
      });
  });

exports.sendNewFollowerNotification = functions.firestore
  .document('users/{uid}/followers/{followerId}')
  .onCreate((snap, context) => {
    const followerData = snap.data();
    let myId = context.params.uid;
    //let followerId = context.params.followerId;
    const followerName = followerData.name;
    let payload = {
      notification: {
        title: 'Hey! You have a new follower',
        body: `${followerName} started following you`,
        sound: 'default',
      },
    };
    console.log(payload);
    return admin
      .firestore()
      .collection('users')
      .doc(myId)
      .get()
      .then(doc => {
        pushToken = doc.data().pushToken;
        return admin.messaging().sendToDevice(pushToken, payload);
      });
  });
