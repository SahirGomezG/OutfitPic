import React, { Component } from 'react';
import { View, Text, TouchableOpacity, TextInput, Button, StyleSheet, StatusBar, Image, LayoutAnimation, KeyboardAvoidingView, ImageBackground, TouchableWithoutFeedback, Keyboard, Alert} from 'react-native';
import * as firebase from 'firebase';
import TouchID from 'react-native-touch-id';
import * as keychain from 'react-native-keychain';


class Login extends Component {
  
  static navigationOptions = {
    header: null
  };
  
  state = {
    email: "",
    password: "",
    errorMessage: null,
  }

  handleLogin = () => {
      const {email,password} = this.state;
      const username = this.state.email;
      firebase
          .auth()
          .signInWithEmailAndPassword(username,password)
          .catch(error => this.setState({ errorMessage : error.message }));      
  }

  handleKeyChain = async () => {
    const username = this.state.email;
    const password = this.state.password;
    // Store the credentials
    await keychain.setGenericPassword(username, password);

    try {
      // Retreive the credentials
      const credentials = await keychain.getGenericPassword();
      if (credentials) {
        Alert.alert('Credentials successfully loaded for user ' + credentials.username);
        firebase
            .auth()
            .signInWithEmailAndPassword(credentials.username, credentials.password)
            .catch(error => this.setState({ errorMessage : error.message }));
      } else {
        Alert.alert('No credentials stored')
      }
    } catch (error) {
      console.log('Keychain couldn\'t be accessed!', error);
    }
    await keychain.resetGenericPassword()
  }
  

/*  
  constructor(){
    super();
    this.state = {
     credentials: {
        email:"",
        password:"",
      }
    };
  }
updateText(text, field) {
  let newCredentials = Object.assign(this.state.credentials)
  newCredentials[field] = text;
  this.setState({
    credentials: newCredentials
   });
}
login() {
//send credentials to server, if sign up success
  fetch(config.baseUrl + '/login', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      },
    body: JSON.stringify(this.state.credentials)
    })
    .then((response) => response.json())
    .then((jsonResponse) => {
      if(jsonResponse.confirmation === 'success'){
        this.props.navigation.navigate('main');
      } else {
        throw new Error(jsonResponse.message);
    }})
    .catch(err => {
      alert(JSON.stringify(err.message));
    });
 }
*/
 render() {
  LayoutAnimation.easeInEaseOut();
  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <KeyboardAvoidingView style = {{ flex:1, justifyContent:'center', alignItems: 'center', backgroundColor: "#EBECF4"}} behavior="padding" enabled>
      <StatusBar barStyle="light-content"></StatusBar>
           <ImageBackground
                source={require("../../../assets/wallpaper.jpg")}
                style={{ width: '100%', height: '100%', flex: 1}}
           >
             <View style={{ alignItems:'center', justifyContent:'center', flex:1, backgroundColor:'rgba(0,0,0,0.20)'}}>
                <View style={{marginTop:100}}>
                   <Text style={styles.logo}>OutfitPic</Text>
                </View>

                <Text style={styles.greeting}>Welcome back! </Text>

                <View style={styles.errorMessage}>
                  {this.state.errorMessage && <Text style={styles.error}>{this.state.errorMessage}</Text>}
                </View>

                <TextInput 
                  autoCapitalize="none"
                  onChangeText={ email => this.setState({ email })}
                  value={this.state.email}
                  placeholder='Email'
                  placeholderTextColor = "grey"
                  autoCorrect={false}
                  style = {styles.input}
                  textContentType="username"/>

                <TextInput 
                  autoCapitalize="none"
                  onChangeText={ password => this.setState({ password })}
                  value={this.state.password}
                  secureTextEntry 
                  autoCorrect={false}
                  placeholder='Password'
                  placeholderTextColor = "grey" 
                  style = {styles.input}
                  textContentType="password"/>

                <TouchableOpacity style={styles.button} onPress={this.handleLogin}>
                    <Text style={{color:'#fff', fontWeight:"600", fontSize:15}}>Sign In</Text>
                </TouchableOpacity> 

                  <Button  
                  onPress = {() => { this.props.navigation.navigate('register')}} 
                  title='New to OutfitPic? Sign Up'
                  color='#FFF'
                  />

                  <Button  
                  onPress = {() => { this.props.navigation.navigate('resetPassword')}} 
                  title='Forgot Password?'
                  color='grey'
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
    marginTop: 200,
    fontSize: 18,
    fontWeight: '200',
    textAlign: "center",
    color: 'white',
    fontFamily: "HelveticaNeue"
  },
  logo:{
    fontSize: 50, 
    color:'white', 
    fontFamily:"HelveticaNeue",
  },
  input:{
    height: 50,
    width: 80+'%',
    paddingHorizontal: 30,
    marginHorizontal: 30,
    backgroundColor: 'rgb(255,255,255)',
    marginBottom: 10,
    borderBottomColor: '#8A8F9E',
    fontSize: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    color: 'black'
  },
  text:{
    marginBottom: 10,
    color: 'red',
  },
  errorMessage: {
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 30,
  },
  error :{
    color:"#FFF",
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  button: {
    marginHorizontal: 30,
    marginBottom:50,
    width: 80+'%',
    backgroundColor: "#E9446A",
    borderRadius: 10,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  }
})


export default Login;

