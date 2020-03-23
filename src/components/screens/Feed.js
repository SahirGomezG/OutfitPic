import React, { Component } from "react";
import { View, Text, StyleSheet, Image, FlatList, TouchableWithoutFeedback, TouchableOpacity, StatusBar, Modal } from "react-native";
import Fire from "../../Fire";
import moment from "moment";
import Icon from 'react-native-ionicons';
import HeartButton from '../presentation/HeartButton';
import { Tab, Tabs, Container, TabHeading } from 'native-base';
import { notificationManager } from '../../NotificationManager';

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
            user: {},
            globalPosts: [],
            privatePosts: [],
            isLoading: true,
            modalVisible: false,
        }
    };    

    unsubscribe = null;
    unsubscribe2 = null;

    componentDidMount(){
        const user = this.props.uid || Fire.shared.uid;
        let pollsRef = Fire.shared.firestore.collection("outfitPolls");
        let currentuserRef = Fire.shared.firestore.collection("users").doc(user);
        this.localNotify = notificationManager;
        this.localNotify.configure(this.onRegister, this.onNotification, this.onOpenNotification, this.senderId)

        currentuserRef.get()
        .then(doc => {
            this.setState({ user: doc.data() });
        });

        let query1 = pollsRef.where('privatePoll','==', false).orderBy('timestamp','desc').limit(10);
        let query2 = pollsRef.where('privatePoll','==', true).where('followers', 'array-contains', user).orderBy('timestamp','desc').limit(10);
            
        this.unsubscribe = query1
            .onSnapshot(snapshot => {
                var postsFB = [];
                snapshot.forEach(doc => { 
                        postsFB = [({
                            id: doc.id,
                            name: doc.data().user.name,
                            text: doc.data().text,
                            timestamp: doc.data().timestamp,
                            avatar: doc.data().user.avatar,
                            images: doc.data().images,
                            blockComments: doc.data().blockComments,
                            authorId: doc.data().uid,
                            likesCount: doc.data().likesCount,
                        }), ...postsFB];                   
                })       
                this.setState({ globalPosts: (postsFB.reverse()) });
                this.setState({ isLoading: false });
            });  
        this.unsubscribe2 = query2
            .onSnapshot(snapshot => {
                var postsFB = [];
                snapshot.forEach(doc => { 
                        postsFB = [({
                            id: doc.id,
                            name: doc.data().user.name,
                            text: doc.data().text,
                            timestamp: doc.data().timestamp,
                            avatar: doc.data().user.avatar,
                            images: doc.data().images,
                            blockComments: doc.data().blockComments,
                            authorId: doc.data().uid,
                            likesCount: doc.data().likesCount,
                        }), ...postsFB];                   
                })       
                this.setState({ privatePosts: (postsFB.reverse()) });
            });         
    };

    componentWillUnmount() {
        this.unsubscribe();
        this.unsubscribe2();
    }

    onRegister(token){
        console.log("[Notification] Registered: ", token)
    }

    onNotification(notify) {
        console.log("[Notification] onNotification: ", notify )
    }

    onOpenNotification(notify) {
        console.log("[Notification] onOpenNotification: ", notify)
        alert('This is a new notification from OutfitPic')
    }

    get user() {
        return {
            _id: this.props.uid || Fire.shared.uid,
            name: this.state.user.name,
            avatar: this.state.user.avatar
        };
    }

    setModalVisible(visible) {
        this.setState({modalVisible: visible});
    }

    like(item){   
        let pollId = item.id;
        Fire.shared.LikePoll(pollId, this.user )
    };

    openPollBoard(item){
        this.props.navigation.navigate('poll', { pollOwner: item.name, pollId: item.id });
    }
    
    openComments(item){
        this.props.navigation.navigate('comments', { pollId: item.id });
    }

    openPublicProfile(item){
        this.props.navigation.navigate('publicProfile', { profileId: item.authorId, profileOwner: item.name });
    }

    onPressSendNotification = () => {
        const options = {
            soundName: 'default',
            playSound: true,
            vibrate: true
        }
        this.localNotify.showNotification(
            1,
            'App Notification',
            'Local Notification',
            {}, //data
            options //options
        )
    }

    renderItem = ({item,index}) => {
        return (
          <View style={styles.mediaImageContainer}> 
              <Image source={{ uri: item.url }} style={styles.image} resizeMode="cover"/>          
          </View>
        )
    };  
    
    renderPoll = ({item, index}) => {    
        return(   
            <View style={{flex:1, flexDirection: 'column', justifyContent:'center', backgroundColor: "#FFF", borderRadius: 12, marginVertical: 8}}>
                <StatusBar backgroundColor='blue' barStyle="dark-content"></StatusBar>
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
                            <TouchableOpacity onPress={() => this.setModalVisible(true)}>   
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
                        <View style={{flex:1, alignItems:'center', justifyContent:'center',marginTop: 22}}>
                            <View style={styles.modal}>
                                <TouchableOpacity style={{borderBottomWidth: 1,borderBottomColor: "#EBECF4"}} onPress={this.onPressSendNotification}>
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

                <View style={{ flex: 1, marginHorizontal:20}}>
                    <TouchableOpacity onPress={() => this.openPollBoard(item)}>
                        <Text style={styles.post}>{item.text}</Text>
                        <FlatList
                            data={item.images}
                            renderItem = {this.renderItem}
                            keyExtractor={(item,index) => index.toString()}
                            horizontal={true}
                        />
                    </TouchableOpacity>
                    <View style={{ flexDirection: "row" }}>
                        <TouchableOpacity onPress={() => this.like(item)}>
                            <HeartButton uid={this.state.user.id} pollId={item.id} />
                            <Text style={[styles.post,{fontSize:10}]}> {item.likesCount} Likes</Text>
                        </TouchableOpacity>
                        {!item.blockComments ? 
                        (<TouchableOpacity onPress={() => this.openComments(item)}>
                            <Icon name="ios-chatboxes" size={20} color="#73788B"/>
                        </TouchableOpacity> ) : (null)
                        }  
                    </View>
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
                                    refreshing={this.state.isLoading}
                                    onRefresh={this.componentDidMount}
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
                                    showsVerticalScrollIndicator={false}
                                    refreshing={this.state.isLoading}
                                    onRefresh={this.componentDidMount}
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
        backgroundColor: "#E8EDF2"
    },
    header: {
        flexDirection:'row',
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: "#8E95AB",
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
    feedFlatlist: {
        marginBottom: 10,
        marginHorizontal: 16,
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
        padding: 8,
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
        width: 94,
        //width: 100,
        height: 110,
        //height: 120,
        borderRadius: 8,
        overflow: "hidden",
        marginHorizontal:4,
        marginBottom: 5
      },
    coverContainer: {
        shadowColor: "#5D3F6A",
        shadowOffset: { height: 5 },
        shadowRadius: 8,
        shadowOpacity: 0.2
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

export default Feed;

/*{!this.state.liked ? 
                        (<TouchableOpacity onPress={() => this.like(item)}> 
                            <Icon name="ios-heart-empty" size={20} color="#73788B" style={{ marginRight: 16 }} />
                        </TouchableOpacity>) : 
                        (<TouchableOpacity onPress={() => {this.likedToggled()}}> 
                            <Icon name="ios-heart" size={20} color="#FF2D42" style={{ marginRight: 16 }} />
                        </TouchableOpacity>)}*/