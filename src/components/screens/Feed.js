import React, { Component } from "react";
import { View, Text, StyleSheet, Image, FlatList, AppState, TouchableWithoutFeedback, TouchableOpacity, StatusBar, Modal, ActivityIndicator, Alert } from "react-native";
import Fire from "../../Fire";
import moment from "moment";
import Icon from 'react-native-ionicons';
import HeartButton from '../presentation/HeartButton';
import { Tab, Tabs, Container, TabHeading } from 'native-base';
import { notificationManager } from '../../NotificationManager';
import firebase from 'react-native-firebase';
import LikesButton from "../presentation/LikesButton";

class Feed extends Component {
    static navigationOptions = {
        title: 'Feed',
        header: null
    };

    constructor(props){
        super(props);
        this.localNotify = null;
        this.senderId = '1082830494457';
        this.state = {
            //appState: AppState.currentState,
            user: {},
            blockers: [],
            globalPosts: [], 
            privatePosts: [],
            modalVisible: false,
            limit: 3,
            loading: false,
            modalData: null,

            lastVisible: null,
            refreshing: false,
            lastVisiblePrivate: null,
            refreshingPrivate: false,
            canDelete: false,
        }
    };    

    unsubscribe = null;
    unsubscribe2 = null; 

    componentDidMount(){
        FCM = firebase.messaging();
        FCM.requestPermission();
        this.localNotify = notificationManager;
        this.localNotify.configure(this.onRegister, this.onNotification, this.onOpenNotification, this.senderId);
        
        this.setState({ loading: true });
        AppState.addEventListener('change', state => {
            console.log('AppState changed to', state) }
        )
    
        const user = this.props.uid || Fire.shared.uid;
        let pollsRef = Fire.shared.firestore.collection("outfitPolls");
        let currentuserRef = Fire.shared.firestore.collection("users").doc(user);
        let blockedInRef = currentuserRef.collection("blockedIn").doc("--blockedIn--"); // List of users blocking current user
        blockedInRef.get()
        .then(doc => { 
          this.setState({ blockers: doc.data().List });
        });

        let lastActiveSession = Date.now();
        currentuserRef.get()
        .then(doc => {
            this.setState({ user: doc.data() });
            currentuserRef.update({ lastSession: lastActiveSession });
        });
        // should be deprecated later
        FCM.getToken()
        .then(token => {
            currentuserRef.update({ pushToken: token });
        });

        let query1 = pollsRef.where('privatePoll','==', false).orderBy('timestamp','desc').limit(this.state.limit);  
        this.unsubscribe = query1
            .get().then(snapshot => {
                let lastVisible = snapshot.docs[snapshot.docs.length - 1].data().timestamp;
                var postsFB = [];
                snapshot.forEach(doc => { 
                    if (!this.state.blockers.includes(doc.data().uid)){
                    var canDelete = user === doc.data().uid ? true : false;
                        postsFB = [({
                            id: doc.id,
                            name: doc.data().user.name,
                            text: doc.data().text,
                            timestamp: doc.data().timestamp,
                            avatar: doc.data().user.avatar,
                            images: doc.data().images,
                            blockComments: doc.data().blockComments,
                            authorId: doc.data().uid,
                            canDelete: canDelete,
                            likesCount: doc.data().likesCount,
                        }), ...postsFB];                   
                    }
                })            
                this.setState({ globalPosts: postsFB.reverse()});
                this.setState({ lastVisible: lastVisible })
                this.setState({ loading: false });
            });

        let query2 = pollsRef.where('privatePoll','==', true).where('followers', 'array-contains', user).orderBy('timestamp','desc').limit(this.state.limit);      
        this.unsubscribe2 = query2
            .get().then(snapshot => {
                if (snapshot.empty) { 
                    console.log('No friends posts');
                    this.setState({ lastVisiblePrivate: null, privatePosts: this.state.privatePosts })
                } else {
                let lastVisiblePrivate = snapshot.docs[snapshot.docs.length - 1].data().timestamp;
                var postsFB = [];
                snapshot.forEach(doc => {
                    if (!this.state.blockers.includes(doc.data().uid)){ 
                    var canDelete = user === doc.data().uid ? true : false; 
                        postsFB = [({
                            id: doc.id,
                            name: doc.data().user.name,
                            text: doc.data().text,
                            timestamp: doc.data().timestamp,
                            avatar: doc.data().user.avatar,
                            images: doc.data().images,
                            blockComments: doc.data().blockComments,
                            authorId: doc.data().uid,
                            canDelete: canDelete,
                            likesCount: doc.data().likesCount,
                        }), ...postsFB];                   
                    }
                })       
                this.setState({ privatePosts: (postsFB.reverse()) });
                this.setState({ lastVisiblePrivate: lastVisiblePrivate })
                this.setState({ loading: false });
                }
            });         
    };

