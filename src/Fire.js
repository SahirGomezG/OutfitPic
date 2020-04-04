import config from "./config";
import firebase from 'firebase';
import { Alert } from 'react-native';
import * as firebasenative from 'react-native-firebase';
require("firebase/firestore");

class Fire {

// ----- Initialize Firebase -----
    constructor() {
        if (!firebase.apps.length){
            firebase.initializeApp(config.firebaseKeys);
        };
        //this.checkAuth();
    }

    addPost = async ({ text, localUri, user }) => {
        const path = `photos/${this.uid}/${Date.now()}`;
        const remoteUri = await this.uploadPhotoAsync(localUri, path);

        return new Promise((res, rej) => {
            this.firestore
                .collection("posts")
                .add({
                    text,
                    uid: this.uid,
                    user: user,
                    timestamp: this.timestamp,
                    image: remoteUri
                })
                .then(ref => {
                    res(ref);
                })
                .catch(error => {
                    rej(error);
                });
        });
    };
    
    addOutfitPic = async ({ text, images, user, duration, privatePoll, blockComments, followers}) => {
        let fireArray = [];
        let votes = {'0':0,'1':0,'2':0};
        for ( let i=0; i<images.length; i++){
            const path = `outfitPolls/${this.uid}/${Date.now()}`;
            const remoteUri1 = await this.uploadPhotoAsync(images[i].url, path);
            let item = {
              id: i,
              url: remoteUri1,
             };
            fireArray.push(item); 
        };
        return new Promise((res, rej) => {
          let userRef = this.firestore.collection("users").doc(this.uid);

          const increment = firebase.firestore.FieldValue.increment(1);
            this.firestore
                .collection("outfitPolls")
                .add({
                    text,
                    uid: this.uid,
                    user: user,
                    timestamp: this.timestamp,
                    images: fireArray,
                    duration: duration,
                    privatePoll: privatePoll,
                    blockComments: blockComments,
                    votes: votes,
                    followers: followers,
                })
                .then(ref => {
                  userRef.update({ numPosts: increment });
                  res(ref);
                })
                .catch(error => {
                  rej(error);
                });
        });
    }

    // Function to login anonymously
    checkAuth = () => {
        firebase.auth().onAuthStateChanged(user => {
            if (!user) {
                firebase.auth().signInAnonymously();
            }
        });
    };

    uploadPhotoAsync = async (uri,filename) => {
        const path = `photos/${this.uid}/${Date.now()}.jpg`;

        return new Promise(async (res, rej) => {
            const response = await fetch(uri);
            const file = await response.blob();

            let upload = firebase
                .storage()
                .ref(filename)
                .put(file);

            upload.on(
                "state_changed",
                snapshot => {},
                err => {
                    rej(err);
                },
                async () => {
                    const url = await upload.snapshot.ref.getDownloadURL();
                    res(url);
                }
            );
        });
    };

    createUser = async (user) => {
        let remoteUri= null;
        var currentUser = firebase.auth().currentUser;
        let userName = user.name.toLowerCase();
        const FCM = firebasenative.messaging();
        let notificationSettings = {option1: true, option2: true, option3: true, option4: true, option5: true};

        try { 
            await firebase.auth().createUserWithEmailAndPassword(user.email, user.password);
            let db = this.firestore.collection("users").doc(this.uid);
            db.set({
                name: userName,
                email: user.email,
                joined: this.creationTime,
                avatar: null,
                notificationSettings: notificationSettings,
                pushToken: '',
            });
            FCM.getToken()
                .then(token => { db.update({ pushToken: token })})
                .catch(error => { 'Error:', error });
            if (user.avatar) {
                remoteUri = await this.uploadPhotoAsync(user.avatar, `avatars/${this.uid}`);
                db.set({ avatar: remoteUri }, { merge: true });
            }
        } catch (error) {
            Alert.alert("Ops! ", error.message);
        }
    };
    
