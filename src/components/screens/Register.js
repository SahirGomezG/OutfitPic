import React, { Component } from 'react';
import { View, Text, TouchableOpacity, TextInput, Button, StyleSheet, StatusBar, Image, KeyboardAvoidingView, ImageBackground, TouchableWithoutFeedback, Keyboard, Linking, Alert} from 'react-native';
import Icon from 'react-native-ionicons';
import * as ImagePicker from "expo-image-picker";

import Constants from "expo-constants";
import * as Permissions from "expo-permissions";
import Fire from "../../Fire";

class Register extends Component {

  static navigationOptions = {
    header: null
  };

  state = {
    user: {
      name: "",
      email: "",
      password: "",
      //avatar: "https://lh3.googleusercontent.com/ZZ2SDZXCutrnPTPyNoBYhBzsuVCQabOfa_scj8RkxH8ZAoq3d8bXca8jsQS6tWEoCy-Se6QyfNn9gepDBw87p6OhkgI",
      avatar: null,
    },
    errorMessage: null
  }

  /*componentDidMount() {
    this.getPhotoPermission();
  }*/

  getPhotoPermission = async () => {
      if (Constants.platform.ios) {
          const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

          if (status != "granted") {
              alert("We need permission to use your camera roll if you'd like to incude a photo.");
          }
      }
  };

  handlePickAvatar = async () => {
    this.getPhotoPermission();

    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3]
    });

    if (!result.cancelled) {
        this.setState({ user: { ...this.state.user, avatar: result.uri } });
    }
  };

  sendWelcomeEmail = (email) => {
    const Http = new XMLHttpRequest();
    const Url = `https://us-central1-react-native-app1-71a26.cloudfunctions.net/sendWelcomeEmail?dest=${email}`;
    Http.open("GET", Url);
    Http.send()
    Http.onreadystatechange = (e) => {console.log(Http.responseText)}
  }

  handleSignUp = () => {
    if (this.state.user.avatar != null ){
      Fire.shared.createUser(this.state.user);
      this.sendWelcomeEmail(this.state.user.email);
    } else {
      Alert.alert('Hi! Please add a profile picture to register')
    } 
  }

    render() {
        return (
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <KeyboardAvoidingView style = {{ flex:1, justifyContent:'center', alignItems: 'center', backgroundColor: "#EBECF4"}} behavior="padding" enabled>
              <StatusBar barStyle="light-content"></StatusBar>
              
                <ImageBackground
                  source={require("../../../assets/wallpaper.jpg")}
                  style={{ width: '100%', height: '100%', flex: 1}}
                >
                <View style={{ alignItems:'center', justifyContent:'center', flex:1, backgroundColor: 'rgba(128,128,128,0.35)'}}>
                    
                    
                    <View style={{  marginTop: 30, alignItems: "center", width: "100%" }}>
                        <Text style={styles.greeting}>{`Hello!\nSign up to get started.`}</Text>
                        <TouchableOpacity style={styles.avatarPlaceholder} onPress={this.handlePickAvatar}>
                            <Image
                                  source ={this.state.user.avatar
                                      ? { uri: this.state.user.avatar }
                                      : require("../../../assets/add.png")}
                                  style={styles.avatar}
                              />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.errorMessage}>
                      {this.state.errorMessage && <Text style={styles.error}>{this.state.errorMessage}</Text>}
                    </View>
                        <TextInput 
                          autoCapitalize="none"
                          onChangeText={ name => this.setState({ user: { ...this.state.user, name } }) }
                          value={this.state.user.name}
                          placeholder='Username'
                          placeholderTextColor = "grey"
                          autoCorrect={false}
                          style = {styles.input}/>
                        <TextInput 
                          autoCapitalize="none"
                          onChangeText={ email => this.setState({ user: { ...this.state.user, email } })}
                          value={this.state.user.email}
                          placeholder='Email'
                          placeholderTextColor = "grey"
                          autoCorrect={false}
                          textContentType="username"
                          style = {styles.input}/>
                        <TextInput 
                          autoCapitalize="none"
                          //onChangeText={ text => this.updateText(text, 'password') } 
                          onChangeText={ password => this.setState({ user: { ...this.state.user, password } })}
                          value={this.state.user.password}
                          secureTextEntry 
                          autoCorrect={false}
                          textContentType="newPassword"
                          placeholder='Password'
                          placeholderTextColor = "grey" 
                          style = {styles.input}/>

                        <TouchableOpacity style={{marginBottom:10}} onPress={() => Linking.openURL('https://outfitpic.app/terms-conditions') }>
                          <Text style={{fontSize:9, color: '#FFF'}}> {'By clicking "Sign Up", \n you are agreeing to our User Agreement and Privacy Policy'}</Text> 
                        </TouchableOpacity>      

                        <TouchableOpacity style={styles.button} onPress={this.handleSignUp}>
                          <Text style={{color:'#fff', fontWeight:"600", fontSize:15}}>Sign Up</Text>
                        </TouchableOpacity>    

                        <Button onPress = {() => { this.props.navigation.navigate('login')}} 
                        title='User already? Log In'
                        color='#FFF'
                        />

                </View>
              </ImageBackground>      
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>  
        );
    }
}

const styles = StyleSheet.create({
    greeting: {
      marginBottom: 80,
      fontSize: 18,
      fontWeight: '200',
      textAlign: "center",
      color: "#FFF"
    },
    inputTitle: {
      color: "#8A8F9E",
      fontSize: 10,
      textTransform: "uppercase"
    },
    input:{
      height: 50,
      width: 80+'%',
      paddingHorizontal: 50,
      marginHorizontal: 20,
      backgroundColor: 'rgb(255,255,255)',
      color: 'black',
      marginBottom: 10,
      borderBottomColor: '#8A8F9E',
      fontSize: 15,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
    },  
    button: {
      marginHorizontal: 30,
      width: 80+'%',
      backgroundColor: "#E9446A",
      borderRadius: 10,
      height: 50,
      alignItems: 'center',
      justifyContent: 'center',
    },
    errorMessage: {
      height: 72,
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: 30,
    },
    error :{
      color:"#E9446A",
      fontSize: 13,
      fontWeight: '600',
      textAlign: 'center',
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
    avatarPlaceholder: {
      width: 120,
      height: 120,
      backgroundColor: "#E1E2E6",
      borderRadius: 60,
      marginTop: 25,
      justifyContent: "center",
      alignItems: "center"
  },
  avatar: {
      position: "absolute",
      width: 110,
      height: 110,
      borderRadius: 55
  },
})

export default Register;
