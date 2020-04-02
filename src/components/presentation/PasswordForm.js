import React, { Component } from "react";
import { View, StyleSheet, TouchableOpacity, TextInput, Text, Alert } from "react-native";
import * as firebase from 'firebase';

class PasswordForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
          currentPassword: this.props.currentPassword,
          newPassword: this.props.newPassword,
        };
      };

// Reauthenticates the current user and returns a promise...
    reauthenticate = (currentPassword) => {
        var user = firebase.auth().currentUser;
        var cred = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
        return user.reauthenticateWithCredential(cred);
    }

// Changes user's password...
    onChangePasswordPress = () => {
        this.reauthenticate(this.state.currentPassword).then(() => {
            var user = firebase.auth().currentUser;
            user.updatePassword(this.state.newPassword).then(() => {
                Alert.alert("Password was changed");
                this.setState({ currentPassword: '', newPassword: '' });
            }).catch((error) => { 
                Alert.alert(error.message) 
            });
        }).catch((error) => { Alert.alert(error.message) });
    }  

    render(){
        return (
            <View style={styles.container}>
                <TextInput 
                    style={styles.textInput} 
                    value={this.state.currentPassword}
                    placeholder="Current Password" 
                    autoCapitalize="none" 
                    secureTextEntry={true}
                    onChangeText={(text) => { this.setState({currentPassword: text}) }}
                />
        
                <TextInput 
                    style={styles.textInput} 
                    value={this.state.newPassword}
                    placeholder="New Password" 
                    autoCapitalize="none" 
                    secureTextEntry={true}
                    onChangeText={(text) => { this.setState({newPassword: text}) }}
                />
                <TouchableOpacity style={styles.changePasswordButton} onPress={this.onChangePasswordPress}>
                    <Text style={styles.saveText}>Change Password</Text>
                </TouchableOpacity>   
            </View>                             
        )
    };
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        marginTop: -10
    },
    textInput: { 
        borderWidth:1, 
        borderColor:"gray", 
        marginVertical: 5, 
        paddingLeft:10,
        paddingVertical:4, 
        height:30, 
        alignSelf: "stretch", 
        fontSize: 13,
        borderRadius: 15,
        fontFamily: "HelveticaNeue",
        color: "#4F566D" 
    },
    changePasswordButton: {
        marginHorizontal: 30,
        marginTop:5,
        backgroundColor: "#252B3B",
        borderRadius: 10,
        height: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveText:{
        color: '#FFF',
        fontSize: 13,
        fontWeight: "200",
        fontFamily: "HelveticaNeue"
    }
})

export default PasswordForm;