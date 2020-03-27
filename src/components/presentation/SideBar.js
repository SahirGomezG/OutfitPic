import React, { Component } from "react";
import { View, Text, StyleSheet, ScrollView, ImageBackground, Image, TouchableOpacity } from "react-native";
import { DrawerNavigatorItems } from "react-navigation-drawer";
import Icon from 'react-native-ionicons';
import SafeAreaView from 'react-native-safe-area-view';
import Fire from "../../Fire";

class SideBar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      user:{},
      followers:0,
    };
  };

  unsubscribe = null;

  componentDidMount(){
    const user = this.props.uid || Fire.shared.uid;
    this.unsubscribe = Fire.shared.firestore
        .collection("users")
        .doc(user)
        .onSnapshot(doc => {
            this.setState({ user: doc.data() });
        }, (error) => {
          console.log('error')
        });     
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  signOut = () => {
      Fire.shared.signOut();
  }

  render(){
    return(
      <ScrollView style={{backgroundColor:'rgba(0,0,0,0.20)'}}>
            <SafeAreaView>
            <ImageBackground
                source={require('../../../assets/sidebar1.jpg')}       
                style={{ width: undefined, paddingBottom: 40, paddingTop: 100, marginTop:-80 }}
            >
              <View style={{ alignItems: 'center'}}>
                <Image 
                  source={this.state.user.avatar
                            ? { uri: this.state.user.avatar }
                            : require("../../../assets/default.png")
                          }
                  style={styles.profile}
                />
               
                <Text style={styles.name}>Hi, {this.state.user.name}</Text>

                <View style={{ flexDirection: "row" }}>
                  {this.state.user.numFollowers 
                  ? <Text style={styles.followers}>{this.state.user.numFollowers} Followers</Text> 
                  : <Text style={styles.followers}>0 Followers</Text> } 
                  <Icon name="ios-people" size={16} color="rgba(255, 255, 255, 0.8)" />
                </View>
              </View>  
            </ImageBackground>

            <View style={styles.container} forceInset={{ top: "always", horizontal: "never" }}>
              <DrawerNavigatorItems {...this.props} />
            </View>
            
            <TouchableOpacity onPress={this.signOut}> 
              <View style={{position:"absolute", bottom: -170, right: 30, flexDirection:'row'}}>
                <Icon name="ios-log-out" size={16}/>       
                <Text style={{fontSize: 14, fontWeight: '700'}}>    SignOut</Text>
              </View>
            </TouchableOpacity>
            
          </SafeAreaView>
        </ScrollView>
    )
  }
};
    
const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    profile: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: "#FFF"
    },
    name: {
        color: "#FFF",
        fontSize: 25,
        fontWeight: "400",
        marginVertical: 8,
        fontFamily: "HelveticaNeue",
    },
    followers: {
        color: "rgba(255, 255, 255, 0.8)",
        fontSize: 13,
        marginRight: 4,
        fontFamily: "HelveticaNeue",
        fontWeight: "200",
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "200",
      color: "#FFF",
      fontFamily: "HelveticaNeue",
  },
});    

export default SideBar;