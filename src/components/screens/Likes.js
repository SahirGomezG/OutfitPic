'use strict'
import React, { Component } from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity} from 'react-native';
import Fire from "../../Fire";
import { Container, Header, Item, Input, Icon, Button, List, ListItem, Left, Body, Right, Thumbnail } from 'native-base';
import _ from 'lodash';
import { diffClamp } from 'react-native-reanimated';
import FollowingButton from "../presentation/FollowingButton";

class Likes extends Component {
    static navigationOptions = {
      title: 'Likes',
      header: null
    };

    constructor(props){
        super(props);
        this.state = {
            pollId: this.props.navigation.state.params.pollId,
            loading: false,
            data:[],
            fullData: [],
            query: "",
        }
    }

    unsubscribe = null;

    componentDidMount(){
        const pollId = this.state.pollId;
        let outfitPollRef = Fire.shared.firestore.collection("outfitPolls").doc(pollId);

        this.unsubscribe = outfitPollRef
            .collection('likes')
            .onSnapshot(snapshot => {
              var likedBy = [];
              snapshot.forEach(doc => {
                  likedBy = [({
                    id: doc.data().user._id,
                    name: doc.data().user.name,
                    avatar: doc.data().user.avatar,
                  }), ...likedBy];       
              });
              this.setState({ fullData: likedBy });
              this.setState({ data: likedBy });
            });     
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    openPublicProfile(user){
      this.props.navigation.navigate('publicProfile', { profileId: user.id, profileOwner: user.name });
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
                    <TouchableOpacity underlayColor="#fff" onPress={() => this.openPublicProfile(item)}>
                      <Thumbnail style={styles.avatar} source={{ uri: item.avatar }} />  
                    </TouchableOpacity>              
                </Left>

                <Body style={{height: 60}}>
                  <TouchableOpacity >
                    <Text style={styles.nameText}>{item.name}</Text>
                  </TouchableOpacity>
                    <Text style={styles.emailText} note>  ...</Text>
                </Body>
                
                <FollowingButton followerId={item.id} followerName={item.name} />          
            </ListItem>
        )
    }

    render() {
        return (  
              <Container style={styles.container}>
                <View style={styles.circle} />

                  <View style={styles.header}>
                    <Text style={styles.headerTitle}>Liked by</Text> 
                      <View style={styles.menu}>
                          <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                              <Icon name="ios-arrow-back" style={{fontSize: 25, color: 'white'}}></Icon>
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
      marginBottom: -42,
      paddingBottom: 20,
      backgroundColor: "#8E95AB",
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

export default Likes;