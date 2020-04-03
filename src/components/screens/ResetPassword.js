import React, { Component } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, StyleSheet, StatusBar, LayoutAnimation, KeyboardAvoidingView, ImageBackground, TouchableWithoutFeedback, Keyboard} from 'react-native';
import * as firebase from 'firebase';
import Icon from 'react-native-ionicons';

class ResetPassword extends Component {
  
    static navigationOptions = {
      header: null
    };
    
    state = {
      email: "",
      errorMessage: null,
    }
  
    handleSendEmail = () => {
        var auth = firebase.auth();
        var emailAddress = this.state.email;
        auth.sendPasswordResetEmail(emailAddress)
        .then(() => {
            Alert.alert("Password reset email sent successfully");
            this.props.navigation.navigate('login')
        })
        .catch((error) => { 
            this.setState({ errorMessage : error.message }) 
        });
    };

    render() {
        LayoutAnimation.easeInEaseOut();
        return (
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <KeyboardAvoidingView style = {{ flex:1, justifyContent:'center', alignItems: 'center', backgroundColor: "#332F3E"}} behavior="padding" enabled>
              <StatusBar barStyle="light-content"></StatusBar>
                 
                   <View style={styles.container}>
                        <View style={{marginTop:10}}>
                            <Text style={styles.logo}>OutfitPic</Text>
                        </View>
                        <TouchableOpacity style={styles.back} onPress={() => this.props.navigation.goBack()}>
                            <Icon name="arrow-round-back" color='white'></Icon>
                        </TouchableOpacity>
      
                        <Text style={styles.greeting}>Reset Password </Text>
                        <Text style={[styles.greeting,{marginTop:10}]}>Enter the email address you use to log in. </Text>
        
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
                            style = {styles.input}/>
        
                        <TouchableOpacity style={styles.button} onPress={this.handleSendEmail}>
                            <Text style={{color:'#fff', fontWeight:"600", fontSize:15}}>Send Email</Text>
                        </TouchableOpacity> 
                      
                   </View>         
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        );
      }
}  

const styles = StyleSheet.create({
    container:{
        alignItems:'center', 
        justifyContent:'center',
        width: 100+'%', 
        flex:1, 
        //backgroundColor:'rgba(0,0,0,0.20)'
    },
    greeting: {
        marginTop: 100,
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
    },
})
  
export default ResetPassword;

    /*<ImageBackground
            source={require("../../../assets/wallpaper.jpg")}
          style={{ width: '100%', height: '100%', flex: 1}}
   ></ImageBackground>*/