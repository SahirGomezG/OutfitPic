import React, { Component } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TouchableOpacityComponent } from "react-native";
import Fire from "../../Fire";
import { ListItem, Left, Body, Right, Thumbnail } from 'native-base';

class UserItemList extends Component {

    constructor(props) {
        super(props);
        this.state = {
          //name: this.props.name,
          //myName: '',
          avatar: 'https://lh3.googleusercontent.com/ZZ2SDZXCutrnPTPyNoBYhBzsuVCQabOfa_scj8RkxH8ZAoq3d8bXca8jsQS6tWEoCy-Se6QyfNn9gepDBw87p6OhkgI', 
        };
      };
    
    unsubscribe = null;
    
    componentDidMount(){
        //const user = this.props.uid || Fire.shared.uid;
        const userId = this.props.userId;
        const userRef = Fire.shared.firestore.collection('users').doc(userId);
        userRef.get().then(doc => {
            this.setState({ avatar: doc.data().avatar })
        });
    }
    
    componentWillUnmount() {
       // this.unsubscribe();
    }

    render(){
        return (
          
                <Thumbnail style={styles.avatar} source={{ uri: this.state.avatar }} />                       

        );
    };
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    avatar: {
        width: 41,
        height: 41,
        borderRadius: 24,
        marginRight: 8,
        marginLeft: 8
    },
})

export default UserItemList;