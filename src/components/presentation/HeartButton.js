import React, { Component } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TouchableOpacityComponent } from "react-native";
import Fire from "../../Fire";
import Icon from 'react-native-ionicons';

class HeartButton extends Component {

    constructor(props) {
        super(props);
        this.state = {
          liked: false,
        };
      };
    
    unsubscribe = null;
    
    componentDidMount(){
        const user = this.props.uid || Fire.shared.uid;
        const pollId = this.props.pollId || '';
        const pollRef = Fire.shared.firestore.collection('outfitPolls').doc(pollId);
        const likedRef = pollRef.collection('likes');
        let query = likedRef.where('user._id', '==', user);
        this.unsubscribe = query.onSnapshot(querySnapshot => {
            if (!querySnapshot.empty) {
                this.setState({ liked: true })
            } else { 
                this.setState({ liked: false })
            }
        });  
    }
    
    componentWillUnmount() {
        this.unsubscribe();
    }

    render(){
        return (
            <View >
                {!this.state.liked 
                    ? <Icon name="ios-heart-empty" size={20} color="#73788B" style={{ marginRight: 16 }}/>  
                    : <Icon name="ios-heart" size={20} color="#FF2D42" style={{ marginRight: 16 }} />     
                }
            </View>
        );
    };
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    numLikes: {
        marginBottom: 10,
        fontSize: 14,
        color: "#838899"
    },
})

export default HeartButton;