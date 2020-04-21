import React, { Component } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Fire from "../../Fire";

class LikesButton extends Component {

    constructor(props) {
        super(props);
        this.state = {
          liked: false,
          numLikes: 0,
        };
      };
    
    unsubscribe = null;
    
    componentDidMount(){
        const pollId = this.props.pollId;
        const pollRef = Fire.shared.firestore.collection('outfitPolls').doc(pollId);    
        this.unsubscribe = pollRef.onSnapshot(doc => {
            if (doc.exists) {
                this.setState({ numLikes: doc.data().likesCount });
            } else {
                this.setState({ numLikes: 0});
            }  
        });      
    }
    
    componentWillUnmount() {
        this.unsubscribe();
    }

    render(){
        return (
            <View >           
                <Text style={styles.numLikes}>{this.state.numLikes} Likes</Text>            
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
        fontSize: 13,
        color: "#838899"
    },
})

export default LikesButton;