    retrieveMore = () => {
        const user = this.props.uid || Fire.shared.uid;
        const postListSize = this.state.globalPosts.length;
        if ( postListSize <= 24 ) {
            this.setState({ refreshing: true });
            //this.setState({ loading: true });
            console.log('Retrieving additional Data');
            // Cloud Firestore: Query (Additional Query)
            let pollsRef = Fire.shared.firestore.collection("outfitPolls");
            let additionalQuery = pollsRef.where('privatePoll','==', false).orderBy('timestamp','desc').startAfter(this.state.lastVisible).limit(this.state.limit);
            this.unsubscribe3 = additionalQuery
                    .get().then(snapshot => {
                        let lastVisible = snapshot.docs[snapshot.docs.length - 1].data().timestamp;
                        var postsFB = [];
                        snapshot.forEach(doc => {
                            if (!this.state.blockers.includes(doc.data().uid)){ 
                            var canDelete = user === doc.data().uid ? true : false; 
                                postsFB = [({
                                    id: doc.id,
                                    name: doc.data().user.name,
                                    text: doc.data().text,
                                    timestamp: doc.data().timestamp,
                                    avatar: doc.data().user.avatar,
                                    images: doc.data().images,
                                    blockComments: doc.data().blockComments,
                                    authorId: doc.data().uid,
                                    canDelete: canDelete,
                                    likesCount: doc.data().likesCount,
                                }), ...postsFB];                   
                            }
                        })           
                        this.setState({ globalPosts: ([...this.state.globalPosts, ...postsFB.reverse()]) });
                        this.setState({ lastVisible: lastVisible })
                        this.setState({ refreshing: false });
                    });  
        } else {
            Alert.alert( 'End of feed!')
        }    
    };

  retrieveMorePrivatePosts = () => {
    const user = this.props.uid || Fire.shared.uid;
    const postListSize = this.state.privatePosts.length;
    if ( postListSize <= 2 ) {
        //this.setState({ refreshingPrivate: true });
        console.log('Retrieving additional Data');
        // Cloud Firestore: Query (Additional Query)
        let pollsRef = Fire.shared.firestore.collection("outfitPolls");
        let additionalQuery = pollsRef.where('privatePoll','==', true).where('followers', 'array-contains', user).orderBy('timestamp','desc').startAfter(this.state.lastVisiblePrivate).limit(this.state.limit);
        this.unsubscribe4 = additionalQuery
            .get().then(snapshot => {
                if (snapshot.empty) { 
                    console.log('No posts')
                    this.setState({ lastVisiblePrivate: null, privatePosts: this.state.privatePosts })
                } else {
                let lastVisible = snapshot.docs[snapshot.docs.length - 1].data().timestamp;
                var postsFB = [];
                snapshot.forEach(doc => { 
                    if (!this.state.blockers.includes(doc.data().uid)){ 
                    var canDelete = user === doc.data().uid ? true : false; 
                        postsFB = [({
                            id: doc.id,
                            name: doc.data().user.name,
                            text: doc.data().text,
                            timestamp: doc.data().timestamp,
                            avatar: doc.data().user.avatar,
                            images: doc.data().images,
                            blockComments: doc.data().blockComments,
                            authorId: doc.data().uid,
                            canDelete: canDelete,
                            likesCount: doc.data().likesCount,
                        }), ...postsFB];                   
                    }
                })       
                this.setState({ privatePosts: ([...this.state.privatePosts, ...postsFB.reverse()]) });
                this.setState({ lastVisiblePrivate: lastVisible })
                this.setState({ refreshingPrivate: false });
            }
            });  
    } else {
        Alert.alert( 'End of feed!')
    }    
};

