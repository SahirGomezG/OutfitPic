import React, { Component } from "react";
import { StyleSheet, Text, View, SafeAreaView, Image, ScrollView, TouchableOpacity, FlatList, Modal, TouchableWithoutFeedback } from "react-native";
import Fire from "../../Fire";
import Icon from 'react-native-ionicons';

class PublicProfile extends Component {

  static navigationOptions = ({ navigation }) => ({
    title: navigation.state.params.profileOwner,
    header: null
  })

    constructor(props) {
        super(props);
        this.state = {
            profileOwner : this.props.navigation.state.params.profileOwner,
            profileId: this.props.navigation.state.params.profileId,
            myName: '',
            myAvatar: '',
            userProfile: {},
            following: false,
            followingNumber: 0,
            followersNumber: 0,
            lastPoll: [],
            modalVisible: false,       
        };
    }  

    unsubscribe = null;
    unsubscribe2 = null;

    componentDidMount() {
      const user = this.props.uid || Fire.shared.uid;
      const profileId = this.state.profileId;
      let currentuserRef = Fire.shared.firestore.collection("users").doc(user);

      currentuserRef.get()
        .then(doc => {
            this.setState({ myName: doc.data().name });
            this.setState({ myAvatar: doc.data().avatar });
      });

      this.unsubscribe = Fire.shared.firestore
          .collection("users")
          .doc(profileId)
          .onSnapshot(doc => {
              this.setState({ userProfile: doc.data() });
              this.setState({ followingNumber: doc.data().numFollowing });
              this.setState({ followersNumber: doc.data().numFollowers });
          });
      const postsRef = Fire.shared.firestore.collection('outfitPolls').where('uid', '==', profileId).orderBy('timestamp','desc').limit(1); 
      let observer1 = postsRef.get()
          .then(snapshot => {
              if(!snapshot.empty) {
                  snapshot.forEach(doc => {
                    this.setState({ lastPoll: doc.data().images})
                    });
              }
          })  
      const followingRef = currentuserRef.collection('following');
      let query = followingRef.where('id','==',profileId);
      this.unsubscribe2 = query.onSnapshot(querySnapshot => {
          if (!querySnapshot.empty) {
              this.setState({ following: true })
          } else { 
              this.setState({ following: false })
          }
      });
    };

    componentWillUnmount() {
      this.unsubscribe();
      this.unsubscribe2();
    };

    toFollow(){
        Fire.shared.followUser(this.state.profileId, this.state.profileOwner, this.state.myName, this.state.userProfile.avatar, this.state.myAvatar)
          .then(ref => { 
            alert (`You are now following ${this.state.userProfile.name}.`);
          })
          .catch(error => { 
            alert(error)
          });
      };
    
    toUnfollow(){
      Fire.shared.toUnfollowUser(this.state.profileId)
        .then(ref => { 
          alert (`You are no longer a following of ${this.state.userProfile.name}.`);
        })
        .catch(error => { 
          alert(error)
        });
    }  

    setOnetoOne(user2){
      const uid1 = this.props.uid || Fire.shared.uid; // Current User
      const uid2 = user2;
      if (uid1 < uid2){
        return uid1+uid2;  
        }
      else {
        return uid2+uid1;
      }
    };

    openDirectMessages(userId) {
      const chatKey = this.setOnetoOne(userId);
      this.props.navigation.navigate('privateChat', {chatKey: chatKey, friendName: this.state.profileOwner});
    };

    openFollowersList(userId, i) {
      this.props.navigation.push('followersList', {userId: userId, friendName: this.state.profileOwner, tabIndex: i});
    };

    emptyComponent = () => {
      return (
        <View style={{ marginHorizontal: 100, height: 200, width: 180, borderRadius: 20, alignContent: 'center' }}>
          <Image source={{uri: 'https://lh3.googleusercontent.com/cxgS5VhHlPSCb0Iheq4mYpDHg7laJ_ODQn9x76Pho2nUlZXMLuz7QDNmtyMcQ1BKWTE5AV7N1YeVtMxsrpYX7xsj'}} style={styles.image} resizeMode="cover"/>
        </View>
      )
    }

    setModalVisible(visible) {
      this.setState({modalVisible: visible});
    } 

