import React, { Component } from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Switch} from 'react-native';
import Fire from "../../Fire";
import { Container, Header, Item, Icon, Button, List, ListItem, Left, Right, Content } from 'native-base';
import _ from 'lodash';

class NotificationsSettings extends Component {
    static navigationOptions = {
      title: 'Notifications',
      header: null
    };

    constructor(props){
        super(props);
        this.state = {
            user:{},
            option1: false,
            option2: false,
            option3: false,
            option4: false,
            comments:false,
        }
    }

    unsubscribe = null;

    componentDidMount(){
        const user = this.props.uid || Fire.shared.uid;
        let currentuserRef = Fire.shared.firestore.collection("users").doc(user);

        currentuserRef.get()
        .then(doc => {
            this.setState({ user: doc.data() });
        });
    }

    componentWillUnmount() {
        //this.unsubscribe();
    }


    render() {
        const {option1, option2, option3, option4, comments} = this.state;
        return (
            <Container style={styles.container}>

                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Notification Settings</Text> 
                    <View style={styles.menu}>
                        <TouchableOpacity onPress={this.props.navigation.openDrawer}>
                            <Icon name="ios-menu" style={{fontSize: 25, color: 'white'}}></Icon>
                        </TouchableOpacity>
                    </View>   
                </View>
                <Header style={{height:20}}/>

                <Content>
                <List>
                    <ListItem itemDivider>
                        <Text style={styles.titleText}>New Followers</Text>
                    </ListItem>  
                    <ListItem >
                        <Left>
                            <Text style={styles.optionsText}>When someone starts following me</Text>
                        </Left>
                        <Right>
                            <Switch
                                value={option1}
                                style={{ transform: [{ scaleX: .8 }, { scaleY: .8 }] }}
                                ios_backgroundColor="#EAEAED"
                                trackColor={{ false: "#EAEAED", true: "#b53f45" }}
                                onValueChange={() => this.setState({ option1: !option1 })}
                            />
                        </Right>
                    </ListItem>
                    <ListItem itemDivider>
                        <Text style={styles.titleText}>OutfitPic Posts</Text>
                    </ListItem>  
                    <ListItem>
                        <Left>
                            <Text style={styles.optionsText}>When someone comments on an ongoing post</Text>
                        </Left>
                        <Right>
                            <Switch
                                value={comments}
                                style={{ transform: [{ scaleX: .8 }, { scaleY: .8 }] }}
                                ios_backgroundColor="#EAEAED"
                                trackColor={{ false: "#EAEAED", true: "#b53f45" }}
                                onValueChange={() => this.setState({ comments: !comments })}
                            />
                        </Right>
                    </ListItem>
                    <ListItem>
                        <Left>
                            <Text style={styles.optionsText}>When someone likes a post of mine</Text>
                        </Left>
                        <Right>
                            <Switch
                                value={option2}
                                style={{ transform: [{ scaleX: .8 }, { scaleY: .8 }] }}
                                ios_backgroundColor="#EAEAED"
                                trackColor={{ false: "#EAEAED", true: "#b53f45" }}
                                onValueChange={() => this.setState({ option2: !option2 })}
                            />
                        </Right>
                    </ListItem>
                    <ListItem >
                        <Left>
                            <Text style={styles.optionsText}>When someone I follow makes a new OutfitPic post</Text>
                        </Left>
                        <Right>
                            <Switch
                                value={option3}
                                style={{ transform: [{ scaleX: .8 }, { scaleY: .8 }] }}
                                ios_backgroundColor="#EAEAED"
                                trackColor={{ false: "#EAEAED", true: "#b53f45" }}
                                onValueChange={() => this.setState({ option3: !option3 })}
                            />
                        </Right>
                    </ListItem>
                    <ListItem itemDivider>
                        <Text style={styles.titleText}>Direct Messages</Text>
                    </ListItem>
                    <ListItem >
                        <Left>
                            <Text style={styles.optionsText}>When I receive a new message</Text>
                        </Left>
                        <Right>
                            <Switch
                                value={option4}
                                style={{ transform: [{ scaleX: .8 }, { scaleY: .8 }] }}
                                ios_backgroundColor="#EAEAED"
                                trackColor={{ false: "#EAEAED", true: "#b53f45" }}
                                onValueChange={() => this.setState({ option4: !option4 })}
                            />
                        </Right>
                    </ListItem>  
                </List>
                </Content>   
            </Container>           
        );
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#E8EDF2",
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
    titleText: {
      fontSize: 16,
      color: "#514E5A",
      fontWeight: "600",
      fontFamily: "HelveticaNeue",
    },
    optionsText: {
      fontSize: 14,
      //color: "#514E5A",
      fontWeight: "400",
      fontFamily: "HelveticaNeue",
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

export default NotificationsSettings;