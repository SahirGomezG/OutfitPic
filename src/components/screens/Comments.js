import React, { Component } from 'react';
import {
  Text,
  Image,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  StatusBar,
  ListView,
  FlatList,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView
} from 'react-native';
import Fire from "../../Fire";
import Icon from 'react-native-ionicons';
import moment from 'moment';


class Comments extends Component {
  static navigationOptions = {
    title: 'Comments',
    header: null
  };

  constructor(props) {
      super(props);
      this.state = {    
          pollId: this.props.navigation.state.params.pollId,  
          profileId : this.props.navigation.state.params.profileId,
          user: {},
          comments: [],
          newComment: '',
          blocked: false,
      }
  };  
  
  unsubscribe = null;
  unsubscribe2 = null;

  componentDidMount() {
    const user = this.props.uid || Fire.shared.uid;
    const profileId = this.state.profileId;
    let profileRef = Fire.shared.firestore.collection('users').doc(profileId);

    this.unsubscribe = Fire.shared.firestore
          .collection('outfitPolls')
          .doc(this.state.pollId)
          .collection('comments').orderBy('timestamp','desc')
          .onSnapshot(snapshot => {
            const comments = snapshot.docs
              .map(doc => ({id: doc.id, ...doc.data()}));
            this.setState({ comments: comments}); 
          });
    Fire.shared.firestore
          .collection('users')
          .doc(user)
          .get().then(doc => {
              this.setState({ user: doc.data() });
          }); 

    const blockedRef = profileRef.collection('blocked');
    let query2 = blockedRef.where('id','==', user );  // Check is current user has been blocked by this profile
    this.unsubscribe2 = query2.onSnapshot(querySnapshot => {
          if (!querySnapshot.empty) {
            this.setState({ blocked: true })
          } else { 
            this.setState({ blocked: false })
          }
    })           
  };

  componentWillUnmount() {
    this.unsubscribe();
    this.unsubscribe2();
  }

  get user() {
    return {
        _id: this.props.uid || Fire.shared.uid,
        name: this.state.user.name,
        avatar: this.state.user.avatar
    };
  }

  addComment(text){
    const blocked = this.state.blocked;
    if ( !blocked ) {
    Fire.shared.addComment(this.state.pollId, text, this.user )
      .then(ref => { 
        this.setState({ newComment: "" })
      })
      .catch(error => { 
        alert(error)
      });
    } else {
      alert('Unfortunately, you are not allowed to comment on this poll')
    }
  };

  renderRow = (item) => {
    return (

      <View style={styles.commentView}>
        <Image source={item.user.avatar
                    ? { uri: item.user.avatar }
                    : require("../../../assets/default.png")} 
              style={styles.avatar}>
        </Image>
        <View style={{flex:1, marginLeft:5}}>
            <Text style={styles.roomLiText}>{item.user.name}</Text>
            <Text style={{fontSize:11}}>{item.text}</Text>
            <Text style={styles.timestamp}>{moment(item.timestamp).fromNow()}</Text>
        </View>
      </View>
    )
  };

  render() {
    return ( 
      <KeyboardAvoidingView style = {{ flex:1,  backgroundColor: "#EBECF4"}} behavior="padding" enabled>  
          <View style={styles.container}>
              <View style={styles.circle}/>
              <View style={styles.header}>
                <TouchableOpacity style={styles.back} onPress={() => this.props.navigation.goBack()}>
                   <Icon name="arrow-round-back" color={'#FFF'}></Icon>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Comments</Text>
              </View>
                    
              <View style={styles.roomsListContainer}>
                <FlatList
                  data={this.state.comments}
                  renderItem={({item}) => this.renderRow(item)}
                  //keyExtractor={item => item.key}
                  keyExtractor={(item,index) => index.toString()}
                  showsVerticalScrollIndicator={false}
                />
              </View>

              <View style={styles.commentInputContainer}>
                    <View style={{margin:10,}}>
                      <Image source={this.user.avatar
                          ? { uri: this.user.avatar }
                          : require("../../../assets/default.png")} 
                          style={styles.avatar}>
                      </Image>
                    </View>
                      
                    <TextInput  
                          style={styles.input}
                          multiline={true}
                          maxLength={140}
                          placeholder={" New comment..."}
                          onChangeText={(text) => this.setState({newComment: text})}
                          value={this.state.newComment}
                    />
                    <TouchableHighlight style={styles.postButton} underlayColor="#fff" onPress={() => this.addComment(this.state.newComment)}>
                        <Text>Post</Text>
                    </TouchableHighlight>
              </View> 
          </View>
        </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "#F4F5F7",
    },
    circle: {
        width: 500,
        height: 500,
        borderRadius: 500 / 2,
        backgroundColor: "#FFF",
        position: "absolute",
        left: -120,
        top: -20
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "200",
      color: "#FFF",
      fontFamily: "HelveticaNeue",
    },
    header: {
      flexDirection:'row',
      paddingTop: 50,
      marginBottom: -42,
      paddingBottom: 20,
      backgroundColor:'#3e394d',
      alignItems: "center",
      justifyContent: "center",
      borderBottomWidth: 1,
      borderBottomColor: "#EBECF4",
    },
    commentView:{
      margin: 10,
      flexDirection: "row"
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 10
    },
    timestamp: {
      fontSize: 11,
      color: "#C4C6CE",
      marginTop: 4
    },
    commentInputContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      backgroundColor: '#fff',
      borderBottomColor: '#f9f9f9',
      borderBottomWidth: 2,
      marginBottom: 5
    },
    input: {
      flex: 1,
      height: 40,
      fontSize: 14,
      color: 'black',
      borderColor: '#f9f9f9',
      borderWidth: 2,
      borderRadius: 20,
      marginLeft:-10,
      paddingLeft: 10
    },
    postButton: {
      alignItems: 'center',
      justifyContent: 'center',
      padding:10
    },
    roomsListContainer: {
      flex: 1,
      //alignItems: 'flex-start',
      justifyContent: 'center',
      flexDirection: 'row',
      marginTop: 40,
      backgroundColor: 'transparent'
    },
    roomLi: {
      flex: 1,
      backgroundColor: 'transparent',
      borderBottomColor: '#eee',
      borderColor: 'transparent',
      borderWidth: 1,
      paddingLeft: 20,
      paddingTop: 14,
      paddingBottom: 16,
    },
    roomLiText: {
      fontSize: 12,
      color: "#514E5A",
      fontWeight: "600"
    },
    back: {
      position: "absolute",
      top: 50,
      left: 20,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "rgba(21, 22, 48, 0.1)",
      alignItems: "center",
      justifyContent: "center"
    },
  });

export default Comments;