    updateAvatar = async (photoUri) => {
        const path = `avatars/${this.uid}/${Date.now()}`;
        const remoteUri = await this.uploadPhotoAsync(photoUri, path);
        try { 
            let db = this.firestore.collection("users").doc(this.uid);
            db.update({ avatar: remoteUri });
            alert ('Your profile pic was updated');
        } 
		catch (error) {
            alert("Error: ", error);
        }
    };
    
    updateProfileInfo =  async (bio, gender, name) => {
        let userName = name.toLowerCase();
        try { 
            let db = this.firestore.collection("users").doc(this.uid);
            db.update({
                bio: bio,
                gender: gender,
                name: userName
            });    
		} 
		catch (error) {
            alert("Error: Please fill out all the fields ", error);
        }
    }
    
    updateNotificationSettings =  async (option1, option2, option3, option4, option5) => {
        try { 
            let db = this.firestore.collection("users").doc(this.uid);
            db.update({
                'notificationSettings.option1':option1,
                'notificationSettings.option2':option2,
                'notificationSettings.option3':option3,
                'notificationSettings.option4':option4,
                'notificationSettings.option5':option5,
            });    
		} 
		catch (error) {
            alert("Error: Please try later. ", error);
        }
    }
		
	addComment = async ( outfitPic, text, user ) => {
        return new Promise((res, rej) => {
            let pollRef = this.firestore.collection("outfitPolls").doc(outfitPic);
            let db = pollRef.collection('comments');
            const increment = firebase.firestore.FieldValue.increment(1);
                db.add({ 
					text,
					user,
					timestamp: this.timestamp
	    		})
                .then(ref => {
                    pollRef.update({ numComments: increment });
					res(ref);
                })
                .catch(error => {
                    rej(error);
                });
        });
	};
		
	followUser = async ( targetUserId, targetName, myName, targetAvatar, myAvatar, targetToken, myToken ) => {  
		return new Promise((res, rej) => {
            let userRef = this.firestore.collection("users").doc(this.uid);
            let followingRef = userRef.collection('following').doc(targetUserId);
            let targetUserRef = this.firestore.collection("users").doc(targetUserId);
            let followerRef = targetUserRef.collection('followers').doc(this.uid);
            const increment = firebase.firestore.FieldValue.increment(1);
            const batch = this.firestore.batch();

            batch.set( followingRef, ({ id: targetUserId, name: targetName, avatar: targetAvatar, pushToken: targetToken }));
            batch.set( followerRef, ({ id: this.uid, name: myName, avatar: myAvatar, pushToken: myToken }));
            batch.commit()
            .then(ref => {
              userRef.update({ numFollowing: increment });
              targetUserRef.update ({ numFollowers : increment });
              res(ref);
            })
            .catch(error => {
                rej(error);
            });
			});
    };
    
    toUnfollowUser = async ( targetUser ) => {
      return new Promise((res, rej) => {
        let userRef = this.firestore.collection("users").doc(this.uid);
        let followingRef = userRef.collection('following').doc(targetUser);
        let targetUserRef = this.firestore.collection("users").doc(targetUser);
        let followerRef = targetUserRef.collection('followers').doc(this.uid);
        const decrement = firebase.firestore.FieldValue.increment(-1);
        const batch = this.firestore.batch();

        batch.delete( followingRef );
        batch.delete( followerRef );
        batch.commit()
        .then(ref => {
          userRef.update({ numFollowing: decrement});
          targetUserRef.update({ numFollowers: decrement});
          res(ref);
				})
				.catch(error => {
						rej(error);
				})
      });
    };  

    LikeOutfit = async ( outfitPic, idRef, user ) => {
        return new Promise((res, rej) => {
          let pollRef = this.firestore.collection('outfitPolls').doc(outfitPic);
          let participantsRef = pollRef.collection('participants').doc(this.uid)
          let photoRef = pollRef.collection(idRef).doc(this.uid);
          let participantsStatRef = pollRef.collection('participants').doc('--participantsCount--')
          const increment = firebase.firestore.FieldValue.increment(1);
          const batch = this.firestore.batch();
          
          batch.set( photoRef, { user: user });
          batch.set( participantsStatRef, { 'total' : increment }, {merge:true});
          batch.set( participantsRef, { user: this.uid });
          batch.commit()
              .then(ref => {
                if (idRef === '0'){
                    pollRef.update({ 'votes.0':increment })
                } else if (idRef === '1'){
                    pollRef.update({ 'votes.1':increment })
                } else {
                    pollRef.update({ 'votes.2':increment })
                }
                res(ref);  
              })
              .catch(error => {
                  rej(error);
              });
          });
    };

