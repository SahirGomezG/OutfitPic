import React, { Component } from 'react';
import { View, StyleSheet, TouchableHighlight, Animated } from "react-native";
import Icon from 'react-native-ionicons';

class AddButton extends Component {

    mode = new Animated.Value(0);
    buttonSize = new Animated.Value(1);

    handlePress = () => {
        Animated.sequence([
            Animated.timing(this.buttonSize, {
                toValue: 0.95,
                duration: 200
            }),
            Animated.timing(this.buttonSize, {
                toValue: 1
            }),
            Animated.timing(this.mode, {
                toValue: this.mode._value === 0 ? 1 : 0
            })
        ]).start();
    };

    render() {
        const thermometerX = this.mode.interpolate({
            inputRange: [0, 1],
            outputRange: [-24, -100]
        });

        const thermometerY = this.mode.interpolate({
            inputRange: [0, 1],
            outputRange: [-50, -100]
        });

        const timeX = this.mode.interpolate({
            inputRange: [0, 1],
            outputRange: [-24, -24]
        });

        const timeY = this.mode.interpolate({
            inputRange: [0, 1],
            outputRange: [-50, -150]
        });

        const pulseX = this.mode.interpolate({
            inputRange: [0, 1],
            outputRange: [-24, 50]
        });

        const pulseY = this.mode.interpolate({
            inputRange: [0, 1],
            outputRange: [-50, -100]
        });

        const rotation = this.mode.interpolate({
            inputRange: [0, 1],
            outputRange: ["0deg", "45deg"]
        });

        const sizeStyle = {
            transform: [{ scale: this.buttonSize }]
        };

        return (
            <View style={{ position: "absolute", alignItems: "center" }}>
                <Animated.View style={{ position: "absolute", left: thermometerX, top: thermometerY }}>
                    <View style={styles.secondaryButton}>
                        <Icon name="ios-megaphone" size={24} color="#FFF" />
                    </View>
                </Animated.View>
                <Animated.View style={{ position: "absolute", left: timeX, top: timeY }}>
                    <View style={styles.secondaryButton}>
                        <Icon name="ios-podium" size={24} color="#FFF" />
                    </View>
                </Animated.View>
                <Animated.View style={{ position: "absolute", left: pulseX, top: pulseY }}>
                  
                    <View style={styles.secondaryButton}>
                        <Icon name="ios-analytics" size={24} color="#FFF" />
                    </View>
             
                </Animated.View>
                <Animated.View style={[styles.button, sizeStyle]}>
                    <TouchableHighlight onPress={this.handlePress} underlayColor="#5a6e55">
                        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                            <Icon name="ios-add" size={43} color="#fff" />
                        </Animated.View>
                    </TouchableHighlight>
                </Animated.View>
            </View>
        );
    }

};

const styles = StyleSheet.create({
  button: {
      alignItems: "center",
      justifyContent: "center",
      width: 65,
      height: 65,
      borderRadius: 40,
      backgroundColor: "#5a6e55",
      position: "absolute",
      marginTop: -60,
      shadowColor: "#5a6e55",
      shadowRadius: 5,
      shadowOffset: { height: 10 },
      shadowOpacity: 0.3,
      borderWidth: 4,
      borderColor: "#FFFFFF"
  },
  secondaryButton: {
      position: "absolute",
      alignItems: "center",
      justifyContent: "center",
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: "#5a6e55"
  }
});

export default AddButton;

//<TouchableHighlight onPress={() => this.props.navigation.navigate('chat')}>