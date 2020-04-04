import React, { Component } from 'react'
import { View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import firebase from 'firebase';
import Fire from '../../Fire';


class Loading extends Component {

    componentDidMount(){
        if (Fire.shared.uid) {
            this.props.navigation.navigate("main");
        } else {
        firebase.auth().onAuthStateChanged(user => {
            this.props.navigation.navigate(user ? 'main': 'intro');
        });
        }
    }

    render() {
        return (
            <View style={ styles.container }>
                <Text style={styles.header}> Hang tight, loading...</Text>
                <ActivityIndicator size="large"></ActivityIndicator>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:"center",
        alignItems: "center",
    },
    header: {
        fontWeight: "500",
        fontSize: 25,
        color: "#514E5A",
        marginTop: 35,
        marginBottom: 50,
    },
});

export default Loading;
