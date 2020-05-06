const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const cors = require('cors')({origin: true});
const env = functions.config();

const Airtable = require('airtable');
const base = new Airtable({apiKey: env.airtable.key}).base('app7y6N1SbXPG73PR');

// initializes your application
admin.initializeApp(functions.config().firebase);

// Here we're using Gmail to send
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sahir@limekee.com',
    pass: 'nhvtkjzgodzlfwwt',
  },
});

exports.addToAirtable = functions.firestore
  .document('users/{uid}')
  .onCreate((snap, context) => {
    const data = snap.data();
    const uid = context.params.uid;
    const email = snap.data().email;
    const name = snap.data().name;
    const avatar = snap.data().avatar;
    const pushToken = snap.data().pushToken;
    const date = new Date();

    let airtableData = {
      id: uid,
      email: email,
      name: name,
      avatar: avatar,
      joined: date,
      pushToken: pushToken,
    };
    console.log(airtableData);
    return base('Table 1').create(data, (err, records) => {
      if (err) {
        console.error(err);
        return;
      }
    });
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

// ---- When there is a new public post

exports.sendNewPollNotification = functions.firestore
  .document('outfitPolls/{pollId}')
  .onCreate((snap, context) => {
    const postData = snap.data();
    const author = postData.user.name;
    const uid = postData.uid;
    const privatePoll = postData.privatePoll;
    let payload = {
      notification: {
        title: 'New OutfitPic Post',
        body: `Hey! new Poll from ${author}, check it out.`,
        sound: 'default',
      },
    };

    if (privatePoll === false) {
      return admin
        .firestore()
        .collection('users')
        .limit(40)
        .get()
        .then(snapshot => {
          const tokens = [];
          snapshot.forEach(user => {
            const userKey = user.id;
            const token = user.data().pushToken;
            const option4 = user.data().notificationSettings.option4;
            // get other user tokens except the sender and verify user allows the notification
            if (userKey !== uid && option4 === true) tokens.push(token);
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
    } else {
      return null;
    }
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
      html: `<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" style="background:#f1f1f1;margin:0 auto !important;padding:0 !important;height:100% !important;width:100% !important;">
      <head>
        <meta charset="utf-8"> <!-- utf-8 works for most cases -->
        <meta name="viewport" content="width=device-width"> <!-- Forcing initial-scale shouldn't be necessary -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine -->
        <meta name="x-apple-disable-message-reformatting">  <!-- Disable auto-scale in iOS 10 Mail entirely -->
        <title>Welcome to OutfitPic</title> <!-- The title tag shows in email notifications, like Android 4.4. -->
        <!-- CSS Reset : BEGIN -->
        <!-- CSS Reset : END -->
        <!-- Progressive Enhancements : BEGIN -->
        <style>
          .heading-section .subheading::after{position:absolute;left:0;right:0;bottom:-10px;content:'';width:100%;height:2px;background:#ffc0d0;margin:0 auto}
        </style>
        <style type="text/css">
          /* What it does: Remove spaces around the email design added by some email clients. */
                  /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
          /* What it does: Stops email clients resizing small text. */
          /* What it does: Centers email on Android 4.4 */
          /* What it does: Stops Outlook from adding extra spacing to tables. */
          /* What it does: A work-around for email clients meddling in triggered links. */
          *[x-apple-data-detectors],  /* iOS */
          .unstyle-auto-detected-links *,
          .aBn {
              border-bottom: 0 !important;
              cursor: default !important;
              color: inherit !important;
              text-decoration: none !important;
              font-size: inherit !important;
              font-family: inherit !important;
              font-weight: inherit !important;
              line-height: inherit !important;
          }
          /* Create one of these media queries for each additional viewport size you'd like to fix */
          /* iPhone 4, 4S, 5, 5S, 5C, and 5SE */
          @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
              u ~ div .email-container {
                  min-width: 320px !important;
              }
          }
          /* iPhone 6, 6S, 7, 8, and X */
          @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
              u ~ div .email-container {
                  min-width: 375px !important;
              }
          }
          /* iPhone 6+, 7+, and 8+ */
          @media only screen and (min-device-width: 414px) {
              u ~ div .email-container {
                  min-width: 414px !important;
              }
          }
          /*LOGO*/
          /*HEADING SECTION*/
          @media screen and (max-width: 500px) {
          }
        </style>
      </head>
      <body width="100%" style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;background:#f1f1f1;font-family:'Helvetica Neue', sans-serif;font-weight:300;font-size:15px;line-height:1.8;color:rgba(0,0,0,.5);margin:0 auto !important;padding:0 !important;height:100% !important;width:100% !important;margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #222222;">
        <center style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;width: 100%; background-color: #f1f1f1;">
          <div style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;display: none; font-size: 1px;max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
            &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
        </div>
          <div style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;max-width: 600px; margin: 0 auto;" class="email-container">
            <!-- BEGIN BODY -->
            <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;mso-table-lspace:0pt !important;mso-table-rspace:0pt !important;border-spacing:0 !important;border-collapse:collapse !important;table-layout:fixed !important;margin:0 auto !important;margin: auto;">
              <tr style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                <td valign="top" style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;mso-table-lspace:0pt !important;mso-table-rspace:0pt !important;padding: 1em 2.5em 0 2.5em; background: #E8EDF2;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;mso-table-lspace:0pt !important;mso-table-rspace:0pt !important;border-spacing:0 !important;border-collapse:collapse !important;table-layout:fixed !important;margin:0 auto !important;">
                    <tr style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                      <td style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;mso-table-lspace:0pt !important;mso-table-rspace:0pt !important;text-align: center;">
                        <h1 style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;font-family:'Helvetica Neue', sans-serif;color:#000000;margin-top:0;font-weight:200;font-family: 'Helvetica Neue'; font-size: 25px; font-weight: 200; color: #000000;"> Hi! </h1>
                        <h1 style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;font-family:'Helvetica Neue', sans-serif;color:#000000;margin-top:0;font-weight:200;font-family: 'Helvetica Neue'; font-size: 25px; font-weight: 200; color: #000000;">Welcome to OutfitPic</h1>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- end tr -->
              <tr style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                <td valign="top" style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;mso-table-lspace:0pt !important;mso-table-rspace:0pt !important;background: #E8EDF2;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;mso-table-lspace:0pt !important;mso-table-rspace:0pt !important;border-spacing:0 !important;border-collapse:collapse !important;table-layout:fixed !important;margin:0 auto !important;">
                    <td valign="middle" width="60%" style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;mso-table-lspace:0pt !important;mso-table-rspace:0pt !important;padding-top: 10px; text-align: center;">
                      <img src="https://lh3.googleusercontent.com/wQQVDs28nXjn9iX1hvuDKP9se5MH2-zFOuZMiBiFP-to-Vha9N6P_pqRw7rhHcYdVZRFiSyorOp4bMzXrpC83m-8phM" alt="logo" width="80" height="80" style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-interpolation-mode:bicubic;"/>
                            
                      <h3 class="heading" style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;font-family:'Helvetica Neue', sans-serif;color:#000000;margin-top:0;font-weight:200;">....</h3>
                    </td>
                  </table>
                </td>
              </tr>
              <!-- end tr https://lh3.googleusercontent.com/bjj04tKLkjRr13o0EV9s5aMce35EJzegxPnzT5Gvr6VKdKW9b2Nm7yis8aFP9CO808vYuwKRulRicYqXvKQCkk6U -->
              <tr style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                <td valign="middle" style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;mso-table-lspace:0pt !important;mso-table-rspace:0pt !important;position: relative; z-index: 0; background-image: url('https://lh3.googleusercontent.com/9JPC2Q0kPfZDfr9v9nH5g06JWGRFssCQLLzMX3iMAcO23Gq6Or2Y8Xq7LDnXbpBIUD9ALHwqg02RM5NcRBrpN_ZnqEU'); background-size: cover; height: 400px;">
                  <div style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;position: absolute; top: 0; left: 0; right: 0;bottom: 0; content: ''; width: 100%; background: #000000; z-index: -1; opacity: .4;"></div>
                  <table style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;mso-table-lspace:0pt !important;mso-table-rspace:0pt !important;border-spacing:0 !important;border-collapse:collapse !important;table-layout:fixed !important;margin:0 auto !important;">
                    <tr style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                      <td style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;mso-table-lspace:0pt !important;mso-table-rspace:0pt !important;">
                        <div style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;padding: 0 4em; text-align: center; color: rgba(255,255,255,.9); max-width: 50%; margin: 0 auto 0;">
                          <h2 style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;font-family:'Helvetica Neue', sans-serif;color:#000000;margin-top:0;font-weight:200;font-family: 'Helvetica Neue';color: #fff; font-size: 25px; margin-bottom: 0; font-weight: 300; line-height: 1.4; ;">Be the best dressed!</h2>
                          <p style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;font-family: 'Helvetica Neue';color: #fff; font-weight: 200; ;"> Now friends and no friends can help you choose the outfit you are still unsure about. Yes, the one is going to make you look the coolest.</p>
                          <p style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                            <a href="https://outfitpic.app" style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;text-decoration:none;color:#ffc0d0;padding: 5px 20px; display: inline-block; border-radius: 5px; background: #3E394D; color: #ffffff;">It's a win win.</a>
                          </p>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- end tr -->
              <tr style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                <td valign="middle" style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;mso-table-lspace:0pt !important;mso-table-rspace:0pt !important;padding: 2em 0 4em 0; background: #E8EDF2;">
                  <table style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;mso-table-lspace:0pt !important;mso-table-rspace:0pt !important;border-spacing:0 !important;border-collapse:collapse !important;table-layout:fixed !important;margin:0 auto !important;">
                    <tr style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
                      <td style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;mso-table-lspace:0pt !important;mso-table-rspace:0pt !important;">
                        <div style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;padding: 0 2.5em; text-align: center; color: rgba(255,255,255,.9); max-width: 90%; margin: 0 auto 0;">
                          <h3 style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;font-family:'Helvetica Neue', sans-serif;color:#000000;margin-top:0;font-weight:200;font-family: 'Helvetica Neue';font-weight: 200; margin-bottom:50px;">Let's start a fashion trend today</h3>
                          <p style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;font-family: 'Helvetica Neue';font-weight: 200;">
                            <a href="https://outfitpic.app/contact" style="-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;text-decoration:none;color:#ffc0d0;border-radius: 5px; background: transparent; border: 2px solid #3E394D; color: #000; font-weight: 200; padding: 10px;">Have questions?</a>
                          </p>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </div>
        </center>
      </body>
    </html>`, // email content in HTML
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
