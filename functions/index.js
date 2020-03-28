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
  .ref('/messages/{roomId}/{pushId}')
  .onCreate((snap, context) => {
    const message = snap.val();
    const name = snap.val().user.name;
    const myId = context.auth.uid;
    let nodeId = context.params.roomId;
    let uid1 = nodeId.slice(0, 28);
    let uid2 = nodeId.slice(28);
    function target() {
      if (myId === uid1) {
        const target = uid2;
        return target;
      } else {
        const target = uid1;
        return target;
      }
    }
    let targetId = target();
    console.log('Node ID:', nodeId, 'myId:', myId, 'targetId:', targetId);
    let payload = {
      notification: {
        title: 'OutfitPic Chat',
        body: `New message from ${name}.`,
        sound: 'default',
      },
    };
    return admin
      .firestore()
      .collection('users')
      .doc(targetId)
      .get()
      .then(doc => {
        pushToken = doc.data().pushToken;
        return admin.messaging().sendToDevice(pushToken, payload);
      });
  });

exports.sendNewFollowerNotification = functions.firestore
  .document('users/{uid}/followers/{followerId}')
  .onCreate((snap, context) => {
    const followerData = snap.data();
    let myId = context.params.uid;
    let followerId = context.params.followerId;
    const followerName = followerData.name;
    console.log('followerId:', followerId, 'follows:', myId);
    let payload = {
      notification: {
        title: 'Hey! You have a new follower',
        body: `${followerName} started following you`,
        sound: 'default',
      },
    };
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
