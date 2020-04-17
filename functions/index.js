//import functions from 'firebase-functions';
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const cors = require('cors')({origin: true});

// initializes your application
admin.initializeApp(functions.config().firebase);

/**
 * Here we're using Gmail to send
 */
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sahir@limekee.com',
    pass: 'nhvtkjzgodzlfwwt',
  },
});

// ------ When someone starts following me: Option 1
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
        option1 = doc.data().notificationSettings.option1;
        if (option1 === true) {
          return admin.messaging().sendToDevice(pushToken, payload);
        } else {
          return null;
        }
      });
  });

// ------ When someone leaves a comment in my posts: Option 2
exports.sendNewCommentNotification = functions.firestore
  .document('outfitPolls/{pollId}/comments/{commentId}')
  .onCreate((snap, context) => {
    const commentData = snap.data();
    const commentText = commentData.text;
    let pollId = context.params.pollId;
    let payload = {
      notification: {
        title: 'Your post has a new comment.',
        body: commentText,
        sound: 'default',
      },
    };
    return admin
      .firestore()
      .collection('outfitPolls')
      .doc(pollId)
      .get()
      .then(doc => {
        const authorId = doc.data().uid;
        console.log('PollId:', pollId, 'newComment:', commentText);
        return admin
          .firestore()
          .collection('users')
          .doc(authorId)
          .get();
      })
      .then(doc => {
        pushToken = doc.data().pushToken;
        option2 = doc.data().notificationSettings.option2;
        if (option2 === true) {
          return admin.messaging().sendToDevice(pushToken, payload);
        } else {
          return null;
        }
      });
  });

// ------ When someone likes my posts: Option 3
exports.sendNewLikeNotification = functions.firestore
  .document('outfitPolls/{pollId}/likes/{likedBy}')
  .onCreate((snap, context) => {
    const like = snap.data();
    const likedBy = like.user.name;
    let pollId = context.params.pollId;
    let payload = {
      notification: {
        title: 'New like! 😀',
        body: `${likedBy} likes your outfits.`,
        sound: 'default',
      },
    };
    return admin
      .firestore()
      .collection('outfitPolls')
      .doc(pollId)
      .get()
      .then(doc => {
        const authorId = doc.data().uid;
        console.log('PollId:', pollId, 'liked by:', context.params.likedBy);
        return admin
          .firestore()
          .collection('users')
          .doc(authorId)
          .get();
      })
      .then(doc => {
        pushToken = doc.data().pushToken;
        option3 = doc.data().notificationSettings.option3;
        if (option3 === true) {
          return admin.messaging().sendToDevice(pushToken, payload);
        } else {
          return null;
        }
      });
  });

// ------ When someone I follow makes a new post: Option 4
exports.sendPushToFollowers = functions.firestore
  .document('outfitPolls/{pollId}')
  .onCreate((snap, context) => {
    const postData = snap.data();
    const uid = postData.uid;
    const author = postData.user.name;
    let payload = {
      notification: {
        title: 'New OutfitPic Post',
        body: `Hey! new Poll from ${author}, check it out.`,
        sound: 'default',
      },
    };

    return admin
      .firestore()
      .collection('users')
      .doc(uid)
      .collection('followers')
      .limit(30)
      .get()
      .then(snapshot => {
        const tokens = [];
        snapshot.forEach(user => {
          const userKey = user.id;
          const token = user.data().pushToken;
          // get other user tokens except the sender
          if (userKey !== uid && token) tokens.push(token);
        });
        console.log('tokens', tokens);
        return Promise.all(tokens);
      })
      .then(tokens => {
        const pushtokens = tokens;
        return admin
          .messaging()
          .sendToDevice(pushtokens, payload)
          .catch(console.error);
      });
  });

// ------ When I receive a new private chat message: Option 5
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
        option5 = doc.data().notificationSettings.option5;
        if (option5 === true) {
          return admin
            .messaging()
            .sendToDevice(pushToken, payload)
            .catch(console.error);
        } else {
          return null;
        }
      });
  });

exports.recentActivity = functions.firestore
  .document('users/{uid}/following/{followingId}')
  .onCreate((snap, context) => {
    const followingData = snap.data();
    let myId = context.params.uid;
    let followingId = context.params.followingId;
    const followingName = followingData.name;
    console.log('now following:', followingName, 'my Id:', myId);

    return admin
      .firestore()
      .collection('users')
      .doc(myId)
      .update({lastActivity: followingName})
      .catch(console.error);
  });

exports.activeChatCollection = functions.database
  .ref('/messages/{roomId}/{pushId}')
  .onCreate((snap, context) => {
    const message = snap.val().text;
    const timestamp = snap.val().timestamp;
    const name = snap.val().user.name;
    const avatar = snap.val().user.avatar;
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
    console.log('Message:', message, 'myId:', myId, 'targetId:', targetId);

    return admin
      .firestore()
      .collection('users')
      .doc(targetId)
      .get()
      .then(doc => {
        targetName = doc.data().name;
        targetAvatar = doc.data().avatar;
        return admin
          .firestore()
          .collection('users')
          .doc(myId)
          .collection('chats')
          .doc(targetId)
          .set({
            name: targetName,
            id: targetId,
            avatar: targetAvatar,
            chatKey: nodeId,
            message: message,
            timestamp: timestamp,
          });
      })
      .then(() => {
        console.log('Almost done');
        return admin
          .firestore()
          .collection('users')
          .doc(targetId)
          .collection('chats')
          .doc(myId)
          .set({
            name: name,
            id: myId,
            avatar: avatar,
            chatKey: nodeId,
            message: message,
            timestamp: timestamp,
          })
          .catch(console.error);
      });
  });

exports.sendWelcomeEmail = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    // getting dest email by query string
    const dest = req.query.dest;

    const mailOptions = {
      from: 'OutfitPic <noreply@outfitpic.app>', // Something like: Jane Doe <janedoe@gmail.com>
      to: dest,
      subject: 'Welcome to OutfitPic!', // email subject
      html: `<p style="font-size: 16px;">Hi friend!</p>
              <br />
              <img src="https://lh3.googleusercontent.com/ezHSPDyNTvoHDtuzBAS5T-BnIVeIG6FWw_X-3lb28PqWpoqe6vzkhENbIXU0_ZOz1Ilr3B5AT-Ao90QyFIVpIbMUUBw" />
          `, // email content in HTML
    };

    // returning result
    return transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.send(error.toString());
      }
      return res.send('Sended');
    });
  });
});
