import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Platform, KeyboardAvoidingView, SafeAreaView, StyleSheet, Image, ViewPropTypes } from 'react-native';
import Fire from "../../Fire";
import Icon from 'react-native-ionicons';
import { GiftedChat, Bubble, Send } from 'react-native-gifted-chat';
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";
import * as Permissions from "expo-permissions";
import PropTypes from 'prop-types';
import "prop-types";

class PrivateChatScreen extends Component {

    static navigationOptions = ({ navigation }) => ({
      title: navigation.state.params.friendName,
    })

    static propTypes = {
      currentMessage: PropTypes.object,
      containerStyle: ViewPropTypes.style,
  }

  constructor(props) {
    super(props);
    var chatKey = this.props.navigation.state.params.chatKey;
    this.messagesRef = Fire.shared.messagesRef.ref(`messages/${chatKey}`);
    this.state = {
        chatKey : this.props.navigation.state.params.chatKey, 
        messages: [],
        user: {},
        text:'',
        image: null,
    };
  }

  unsubscribe = null;
  unsubscribe2 = null;

    get user() {
        return {
            _id: this.props.uid || Fire.shared.uid,
            name: this.state.user.name,
            avatar: this.state.user.avatar
        };
    }

    componentDidMount() {
        this.getPhotoPermission();
    
        const user = this.props.uid || Fire.shared.uid;
        this.unsubscribe = Fire.shared.firestore
            .collection("users")
            .doc(user)
            .onSnapshot(doc => {
                this.setState({ user: doc.data()});
            });
        this.listenForMessages(this.messagesRef);      
    }

    listenForMessages(messagesRef) {
        messagesRef.on('value', (dataSnapshot) => {
          var messagesFB = [];
          dataSnapshot.forEach((child) => {
            messagesFB = [({
              _id: child.key,
              text: child.val().text,
              createdAt: child.val().timestamp,
              user: {
                _id: child.val().user._id,
                name: child.val().user.name,
                avatar: child.val().user.avatar,
              },
              image: child.val().image,
            }), ...messagesFB];
          });
          this.setState({ messages: messagesFB });
        });
      }

    send = (messages) =>{
        this.messagesRef.push(Fire.shared.addMessage(messages, this.state.image));
        this.setState({ image: '' });     
    }

    addChatPic = async ({localUri}) => {
      const path = `chat_PrivatePics/${this.state.chatKey}/${Date.now()}`;
      const remoteUri = await Fire.shared.uploadPhotoAsync(localUri, path);
      this.setState({image: remoteUri});

      return new Promise((res, rej) => {
          Fire.shared.firestore
              .collection("chatPics")
              .add({
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

  componentWillUnmount() {
      this.messagesRef.off();
      this.unsubscribe();
      //this.unsubscribe2();
  }

  getPhotoPermission = async () => {
    if (Constants.platform.ios) {
        const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

        if (status != "granted") {
            alert("We need permission to use your camera roll if you'd like to include a photo.");
        }
    }
};

pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3]
    });

    if (!result.cancelled) {
        this.addChatPic({localUri: result.uri});
        this.setState({ text: ' ' });
    }
};

renderCustomView = (props) => {
  //const { image } = this.state;
  const { currentMessage, containerStyle } = this.props
  if (props.currentMessage.image) {
    return (
      <View style={props.containerStyle}>
        <View >
           <Image source={this.state.image ? { uri: this.state.image } : null}></Image>    
          </View>
      </View>
    );
  }
  return null
}

renderSend(props) {
  return (
      <Send
          {...props}
      >
          <View style={{marginRight: 10, marginBottom: 10}}>
            <Icon name="paper-plane" size={25} color="#5a6e55" />
          </View>
      </Send>
  );
};

renderBubble = props => {
  return (
    <Bubble
      {...props}
      wrapperStyle={{
        left: {
          //backgroundColor:'#acb6aa',
          backgroundColor: '#f0f0f0',
        },
        right: {
          backgroundColor:'#5a6e55',
        }
      }}
    />
  )} 



  render() {
    const chat = <GiftedChat messages={this.state.messages} onSend={Fire.shared.send} user={this.user} />;
    if (Platform.OS === "android") {
        return (
            <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={30} enabled>
                {chat}
            </KeyboardAvoidingView>
        );
    }

    return <SafeAreaView style={styles.container}>
            <>
                {this.state.messages.length === 0 && (
                    <View style={[
                    StyleSheet.absoluteFill,
                    {
                        backgroundColor: 'white',
                        justifyContent: 'center',
                        alignItems: 'center',
                        bottom: 50
                    }]}>
                    <Image 
                        source={{ uri: 'https://i.stack.imgur.com/qLdPt.png' }}
                        style={{
                        ...StyleSheet.absoluteFillObject,
                        resizeMode: 'contain'
                        }}
                    />
                </View>
                )}
              <GiftedChat 
              messages={this.state.messages} 
              onSend={this.send.bind(this)} 
              renderCustomView={this.renderCustomView}
              user={this.user} 
              text={this.state.text}
              showAvatarForEveryMessage = {true} 
              renderBubble= {this.renderBubble}
              alwaysShowSend= {true}
              onInputTextChanged={text => this.setState({ text })}
              renderSend={this.renderSend}
              /> 
            </>
              <TouchableOpacity style={styles.back} onPress={() => this.props.navigation.navigate('default')}>
                  <Icon name="arrow-round-back"></Icon>
              </TouchableOpacity>
              <TouchableOpacity style={styles.library} onPress={this.pickImage}>
                    <Icon name="ios-images" size={32} color="#5a6e55"></Icon>
                </TouchableOpacity>       
           </SafeAreaView>;     
}

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F4F5F7"
    },
    back: {
        position: "absolute",
        top: 48,
        left: 32,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "rgba(21, 22, 48, 0.1)",
        alignItems: "center",
        justifyContent: "center"
    },
    mapView: {
        width: 150,
        height: 100,
        borderRadius: 13,
        margin: 3,
    },
    send: {
        color: "#C3C5CD",
        fontSize: 12,
        fontWeight: "500",
        marginTop: 4
    },  
      map: {
        ...StyleSheet.absoluteFillObject,
      },
      library: {
        position: "absolute",
        top: 48,
        right: 32,  
        alignItems: "center",
        justifyContent: "center",
    },
});

export default PrivateChatScreen;