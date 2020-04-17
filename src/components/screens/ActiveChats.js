import React, { Component } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, PanResponder} from 'react-native';
import { Container, Header, Item, Input, Icon, Button, List, ListItem, Left, Body, Right, Thumbnail } from 'native-base';
import Fire from "../../Fire";
import _ from 'lodash';
import moment from "moment";
import Dialog from "react-native-dialog";

class ActiveChats extends Component {
    static navigationOptions = {
        title: 'Chat',
        header: null
      };
  
    constructor(props){
          super(props);
          this.state = {
              loading: false,
              data:[],
              fullData: [],
              query: "",
              marginLeft: 1,
              modalVisible: false,
              modalData: null
        }
    }
  
    unsubscribe = null;
  
    componentDidMount(){
        this.setState({ loading: true });
        const user = this.props.uid || Fire.shared.uid;
        let currentuserRef = Fire.shared.firestore.collection("users").doc(user);
        let chatRef = currentuserRef.collection('chats');
  
        this.unsubscribe = chatRef.onSnapshot(snapshot => {
            var friends = [];
            snapshot.forEach(doc => {
                friends = [({
                    id: doc.data().id,
                    name: doc.data().name,
                    avatar: doc.data().avatar,
                    timestamp: doc.data().timestamp,
                    message: doc.data().message,
                    chatKey: doc.data().chatKey
                    }), ...friends];       
                });
            this.setState({ fullData: friends });
            this.setState({ data: friends });
            this.setState({ loading: false })
        });     
    }
  
    componentWillUnmount() {
        this.unsubscribe();
    }

    openMessages(user) {
        this.props.navigation.navigate('privateChat', {chatKey: user.chatKey, friendName: user.name});
    };
    
    openPublicProfile(user){
        this.props.navigation.navigate('publicProfile', { profileId: user.id, profileOwner: user.name });
    };

    deleteChat(){
        let id = this.state.modalData.id;
        Fire.shared.DeleteChat(id);
        this.setState({ modalVisible: false, modalData: null}); 
    }

    showDialog (visible, item) {
        this.setState({ modalVisible: visible  });
        this.setState({ modalData: item });
    };

    handleCancel = () => {
        this.setState({ modalVisible: false });
        this.setState({ modalData: null });
    };
      
    contains = ({ name }, query) => {
        if (name.includes(query)){
          return true;
        }
        return false;
    };
  
    handleSearch(text){
        const formatQuery = text.toLowerCase();
        const data = _.filter(this.state.fullData, item => {
            return this.contains(item,formatQuery);
          });
        this.setState({ query: formatQuery, data });  
    }
  
    renderFooter = () => {
        if (!this.state.loading) return null
        return (
          <View style={{paddingVertical: 20, borderTopWidth: 1, borderColor: '#CED0CE'}}>
             <ActivityIndicator animating size='large'/>
          </View>
        )
    }
  
    _renderItem = ({item, index}) => {
        return (
            <ListItem avatar>  
                <Left>
                    <TouchableOpacity activeOpacity={0.9} onPress={() => this.openPublicProfile(item)}> 
                        <Thumbnail style={styles.avatar} source={{ uri: item.avatar }} />  
                    </TouchableOpacity>                  
                </Left>
  
                <Body>
                    <TouchableOpacity activeOpacity={0.9} onPress={() => this.openMessages(item)}> 
                        <Text style={styles.nameText}>{item.name}</Text>
                        <Text style={styles.emailText} numberOfLines={1} note> {item.message} </Text>
                    </TouchableOpacity>    
                </Body>
      
                <TouchableOpacity activeOpacity={0.9} style={{marginRight:10}} onPress={() => this.openMessages(item)}>  
                    <Text style={styles.emailText} note>{moment(item.timestamp).fromNow()}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.showDialog(true, item)}>
                    <Icon name="trash" style={{fontSize: 25, color: 'grey', margin:5, marginRight:10}}></Icon>
                </TouchableOpacity>

                <View>
                  <Dialog.Container visible={this.state.modalVisible}>
                    <Dialog.Title>Delete conversation?</Dialog.Title>
                      <Dialog.Description>
                        This conversation will be deleted from your inbox. The other person in the conversation will still be able to see it. 
                      </Dialog.Description>
                    <Dialog.Button label="Cancel" onPress={this.handleCancel} />
                    <Dialog.Button label="Delete" onPress={() => this.deleteChat()} />
                  </Dialog.Container>
                </View>           
            </ListItem>
        )
    }
  
      render() {
          return (
              
                <Container style={styles.container}>
                  <View style={styles.circle} />
  
                    <View style={styles.header}>
                      <Text style={styles.headerTitle}>Chat</Text> 
                        <View style={styles.menu}>
                            <TouchableOpacity onPress={this.props.navigation.openDrawer}>
                                <Icon name="ios-menu" style={{fontSize: 25, color: 'white'}}></Icon>
                            </TouchableOpacity>
                        </View>     
                    </View>
  
                    <Header searchBar rounded>
                      <Item>
                          <Icon name="ios-search" size={20} />
                            <Input placeholder="Search" onChangeText = {text => this.handleSearch(text)} />
                          <Icon name="ios-people" size={20} />
                      </Item>
                      <Button transparent>
                          <Text>Search</Text>
                      </Button>
                    </Header>
                    <List>
                      <FlatList
                        data={this.state.data}
                        renderItem={this._renderItem}
                        keyExtractor={(item,index) => index.toString()}
                        renderFooter={this.renderFooter}
                      />
                    </List>
                </Container>           
          );
      }
  }
  
  const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: "#E8EDF2",
        //backgroundColor: "#F4F5F7",
      },
      header: {
        flexDirection:'row',
        paddingTop: 50,
        marginBottom: -25,
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
      avatar: {
        width: 54,
        height: 54,
        borderRadius: 27,
        marginRight: 2,
        marginLeft: 8
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
      input: {
        marginTop: 32,
        height: 50,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "#BAB7C3",
        borderRadius: 30,
        paddingHorizontal: 16,
        color: "#514E5A",
        fontWeight: "600"
      },
      nameText: {
        fontSize: 13,
        color: "#514E5A",
        fontWeight: "600",
        marginBottom: 5,
        marginTop:5
      },
      emailText: {
        fontSize: 11,
        color: "#514E5A",
        fontWeight: "400"
      },
      menu: {
        position: "absolute",
        top: 50,
        right: 20,
        width: 20,
        height: 28,
        alignItems: "center",
        justifyContent: "center"
      },
  });

export default ActiveChats;