    renderItem = ({item,index}) => {
        return (
              <View style={styles.mediaImageContainer}>
                  <Image source={{ uri: item.url }} style={styles.image} resizeMode="cover">    
                  </Image>             
              </View>
        )
    };    

  render() {
    const {following, followingNumber, followersNumber, lastPoll, userProfile} = this.state;
  
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.titleBar}>
                  <TouchableOpacity style={styles.back} onPress={() => this.props.navigation.navigate('default')}>
                    <Icon name="arrow-round-back"></Icon>
                  </TouchableOpacity> 
                  <TouchableOpacity onPress={() => this.setModalVisible(true)}>  
                    <Icon name="md-more" size={24} color="#52575D"></Icon>
                  </TouchableOpacity> 
                </View>

                <View style={{marginTop: 2}}>
                    <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.modalVisible}
                    >
                    <TouchableWithoutFeedback onPress={() => {this.setModalVisible(!this.state.modalVisible)}}>
                        <View style={{flex:1, alignItems:'center', justifyContent:'center',marginTop: 22}}>
                            <View style={styles.modal}>
                              <TouchableOpacity style={{borderBottomWidth: 1,borderBottomColor: "#EBECF4"}}>
                                <View style={{ height:50+'%',alignItems:'center', justifyContent:'center', margin:15,}}>
                                    <Text style={[styles.title,{color:'red'}]}>Report</Text>
                                </View>
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => { this.setModalVisible(!this.state.modalVisible)}}> 
                                <View style={{ height:50+'%',alignItems:'center', justifyContent:'center', margin:15}}>
                                    <Text style={styles.title}>Cancel</Text>
                                </View>
                              </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>      
                    </Modal>
                </View>

                <View style={{ alignSelf: "center" }}>
                    <View style={styles.profileImage}>
                        <Image source={{uri:this.state.userProfile.avatar}} style={styles.image} resizeMode="center"></Image>
                    </View>

                    
                    <View style={styles.dm}>
                      <TouchableOpacity underlayColor="#fff" onPress={() => this.openDirectMessages(this.state.profileId)}>
                          <Icon name="ios-chatboxes" size={18} color="#DFD8C8"></Icon>
                      </TouchableOpacity>    
                    </View>

                    <View style={styles.active}></View>

                    {following? (
                        <TouchableOpacity onPress={() => this.toUnfollow()}>
                          <View style={[styles.add, {backgroundColor: "white"}]}>
                            <Image source={require("../../../assets/unfollow.png")} style={{ width:40, height:40}}/>
                          </View>
                        </TouchableOpacity>):
                        (<TouchableOpacity onPress={() => this.toFollow()}>
                          <View style={styles.add}>
                            <Icon name="md-person-add" size={35} color="#DFD8C8" style={{ marginTop: 6, marginLeft: 2 }}></Icon>
                          </View>
                      </TouchableOpacity>
                    )}

                </View>

                <View style={styles.infoContainer}>
                    <Text style={[styles.text, { fontWeight: "200", fontSize: 25 }]}>{this.state.userProfile.name}</Text>
                    <View style={{width:'80%'}}>
                      <Text style={[styles.text, { color: "#AEB5BC", fontSize: 14 }]}>{this.state.userProfile.bio}</Text>
                    </View>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statsBox}>
                        <Text style={[styles.text, { fontSize: 15 }]}>{this.state.userProfile.numPosts}</Text>
                        <Text style={[styles.text, styles.subText]}>Posts</Text>
                    </View>

                    <TouchableOpacity style={[styles.statsBox, { borderColor: "#DFD8C8", borderLeftWidth: 1, borderRightWidth: 1 }]} onPress={() => this.openFollowersList(this.state.profileId, 0)}>
                    <View style={styles.statsBox} >
                        <Text style={[styles.text, { fontSize: 15 }]}>{followersNumber}</Text>
                        <Text style={[styles.text, styles.subText]}>Followers</Text>
                    </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.statsBox} onPress={() => this.openFollowersList(this.state.profileId, 1)}>
                    <View style={styles.statsBox}>
                        <Text style={[styles.text, { fontSize: 15 }]}>{followingNumber}</Text>
                        <Text style={[styles.text, styles.subText]}>Following</Text>
                    </View>
                    </TouchableOpacity>   
                </View>

                <View style={styles.infoContainer}>
                    <Text style={[styles.subText, styles.text]}>Most Recent Poll</Text>
                </View>

                <View style={{ marginTop: 32 }}>
                    <FlatList
                        data={lastPoll}
                        renderItem= {this.renderItem}
                        keyExtractor={(item,index) => index.toString()}
                        horizontal={true}
                        ListEmptyComponent={this.emptyComponent}            
                    /> 
                    <View style={styles.mediaCount}>
                        <Text style={[styles.text, { fontSize: 12, color: "#DFD8C8", fontWeight: "300" }]}>joined in</Text>
                        <Text style={[styles.text, { fontSize: 14, color: "#DFD8C8", textTransform: "uppercase" }]}>{userProfile.joined}</Text>
                    </View>
                </View>
                <Text style={[styles.subText, styles.recent]}>Recent Activity</Text>
                <View style={{ alignItems: "center" }}>
                    <View style={styles.recentItem}>
                        <View style={styles.activityIndicator}></View>
                        <View style={{ width: 250 }}>
                            <Text style={[styles.text, { color: "#41444B", fontWeight: "300" }]}>
                                Started following <Text style={{ fontWeight: "400" }}>Jake Challeahe</Text> and <Text style={{ fontWeight: "400" }}>Luis Poteer</Text>
                            </Text>
                        </View>
                    </View>

                    <View style={styles.recentItem}>
                        <View style={styles.activityIndicator}></View>
                        <View style={{ width: 250 }}>
                            <Text style={[styles.text, { color: "#41444B", fontWeight: "300" }]}>
                                Started following <Text style={{ fontWeight: "400" }}>Luke Harper</Text>
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#E8EDF2"
    },
    text: {
        fontFamily: "HelveticaNeue",
        color: "#52575D"
    },
    image: {
        flex: 1,
        height: undefined,
        width: undefined
    },
    titleBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 24,
        marginHorizontal: 16
    },
    subText: {
        fontSize: 12,
        color: "#AEB5BC",
        textTransform: "uppercase",
        fontWeight: "500"
    },
    profileImage: {
        width: 200,
        height: 200,
        borderRadius: 100,
        overflow: "hidden"
    },
    dm: {
        backgroundColor: "#41444B",
        position: "absolute",
        top: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center"
    },
    active: {
        backgroundColor: "#34FFB9",
        position: "absolute",
        bottom: 28,
        left: 10,
        padding: 4,
        height: 20,
        width: 20,
        borderRadius: 10
    },
    add: {
        backgroundColor: "#41444B",
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center"
    },
    infoContainer: {
        alignSelf: "center",
        alignItems: "center",
        marginTop: 16,
    },
    statsContainer: {
        flexDirection: "row",
        alignSelf: "center",
        marginTop: 32,
    },
    statsBox: {
        alignItems: "center",
        flex: 1
    },
    mediaImageContainer: {
        width: 180,
        height: 200,
        borderRadius: 20,
        overflow: "hidden",
        marginHorizontal: 10,
    },
    mediaCount: {
        backgroundColor: "#41444B",
        position: "absolute",
        top: "50%",
        marginTop: -50,
        marginLeft: 30,
        width: 100,
        height: 100,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        shadowColor: "rgba(0, 0, 0, 0.38)",
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 20,
        shadowOpacity: 1
    },
    recent: {
        marginLeft: 78,
        marginTop: 32,
        marginBottom: 6,
        fontSize: 10
    },
    recentItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 16
    },
    activityIndicator: {
        backgroundColor: "#CABFAB",
        padding: 4,
        height: 12,
        width: 12,
        borderRadius: 6,
        marginTop: 3,
        marginRight: 20
    },
    back: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "rgba(21, 22, 48, 0.1)",
      alignItems: "center",
      justifyContent: "center"
    },
    modal:{
      flexDirection:'column',
      width: 300, 
      height: 150,
      padding: 26,
      justifyContent:"center",
      alignItems:'center',
      borderRadius: 12,
      backgroundColor:'#FBFBFB'
  },
    title: {
      fontWeight: "200",
      fontSize: 16,
      color: "#514E5A",
      fontFamily: "HelveticaNeue",
      //fontFamily:'Iowan Old Style'
      //fontFamily: 'Baskerville'
    },
});

export default PublicProfile;