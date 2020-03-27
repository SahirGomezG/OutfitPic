'use strict'
import React, { Component } from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator} from 'react-native';
import Fire from "../../Fire";
import { Container, Header, Item, Input, Icon, Button, List, Tab, Tabs, ListItem, Left, Body, Thumbnail } from 'native-base';
import _ from 'lodash';
import FollowingButton from "../presentation/FollowingButton";

class FollowersList extends Component {
    static navigationOptions = {
      title: 'My Network',
      header: null
    };

    constructor(props){
        super(props);
        this.state = {
            userId: this.props.navigation.state.params.userId,
            userName: this.props.navigation.state.params.friendName,
            index: this.props.navigation.state.params.tabIndex,
            myName:'',
            myId: this.props.uid,
            loading: false,
            data:[],
            fullData: [],
            data2: [],
            fullData2: [],
            query: "",
        }
    }

    unsubscribe = null;
    unsubscribe2 = null;

    componentDidMount(){
        const user = this.props.uid || Fire.shared.uid;
        let userRef = Fire.shared.firestore.collection("users").doc(this.state.userId);
        let currentuserRef = Fire.shared.firestore.collection("users").doc(user);
        currentuserRef.get()
        .then(doc => {
            this.setState({ myName: doc.data().name });
        });

        this.unsubscribe = userRef
            .collection('followers').limit(15)
            .onSnapshot(snapshot => {
              var people = [];
              snapshot.forEach(doc => {
                people = [({
                  id: doc.id,
                  name: doc.data().name,
                  avatar: doc.data().avatar}), ...people];       
                });
              this.setState({ fullData: people });
              this.setState({ data: people });
            });
        
        this.unsubscribe2 = userRef
            .collection('following').limit(15)
            .onSnapshot(snapshot => {
              var people = [];
              snapshot.forEach(doc => {
                  people = [({
                    id: doc.id,
                    name: doc.data().name,
                    avatar: doc.data().avatar}), ...people];       
              });
              this.setState({ fullData2: people });
              this.setState({ data2: people });
            });     
    }

    componentWillUnmount() {
        this.unsubscribe();
        this.unsubscribe2();
    }

    openPublicProfile(item){
      this.props.navigation.push('publicProfile', { profileId: item.id, profileOwner: item.name });
    };

    handleSearch(text){
        const formatQuery = text.toLowerCase();
        const data = _.filter(this.state.fullData, function(item) { return item.name.includes(formatQuery); });
        this.setState({ query: formatQuery, data }); 
    }

    handleSearch2(text){
      const formatQuery = text.toLowerCase();
      const data2 = _.filter(this.state.fullData2, function(item) { return item.name.includes(formatQuery); });
      this.setState({ query: formatQuery, data2 }); 
  }

    _renderItem = ({item, index}) => {
        return (
            <ListItem avatar>   
                <Left>
                  <TouchableOpacity underlayColor="#fff" onPress={() => this.openPublicProfile(item)}>
                      <Thumbnail style={styles.avatar} source={{ uri: item.avatar }} />  
                  </TouchableOpacity>               
                </Left>

                <Body>
                  <TouchableOpacity >
                    <Text style={styles.nameText}>{item.name}</Text>
                  </TouchableOpacity>
                    <Text style={styles.emailText} note>...</Text>
                </Body>

                <FollowingButton followerId={item.id} followerName={item.name} />
            </ListItem>
        )
    }

    render() {
        return (          
              <Container style={styles.container}>

                  <View style={styles.header}>
                    <Text style={styles.headerTitle}>{this.state.userName}</Text> 
                    <View style={styles.menu}>
                        <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                            <Icon name="ios-arrow-back" style={{fontSize: 25, color: 'white'}}></Icon>
                        </TouchableOpacity>
                    </View>     
                  </View>
        
                  <Header hasTabs style={{height:20}} />
                  
                  <Tabs tabContainerStyle={{ height: 42 }} tabBarUnderlineStyle = {{backgroundColor: '#8E95AB', height: 3 }}  initialPage={this.state.index} onChangeTab={({ i }) => this.setState({ index: i })}>
                      <Tab heading="Followers" textStyle={{color: '#4F566D', fontWeight: '200'}} activeTextStyle={{color: '#4F566D', fontWeight: '300'}} >
                          <List>
                              <Header searchBar rounded style={{height: 20, paddingTop:-30}}>
                                  <Item>
                                      <Icon name="ios-search" size={20} />
                                      <Input placeholder="Search" onChangeText = {text => this.handleSearch(text)} />
                                      <Icon name="ios-people" size={20} />
                                  </Item>
                                  <Button transparent>
                                      <Text>Search</Text>
                                  </Button>
                              </Header>
                              <FlatList
                              data={this.state.data}
                              renderItem={this._renderItem}
                              keyExtractor={(item,index) => index.toString()}
                              />         
                          </List>
                      </Tab>
                      <Tab heading="Following" textStyle={{color: '#4F566D', fontWeight: '200'}} activeTextStyle={{color: '#4F566D', fontWeight: '300'}} >
                          <List>
                              <Header searchBar rounded style={{height: 20, paddingTop:-30}}>
                                  <Item>
                                    <Icon name="ios-search" size={20} />
                                     <Input placeholder="Search" onChangeText = {text => this.handleSearch2(text)} />
                                    <Icon name="ios-people" size={20} />
                                  </Item>
                                  <Button transparent>
                                      <Text>Search</Text>
                                  </Button>
                              </Header>
                              <FlatList
                              data={this.state.data2}
                              renderItem={this._renderItem}
                              keyExtractor={(item,index) => index.toString()}
                              />
                          </List>
                      </Tab>
                  </Tabs>
                  
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
      marginBottom: -42,
      paddingBottom: 20,
      backgroundColor: "#8E95AB",
      //backgroundColor: "#FFF",
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
      marginRight: 8,
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
      left: 20,
      width: 20,
      height: 28,
      alignItems: "center",
      justifyContent: "center"
    },
});

export default FollowersList;