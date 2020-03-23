import React, { Component } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Fire from "../../Fire";

class FollowingButton extends Component {

    constructor(props) {
        super(props);
        this.state = {
          targetName:'',
          targetAvatar: '',  
          myName: '',
          myAvatar: '', 
          following: false,
        };
      };
    
    unsubscribe = null;
    
    componentDidMount(){
        const user = this.props.uid || Fire.shared.uid;
        const followerId = this.props.followerId;
        let currentuserRef = Fire.shared.firestore.collection("users").doc(user);
        const followingRef = currentuserRef.collection('following');
    
        currentuserRef.get()
        .then(doc => {
            this.setState({ myName: doc.data().name });
            this.setState({ myAvatar: doc.data().avatar})
        });

        const userRef = Fire.shared.firestore.collection('users').doc(followerId);
        userRef.get().then(doc => {
            this.setState({ targetName: doc.data().name })
            this.setState({ targetAvatar: doc.data().avatar })
        });

        let query = followingRef.where('id', '==', followerId);       
        this.unsubscribe = query.onSnapshot(querySnapshot => {
            if (!querySnapshot.empty) {
                this.setState({ following: true })
            } else { 
                this.setState({ following: false })
            }
        })
    }
    
    componentWillUnmount() {
        this.unsubscribe();
    }

    toFollow(){
      Fire.shared.followUser(this.props.followerId, this.props.followerName, this.state.myName, this.state.targetAvatar, this.state.myAvatar)
        .then(ref => { 
          //alert (`You are now following ${this.state.userProfile.name}.`);
        })
        .catch(error => { 
          alert(error)
        });
    };
  
    toUnfollow(){
      Fire.shared.toUnfollowUser(this.props.followerId)
        .then(ref => { 
          //alert (`You are no longer a following of ${this.state.userProfile.name}.`);
        })
        .catch(error => { 
          alert(error)
        });
    }  

    render(){
        return (
            <View style={styles.container}>
                {!this.state.following ? 
                (<TouchableOpacity onPress={() => this.toFollow()}>
                    <View style={{borderRadius: 5, backgroundColor: '#4A1F74', height: 22, width: 80,justifyContent: "center", alignItems:'center'}}>
                        <Text style={[styles.textLight,{fontSize:13}] }> Follow</Text>
                    </View>
                </TouchableOpacity>) 
                    : 
                (<TouchableOpacity onPress={() => this.toUnfollow()}>
                    <View style={styles.followingButton}>
                        <Text style={[styles.textLight,{fontSize:13}] }> Following</Text>
                    </View>
                </TouchableOpacity>)}
            </View>
        );
    };
};

const styles = StyleSheet.create({
    container:{
        justifyContent: 'center', 
        alignContent:'center', 
        padding: 6
    },
    followingButton: {
        borderRadius: 5,
        backgroundColor: 'transparent', 
        height: 22, 
        width: 80,
        justifyContent: "center", 
        alignItems:'center',
        borderColor: "rgba(93, 63, 106, 0.2)",
        borderWidth: 1,
    },
    textLight: {
        color: "#B6B7BF",
        fontFamily: "HelveticaNeue",
      },
})

export default FollowingButton;