    componentWillUnmount() {
        //this.unsubscribe();
        //this.unsubscribe2();
    }

    onRegister(token){
        console.log("[Notification] Registered: ", token)
    }

    onNotification(notify) {
        console.log("[Notification] onNotification: ", notify )
    }

    onOpenNotification(notify) {
        console.log("[Notification] onOpenNotification: ", notify)
    }

    get user() {
        return {
            _id: this.props.uid || Fire.shared.uid,
            name: this.state.user.name,
            avatar: this.state.user.avatar
        };
    }

    like(item){   
        let pollId = item.id;
        Fire.shared.LikePoll(pollId, this.user )
    };

    openPollBoard(item){
        this.props.navigation.navigate('poll', { pollOwner: item.name, pollId: item.id });
    }
    
    openComments(item){
        this.props.navigation.navigate('comments', { pollId: item.id, profileId: item.authorId });
    }

    openPublicProfile(item){
        this.props.navigation.navigate('publicProfile', { profileId: item.authorId, profileOwner: item.name });
    }

    openLikes(item){
        this.props.navigation.navigate('likesScreen', { pollId: item.id });
    }

    setModalVisible(visible, item) {
        this.setState({ modalVisible: visible });
        this.setState({ modalData: item });
    }

    reportPost(){
        let userId = Fire.shared.uid;
        Fire.shared.reportPost(this.state.modalData.id , userId);
        this.setState({modalVisible: false, modalData: null});
        return this.onPressSendNotification()
    }

    deletePost(){
        const user = Fire.shared.uid;
        let id = this.state.modalData.id;
        if ( user === this.state.modalData.authorId ){
            Fire.shared.DeletePost(id)
            .then(ref => {
                this.componentDidMount()
                this.setState({ modalVisible: false, modalData: null});      
            })
            .catch(error => {
                alert(error);
            });
        } else {
            alert ('Not authorized to perfom this action')
        }
    }

    onPressSendNotification = () => {
        const options = {
            soundName: 'default',
            playSound: true,
            vibrate: true
        }
        this.localNotify.showNotification( 1, 'App Notification', 'Post Reported', {}, options)
    }

    emptyComponent = () => {
        return (
          <View style={[styles.postContainer, {height: 120, paddingHorizontal:-50}]}>
            <View style={{ margin: 25, alignItems: "center" }}>
                <Text style={[styles.text, { fontSize: 16, color: "black", fontWeight: "300" }]}>You will see polls of people you follow here when they choose to share in private. Start following other OutfitPic users. </Text>
            </View> 
          </View>
        )
    }

    renderFooter = () => {
        return ( 
            this.state.loading 
            ? <ActivityIndicator size="large"></ActivityIndicator> 
            : null )
    };

    renderItem = ({item,index}) => {
        return (
          <View style={styles.mediaImageContainer}> 
              <Image source={{ uri: item.url }} style={styles.image} resizeMode="cover"/>          
          </View>
        )
    };  
    