    DeletePost = async ( pollId ) => {
        return new Promise((res, rej) => {
            let userRef = this.firestore.collection("users").doc(this.uid);
            let pollRef = this.firestore.collection("outfitPolls").doc(pollId);       
            const decrement = firebase.firestore.FieldValue.increment(-1);
            pollRef.delete()
            .then(ref => {
                userRef.update({ numPosts: decrement });
				res(ref);
            })
            .catch(error => {
                rej(error);
            });
        });
    }

    LikePoll = async ( outfitPic, user ) => {
        // Create a reference for a new like, for use inside the transaction
        let pollRef = this.firestore.collection('outfitPolls').doc(outfitPic);
        let likeRef = pollRef.collection('likes').doc(this.uid);
        const increment = firebase.firestore.FieldValue.increment(1);
        const decrement = firebase.firestore.FieldValue.increment(-1);

        // In a transaction, add the new like and update the likesCount
        return firebase.firestore().runTransaction(transaction => {
            return transaction.get(likeRef).then(res => {
                if (!res.exists) {
                    transaction.update( pollRef, { likesCount: increment });
                    transaction.set( likeRef, { user: user });
                } else {
                    transaction.update( pollRef, { likesCount: decrement });
                    transaction.delete( likeRef );
                }
            })
        });  
    }       

// -------- Chat Functions --------

// Databases:     
get db() {
    return firebase.database().ref('messages');
}

get roomsRef() {
    return firebase.database().ref("rooms");
} 

get messagesRef (){
    return firebase.database();
} 
// Parse message to messsages array        
    parse = message => {
        const { timestamp, text, user,} = message.val();
        const { key: _id } = message;
        const createdAt = new Date(timestamp);
        return {
            _id,
            createdAt,
            text,
            user,
        };
    };
    
    on = (callback) => {
        this.db.on("child_added", (snapshot) => callback(this.parse(snapshot)));
    };

// Add the message to the Backend #1
    send = messages => {
        for (let i = 0; i < messages.length; i++) {
            const { text, user, image } = messages[i];
            const message = {
                text,
                user,
                timestamp: this.timestamp,
                image
            };
            this.append(message);
        }
    };

    append = message => this.db.push(message);

// Add the message to the Backend #2
    addMessage = (messages, image) => {
        for (let i = 0; i < messages.length; i++) {
            const { text, user  } = messages[i];
            const message = {
                text,
                user,
                timestamp: this.timestamp,
                image: image
            };
        return message;
        }
    };

// Add channel/room to firebase database    
    addRoomtoFb = room => this.roomsRef.push(room);

// close the connections to the Backend  
    off() {
        this.db.off();
        this.messagesRef.off();
    };

    off1() {
        this.roomsRef.off();
    } 

// LogOut Function    
    signOut = () => {
        firebase.auth().signOut();
    };        

    get firestore() {
        return firebase.firestore();
    }

    get uid() {
        return (firebase.auth().currentUser || {}).uid;
    }

    get user() {
        var user = firebase.auth().currentUser;
        return {
            _id: user.uid,
            name: user.name,
            avatar: user.avatar,
        };
    }

    get timestamp() {
        return Date.now();
    }

    get creationTime(){
        var strCreationDate = firebase.auth().currentUser.metadata.creationTime;
        var date = new Date(strCreationDate);
        var month = date.toLocaleString('default',{month:'short'});
        var year = date.getFullYear().toString();
        var dateDisplay = month+' '+year;
        return (dateDisplay)
    }
}

Fire.shared = new Fire();
export default Fire;