import React, { Component } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator} from 'react-native';
import { WebView } from 'react-native-webview';


class TermsConditions extends Component {

    static navigationOptions = {
        header: null
    };

    render() {
        return (
          <View style={styles.container}>
            <WebView
                source={{ uri: 'https://outfitpic.app/terms-conditions' }}
                style={{ marginTop: 20 }}
            />  
          </View>
        );
    }
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        //justifyContent:"center",
        //alignItems: "center",
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
    }
});

export default TermsConditions;