    renderPoll = ({item, index}) => {    
        return(   
            <View style={styles.postContainer}>      
                <View style={styles.feedItem}>
                    <TouchableOpacity onPress={() => this.openPublicProfile(item)}>
                            <Image source={item.avatar
                                ? { uri:item.avatar }
                                : require("../../../assets/default.png")} 
                            style={styles.avatar}/>
                    </TouchableOpacity>  

                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <View>
                                <TouchableOpacity onPress={() => this.openPublicProfile(item)}>
                                    <Text style={styles.name}>{item.name}</Text>
                                </TouchableOpacity>
                                <Text style={styles.timestamp}>{moment(item.timestamp).fromNow()}</Text>
                            </View> 
                            <TouchableOpacity onPress={() => this.setModalVisible(true, item)}>   
                                <Icon name="md-more" size={24} color="#52575D" style={{ marginRight: 5 }} /> 
                            </TouchableOpacity> 
                        </View>
                    </View>     
                </View>

                <View style={{marginTop: 2}}>
                    <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.modalVisible}
                    >
                    <TouchableWithoutFeedback onPress={() => {this.setModalVisible(!this.state.modalVisible)}}>
                        <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
                            <View style={styles.modal}>
                                <TouchableOpacity style={[styles.modalSection,{borderBottomWidth: 1,borderBottomColor: "#EBECF4"}]}  onPress={() => this.deletePost()}>
                                    <View style={{margin:20}}>
                                        <Text style={[styles.title,{color:'red'}]}>Delete</Text>
                                    </View>
                                </TouchableOpacity> 
                                <TouchableOpacity style={[styles.modalSection,{borderBottomWidth: 1,borderBottomColor: "#EBECF4"}]} onPress={() => this.reportPost()} >
                                    <View style={{margin:20}}>
                                        <Text style={[styles.title,{color:'red'}]}>Report</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.modalSection} onPress={() => { this.setModalVisible(!this.state.modalVisible)}}> 
                                    <View style={{margin:20}}>
                                        <Text style={styles.title}>Cancel</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>      
                    </Modal>
                </View>

