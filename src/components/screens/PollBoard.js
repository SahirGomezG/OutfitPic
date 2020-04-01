import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, TouchableHighlight, Keyboard, TouchableWithoutFeedback, FlatList, Dimensions, ImageBackground, Modal } from "react-native";
import Icon from 'react-native-ionicons';
import moment from "moment";
import Fire from "../../Fire";
import ImageZoom from 'react-native-image-pan-zoom';
import ProgressCircle from 'react-native-progress-circle';
import Dialog from "react-native-dialog";

class PollBoard extends Component {

  static navigationOptions = ({ navigation }) => ({
    title: navigation.state.params.pollOwner,
    header: null
  })

    constructor(props) {
        super(props);
        this.state = {
            pollOwner : this.props.navigation.state.params.pollOwner,
            pollId: this.props.navigation.state.params.pollId,
            user: {},
            poll: {},
            blockComments: false,
            privatePoll: false,
            ownerAvatar: '',
            modalVisible: false,
            dialogVisible: false,
            photos:[],

            modalImage: 'https://lh3.googleusercontent.com/PsNYOb7sTef-wh0JCHO4rLMnGDti3Fdpo-Df3hyMPe2IsLwyduf9B8XqSst50wxUhWKlXh8a2D5-6l8oL3AAa2C8',
            liked: true,
        };
    }  

    unsuscribe = null;
    unsubscribe = null;

    componentDidMount() {
      const user = this.props.uid || Fire.shared.uid;
      const pollId = this.state.pollId;

      this.unsuscribe = Fire.shared.firestore
          .collection("users")
          .doc(user)
          .get()
          .then(doc => {
              this.setState({ user: doc.data() });
          });
      this.unsubscribe = Fire.shared.firestore
          .collection("outfitPolls")
          .doc(pollId)
          .onSnapshot(doc => {
            this.setState({ poll: doc.data() });
            this.setState({ blockComments: doc.data().blockComments});
            this.setState({ ownerAvatar: doc.data().user.avatar})
            this.setState({ privatePoll: doc.data().privatePoll});
            this.setState({ photos: doc.data().images});
          });
      let ParticipantsRef = Fire.shared.firestore
          .collection('outfitPolls')
          .doc(pollId)
          .collection('participants')
          .doc(user);
      let getDoc = ParticipantsRef.get()
          .then(doc => { 
            if (!doc.exists) {
              this.setState({liked :false})
          }});                 
    };

    componentWillUnmount() {
      this.unsubscribe();
      //this.unsuscribe();
    };

    setModalVisible(visible,imageKey) {
      this.setState({modalImage: this.state.photos[imageKey].url});
      this.setState({modalVisible: visible});
    };

    get user() {
      return {
          _id: this.props.uid || Fire.shared.uid,
          name: this.state.user.name,
          avatar: this.state.user.avatar
      };
    }

    addVote(id){
      const idRef = id.toString();
      Fire.shared.LikeOutfit(this.state.pollId, idRef, this.user )
        .then(ref => { 
          this.setState({ dialogVisible: false });
          this.props.navigation.goBack();
        })
        .catch(error => { 
          alert(error)
        });
    };

    deleteItem = data => {
      let allItems = [...this.state.photos];
      let filteredItems = allItems.filter(item => item.id != data.id);
      this.setState({ photos: filteredItems })
    };

    openComments(){
      this.props.navigation.navigate('comments', { pollId: this.state.pollId});
    }

    showDialog = () => {
      this.setState({ dialogVisible: true });
    };
   
    handleCancel = () => {
      this.setState({ dialogVisible: false });
    };

    renderItem = ({item,index}) => {
      const { liked } = this.state;
    
    return (
        <View style={styles.mediaImageContainer}>
          <TouchableWithoutFeedback key={index} onPress={() => {this.setModalVisible(true,index)}}>
            <ImageBackground source={{ uri: item.url }} style={styles.image} resizeMode="cover">
                {!liked ? (
                <View style={{ flexDirection:'row',justifyContent: 'space-between', marginHorizontal: 10, marginTop: 334}}>
                  <TouchableOpacity style={styles.dislikeContainer} onPress={() => this.deleteItem(item)}>
                      <Icon name="md-thumbs-down" size={30} color="white" ></Icon>
                  </TouchableOpacity>
                  <TouchableOpacity key={index} onPress={this.showDialog} style={styles.likeContainer}>
                      <Icon name="md-heart" size={30} color="white" ></Icon>
                  </TouchableOpacity>    
                </View>): null}    
            </ImageBackground>        
          </TouchableWithoutFeedback>
                    <View>
                      <Dialog.Container visible={this.state.dialogVisible}>
                        <Dialog.Title>Pick an outfit</Dialog.Title>
                          <Dialog.Description>
                            Awesome! Remember you can't undo your vote.
                          </Dialog.Description>
                        <Dialog.Button label="Cancel" onPress={this.handleCancel} />
                        <Dialog.Button label="Send" onPress={() => this.addVote(item.id)} />
                      </Dialog.Container>
                    </View>
        </View>
    )
  };

