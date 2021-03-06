import React, { Component } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, FlatList } from 'react-native';
import Fire from "../../Fire";
import Icon from 'react-native-ionicons';
import StatsElement from '../presentation/StatsElement';

class Profile extends Component {
  static navigationOptions = {
    title: 'Profile',
  };

  constructor(props){
      super(props);
      this.state = {
          posts: [],
          user: {}
      }
  };    

  unsubscribe = null;
  unsubscribe2= null;

  componentDidMount(){
    const user = this.props.uid || Fire.shared.uid;
    this.unsubscribe = Fire.shared.firestore
        .collection("outfitPolls").where('uid','==', user).orderBy('timestamp','asc').limit(10)
        .onSnapshot(snapshot => {
            var postsFB = [];
            snapshot.forEach(doc => {
              postsFB = [({
                id: doc.id,
                text: doc.data().text,
                images: doc.data().images,
                authorId: doc.data().uid
              }), ...postsFB];
            });
            this.setState({ posts: postsFB });
        });
    this.unsubscribe2 = Fire.shared.firestore
        .collection("users")
        .doc(user)
        .onSnapshot(doc => {
            this.setState({ user: doc.data()});
        });    
  };

  componentWillUnmount() {
      this.unsubscribe();
      this.unsubscribe2();
  }

  openPollStats(item){
    this.props.navigation.navigate('pollStats', { pollId: item.id });
  }

  openFollowersList() {
    this.props.navigation.push('followersList', {userId: Fire.shared.uid, friendName: this.state.user.name, tabIndex: 0});
  };

  openProfileSettings = () => {
    this.props.navigation.navigate('profileSettings');
  }

  emptyComponent = () => {
    return (
      <View style={[styles.emptyContainer, {height: 120, paddingHorizontal:-50}]}>
        <View style={{ margin: 25, alignItems: "center" }}>
          <Text style={[styles.textEmptyContainer, { fontSize: 16, fontWeight: "300" }]}>Hi {this.state.user.name}! </Text>
          <Text> </Text>
          <Text style={[styles.textEmptyContainer, { fontSize: 16, fontWeight: "300" }]}>You will see the polls you create here, wait no longer and start sharing your style. </Text>
        </View> 
      </View>
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
          <View style={{ flex: 1, justifyContent:'center'}}>
            <TouchableOpacity onPress={() => this.openPollStats(item)}>
              <Text style={styles.post}>{item.text}</Text>
                <FlatList
                        data={item.images}
                        renderItem = {this.renderItem}
                        keyExtractor={(item,index) => index.toString()}
                        horizontal={true}
                />
            </TouchableOpacity>    
          </View>       
    );
  }
    
    render() {
      const {name, avatar, joined, numFollowers, numFollowing, numPosts} = this.state.user;
        return (
          <View style={styles.container}>
            <View style={styles.header}>
                    <View style={styles.back}>
                        <TouchableOpacity onPress={this.openProfileSettings}>
                            <Icon name="ios-cog" size={22} color="#FFF"></Icon>
                        </TouchableOpacity>
                    </View>     
                    <Text style={styles.headerTitle}>My Polls</Text> 
                    <View style={styles.menu}>
                        <TouchableOpacity onPress={this.props.navigation.openDrawer}>
                            <Icon name="ios-menu" size={24} color="#FFF"></Icon>
                        </TouchableOpacity>
                    </View>     
            </View>
            <View style={styles.container2}>
                <Image source={{ uri: avatar }} style={styles.avatar}></Image> 
                <TouchableOpacity style={{ flex:1 }} onPress={() => this.openFollowersList()}>
                  <StatsElement numPosts={numPosts} numFollowers={numFollowers} numFollowing ={numFollowing} ></StatsElement> 
                </TouchableOpacity>
            </View>
            <View style={styles.container3}>
                <Text style={styles.name}>{name}</Text>
                <Text style={{color:'#DFD8C8', fontSize: 12,fontWeight:'200', marginLeft: 14, fontFamily: "HelveticaNeue", textTransform: "uppercase"}}><Icon name="ios-calendar" size={16}/>  Joined in {joined}</Text>
            </View>
            <View style={styles.postsContainer}>
                    <FlatList
                        style={styles.feedFlatlist}
                        data={this.state.posts}
                        renderItem = {this.renderPoll}
                        keyExtractor={item => item.id}
                        ListEmptyComponent={this.emptyComponent}  
                        showsVerticalScrollIndicator={false}
                    ></FlatList>
            </View>
          </View>
        );
    }
    
  }

  const styles = StyleSheet.create({
    container: { 
      flex: 1,
      backgroundColor: '#FFF',
    },
    header: {
      flexDirection:'row',
      paddingTop: 50,
      paddingBottom: 20,
      backgroundColor:'#3e394d',
      alignItems: "center",
      justifyContent: "center",
      borderBottomWidth: 1,
      borderBottomColor: "#EBECF4",
      shadowColor: "#454D65",
      shadowOffset: { height: 5 },
      shadowRadius: 15,
      shadowOpacity: 0.2,
      zIndex: 10
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "200",
      color: "#FFF",
      fontFamily: "HelveticaNeue",

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
    container2: {
      flexDirection: "row",
      backgroundColor: "#E8EDF2",
      justifyContent: "space-between",
      paddingTop: 20,
      paddingBottom: 20,
      paddingHorizontal: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#D8D9DB"
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginHorizontal: 10,
      borderWidth: 3,
      borderColor: "#FFF"
    },
    name: {
      color: "#DFD8C8",
      fontSize: 15,
      fontWeight: "400",
      marginVertical: 8,
      margin: 14,
      fontFamily: "HelveticaNeue"
    },
    container3: {
      flexDirection:'column',
      paddingBottom: 10,
      backgroundColor:'#252B3B',
      borderBottomColor: "#EAEAED",
      borderBottomWidth: 1,
    },
    postsContainer: {
      alignItems: 'center',
      shadowColor: "#5D3F6A",
      shadowOffset: { height: 5 },
      shadowRadius: 8,
      shadowOpacity: 0.2
    },
    feedFlatlist: {
      marginBottom: 300,
      marginHorizontal: 5,
      marginTop: 10,
    },
    image: {
      flex: 1,
      height: undefined,
      width: undefined
    },
    mediaImageContainer: {
        //width: 90,
        width: 108,
        //height: 110,
        height: 120,
        borderRadius: 8,
        overflow: "hidden",
        marginHorizontal:5,
        marginBottom: 5
      },
    post: {
      marginBottom: 10,
      fontSize: 14,
      color: "#838899"
    },
    back: {
      position: "absolute",
      top: 50,
      left: 20,
      width: 20,
      height: 28,
      alignItems: "center",
      justifyContent: "center"
    },  
    emptyContainer: {
      flex:1, 
      flexDirection: 'column', 
      justifyContent:'center', 
      backgroundColor: "#FFF", 
      borderRadius: 12, 
      marginVertical: 6,
    },
    textEmptyContainer: {
      fontFamily: "HelveticaNeue",
      color: "black"
  }, 
      
  });
   

export default Profile;