                <View style={{ flex: 1, marginHorizontal: 10 }}>
                    <View style={{flexDirection: 'column'}}>
                    <Text style={styles.post}>{item.text}</Text>
                        <TouchableOpacity style={{alignItems:'center'}} activeOpacity={0.9} onPress={() => this.openPollBoard(item)}>
                            <FlatList
                                data={item.images}
                                renderItem = {this.renderItem}
                                keyExtractor={(item,index) => index.toString()}
                                horizontal={true}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: "row", marginLeft:10  }}>
                        <TouchableOpacity onPress={() => this.like(item)}>
                            <HeartButton uid={this.state.user.id} pollId={item.id} /> 
                        </TouchableOpacity>
                        {!item.blockComments 
                        ? <TouchableOpacity onPress={() => this.openComments(item)}>
                            <Icon name="ios-chatboxes" size={20} color="#73788B"/>
                          </TouchableOpacity>  
                        : null }  
                    </View>
                    <TouchableOpacity style={{marginLeft: 10, width:50}} onPress={() => this.openLikes(item)}>
                        <LikesButton pollId={item.id} /> 
                    </TouchableOpacity>
                </View>          
            </View>   
        );
    }
    
    render() { 
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content"></StatusBar>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Feed</Text> 
                    <View style={styles.menu}>
                        <TouchableOpacity onPress={this.props.navigation.openDrawer}>
                            <Icon name="ios-menu" size={24} color="#FFF"></Icon>
                        </TouchableOpacity>
                    </View>     
                </View>
                <Container>
                    <Tabs tabBarUnderlineStyle = {{backgroundColor: '#8E95AB'}}>
                        <Tab heading={<TabHeading><Icon name="md-globe" size={22} color="#4F566D" /></TabHeading>}>
                            <View style={styles.coverContainer}>
                                <FlatList
                                    style={styles.feedFlatlist}
                                    data={this.state.globalPosts}
                                    renderItem = {this.renderPoll}
                                    keyExtractor={item => item.id}
                                    showsVerticalScrollIndicator={false}
                                    onEndReached={this.retrieveMore}
                                    onEndReachedThreshold={0}
                                    refreshing={this.state.refreshing}
                                    ListFooterComponent={this.renderFooter}
                                    onRefresh={() => setTimeout(() => { this.componentDidMount() }, 200) }
                                ></FlatList>
                            </View>
                        </Tab>
                        <Tab heading={<TabHeading><Icon name="ios-people" size={22} color="#4F566D" /></TabHeading>}>
                            <View style={styles.coverContainer}>
                                <FlatList
                                    style={styles.feedFlatlist}
                                    data={this.state.privatePosts}
                                    renderItem = {this.renderPoll}
                                    keyExtractor={item => item.id}
                                    ListEmptyComponent={this.emptyComponent}  
                                    showsVerticalScrollIndicator={false}
                                    onEndReached={this.retrieveMorePrivatePosts}
                                    onEndReachedThreshold={0}
                                    refreshing={this.state.refreshingPrivate}
                                    ListFooterComponent={this.renderFooter}
                                    onRefresh={() => setTimeout(() => { this.componentDidMount() }, 200) }
                                ></FlatList>
                            </View>
                        </Tab>
                    </Tabs>
                </Container>            
            </View>
        );
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#E8EDF2",
    },
    postContainer: {
        flex:1, 
        flexDirection: 'column', 
        justifyContent:'center', 
        backgroundColor: "#FFF", 
        borderRadius: 12, 
        marginVertical: 6,
    },
    header: {
        flexDirection:'row',
        paddingTop: 50,
        paddingBottom: 20,
        //backgroundColor: "#8E95AB",
        backgroundColor:'#3e394d',
        alignItems: "center",
        justifyContent: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#EBECF4",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "200",
        color: "#FFF",
        fontFamily: "HelveticaNeue",
        //fontFamily:'Iowan Old Style'
    },
    text: {
        fontFamily: "HelveticaNeue",
        color: "#52575D"
    },
    feedFlatlist: {
        marginBottom: 10,
        marginHorizontal: 12,
        marginTop: 10,
    },
    menu: {
        position: "absolute",
        top: 50,
        right: 20,
        width: 32,
        height: 32,
        alignItems: "center",
        justifyContent: "center"
    },
    feedItem: {
        backgroundColor: "#FFF",
        borderRadius: 10,
        padding: 6,
        flexDirection: "row",
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 16
    },
    name: {
        fontSize: 14,
        fontWeight: "500",
        color: "#454D65"
    },
    timestamp: {
        fontSize: 11,
        color: "#C4C6CE",
        marginTop: 4
    },
    post: {
        marginBottom: 10,
        fontSize: 14,
        color: "#838899"
    },
    image: {
        flex: 1,
        height: undefined,
        width: undefined
      },
    mediaImageContainer: {
        width: 100,
        height: 114,
        //height: 120,
        borderRadius: 8,
        overflow: "hidden",
        marginHorizontal:4,
        marginBottom: 5
      },
    coverContainer: {
        flex:1,
        width: 100+'%',
        shadowColor: "#5D3F6A",
        shadowOffset: { height: 8 },
        shadowRadius: 10,
        shadowOpacity: 0.4   
    },
    modal:{
        flexDirection:'column',
        width: 300, 
        height: 180,
        padding: 10,
        justifyContent:"center",
        alignItems:'center',
        borderRadius: 12,
        backgroundColor:'#FBFBFB'
    },
    modalSection:{
        width: 100+'%',
        alignItems:'center', 
        justifyContent:'center', 
    },
    title: {
        fontWeight: "200",
        fontSize: 16,
        color: "#514E5A",
        fontFamily: "HelveticaNeue",
        //fontFamily: 'Baskerville'
    },     
});

export default Feed;

// <Text style={[styles.post,{fontSize:10}]}> {item.likesCount} Likes</Text>