    render() {
      const { privatePoll, blockComments } = this.state;
      const differenceTime = moment(this.state.poll.timestamp).diff(moment(),'hours')*-1; //Diference in hours from timestamp till now
      const timeLeft = (this.state.poll.duration - differenceTime).toString();
      const percentage = 100-(Math.round(((this.state.poll.duration - differenceTime)/this.state.poll.duration)*100));
      const expired = timeLeft >= 0 ? false : true;
     
        return (
            <SafeAreaView style={styles.container}>
              <View style={{ alignItems: "center" }}>
                  <TouchableOpacity style={styles.back} onPress={() => this.props.navigation.goBack()}>
                      <Icon name="arrow-round-back"></Icon>
                  </TouchableOpacity>

                    <View style={{ alignItems: "center", marginTop: 24 }}>
                        <Text style={[styles.textLight, { fontSize: 12 }]}>OUTFITPIC    {privatePoll ? (<Icon name="ios-lock" size={15} color="#4F566D" />) : (<Icon name="md-globe" size={15} color="#4F566D" />)}</Text>
                        <View style={{flexDirection: 'row', marginTop:10}}>
                          <Image source={this.state.ownerAvatar
                            ? { uri: this.state.ownerAvatar }
                            : require("../../../assets/default.png")} 
                              style={{width: 20,height: 20, borderRadius: 10, marginRight: 10}}>
                          </Image>
                          <Text style={[styles.text, { fontSize: 16, marginTop: 1 }]}>{this.state.pollOwner}</Text>
                        </View>
                    </View>

                    <View style={styles.coverContainer}>
                      <FlatList
                          data={this.state.photos}
                          //data={this.state.poll.images}
                          renderItem= {this.renderItem}
                          keyExtractor={(item,index) => index.toString()}
                          //extraData={this.state.poll.images}
                          horizontal={true}          
                      />         
                    </View>

                    <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 8 }}>
                        <View style={{ alignItems: "center", marginTop: 20}}>
                          <Text style={[styles.text, { fontSize: 15, fontWeight: "500"}]}>Pick 1 outfit</Text>    
                          <Text style={[styles.textDark, { fontSize: 16, fontWeight: "500", marginTop: 8  }]}> Event: <Text style={[styles.text,{ fontSize: 15}]}>{this.state.poll.text}</Text></Text>                 
                        </View>
                        <TouchableOpacity style={styles.playButtonContainer} >
                        <ProgressCircle
                            percent={percentage}
                            radius={40}
                            borderWidth={5}
                            color='#252B3B'
                            shadowColor="#c7bacc"
                            bgColor="#fff"
                        >
                          {!expired ? (
                            <Text style={[styles.textDark,{fontSize:12, fontWeight: "500", fontFamily: 'Iowan Old Style'}]}>{timeLeft}hr left</Text>):(
                            <Text style={[styles.textDark,{fontSize:12, fontWeight: "500", fontFamily: 'Iowan Old Style'}]}>Closed</Text>)
                          }  
                        </ProgressCircle>
                        </TouchableOpacity>
                         
                    </View>
          
                    <View>
                        {blockComments ? (
                          <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 30, margin:25 }}>
                              <Image source={this.state.user.avatar
                                ? { uri: this.state.user.avatar }
                                : require("../../../assets/default.png")} 
                                style={styles.avatar}>
                              </Image>
                              <View style={{borderRadius: 20, backgroundColor: 'white', height: 40, width: 80+'%',justifyContent: "center"}}>
                                <Text style={{color:'#3D425C', marginLeft: 10}}><Icon name="ios-lock" size={15} /> - Comments blocked for this poll</Text>
                              </View>
                          </View>  
                        ) : (
                          <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 30, margin:25 }}>
                            <Image source={this.state.user.avatar
                              ? { uri: this.state.user.avatar }
                              : require("../../../assets/default.png")} 
                              style={styles.avatar}>
                            </Image>
                            <TouchableOpacity onPress={() => this.openComments()}>       
                              <View style={{borderRadius: 20, backgroundColor: 'white', height: 40, width: 250,justifyContent: "center"}}>
                                <Text style={[styles.textLight,{fontSize:11}] }>    View/Add comments...</Text>
                              </View>
                            </TouchableOpacity>                   
                          </View>) 
                        } 
                  </View>

                    <View style={{marginTop: 22}}>
                      <Modal
                        style={styles.modal}
                        animationType="slide"
                        transparent={true}
                        visible={this.state.modalVisible}
                        onRequestClose={() => {Alert.alert('Modal has been closed.');
                      }}>
                        <View style={styles.modal}>
                            <TouchableHighlight onPress={() => { this.setModalVisible(!this.state.modalVisible,0)}}>
                              <Icon name="ios-close-circle" size={45} color="#fff" />
                            </TouchableHighlight>
                            
                            <ImageZoom cropWidth={Dimensions.get('window').width}
                                      cropHeight={Dimensions.get('window').height-200}
                                      imageWidth={400}
                                      imageHeight={400}>
                                <Image style={{width:400, height:400, flex:1}}
                                      source={{ uri:this.state.modalImage }}/>
                            </ImageZoom> 
                        </View>
                      </Modal>
                    </View>

                  </View>
            </SafeAreaView>              
        )
    }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: "#EAEAEC",
    backgroundColor: "#E8EDF2"
  },
  modal:{
    flex:1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  back: {
    position: "absolute",
    top: 30,
    left: 30,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(21, 22, 48, 0.1)",
    alignItems: "center",
    justifyContent: "center"
  },
  likeContainer:{
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#7BE383",
    alignItems: "center",
    justifyContent: "center",
    position: 'absolute', 
    right: 10,
    borderColor: "rgba(93, 63, 106, 0.2)",
    borderWidth: 5,
  },
  dislikeContainer:{
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#983627",
    alignItems: "center",
    justifyContent: "center",
    position: 'absolute', 
    left:10,
    borderColor: "rgba(93, 63, 106, 0.2)",
    borderWidth: 5,
  },
  textLight: {
    color: "#B6B7BF"
  },
  text: {
    color: "#8E97A6"
  },
  textDark: {
    color: "#3D425C"
  },
  coverContainer: {
    marginTop: 30,
    width: 400,
    height: 400,
    shadowColor: "#5D3F6A",
    shadowOffset: { height: 15 },
    shadowRadius: 8,
    shadowOpacity: 0.3
  },
  cover: {
    width: 200,
    height: 200,
    borderRadius: 125
  },
  timeStamp: {
    fontSize: 11,
    fontWeight: "500"
  },
  playButtonContainer: {
    width: 80,
    height: 80,
    alignItems: "center",
    marginHorizontal: 40,
    marginTop: 20,
    shadowColor: "#5D3F6A",
    shadowRadius: 30,
    shadowOpacity: 0.5
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 20
  },
  comment: {
    marginLeft: 8, 
    padding: 5, 
    backgroundColor:'white',
    height: 50,
    width: 80+'%',
    borderRadius: 8,
  },
  section: {
    flexDirection: "column",
    marginHorizontal: 14,
    marginBottom: 10,
    paddingBottom: 15,
    borderBottomColor: "#EAEAED",
    borderBottomWidth: 1
  },
  image: {
    flex: 1,
    height: undefined,
    width: undefined
  },
  mediaImageContainer: {
    width: 380,
    height: 400,
    borderRadius: 20,
    overflow: "hidden",
    marginHorizontal: 10,
  }, 
});

export default PollBoard;

/*
<View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 8 }}>
                        <TouchableOpacity>
                            <Icon name="ios-thumbs-down" size={32} color="red"></Icon>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.playButtonContainer} >
                            <Icon
                                name="flame"
                                size={32}
                                color="#3D425C"
                                style={[styles.playButton, { marginLeft: 1 }]}
                            ></Icon>
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Icon name="ios-heart" size={32} color="green"/>
                        </TouchableOpacity>
                    </View>*/
                  
  

