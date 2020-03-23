import React, { Component } from 'react';
import {
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  StatusBar,
  ListView,
  FlatList,
  View,
  StyleSheet
} from 'react-native';
import { Container } from 'native-base';
import Fire from "../../Fire";


class Rooms extends Component {
  static navigationOptions = {
    title: 'Rooms',
    header: null
};

  state = {
    rooms: [],
    newRoom: '',
}

  componentDidMount() {
    this.listenForRooms(Fire.shared.roomsRef);
  }

  listenForRooms(roomsRef) {
    roomsRef.on('value', (DataSnapshot) => {
      var roomsFB = [];
      DataSnapshot.forEach((child) => {
        roomsFB.push({
          name: child.val().name,
          key: child.key
        });
      });
      this.setState({ rooms: roomsFB });
    });
  };

  addRoom() {
    if (this.state.newRoom === '') {
      return;
    }
    Fire.shared.addRoomtoFb({ name: this.state.newRoom });
    this.setState({ newRoom: '' });
  }

  openMessages(room) {
    this.props.navigation.navigate('chat', {roomKey: room.key, roomName: room.name});
  }

  componentWillUnmount() {
    Fire.shared.off1();
    //this.unsubscribe();
  }

  renderRow = (item) => {
    return (
      <TouchableOpacity style={styles.roomLi}
      underlayColor="#fff"
      onPress={() => this.openMessages(item)}
      >
        <Text style={styles.roomLiText}>{item.name}</Text>
      </TouchableOpacity>
    )
  };

  render() {
    return (
    <Container style={styles.container}>
        <View style={styles.circle} />
            <Text style={styles.header}>Groups</Text>
              <View style={styles.roomsInputContainer}>
                  <TextInput
                      style={styles.roomsInput}
                      placeholder={"New Group"}
                      onChangeText={(text) => this.setState({newRoom: text})}
                      value={this.state.newRoom}
                  />
                  <TouchableHighlight style={styles.roomsNewButton}
                      underlayColor="#fff"
                      onPress={() => this.addRoom()}
                  >
                    <Text style={styles.roomsNewButtonText}>Create</Text>
                  </TouchableHighlight>
              </View>   
          <View style={styles.roomsListContainer}>
            <FlatList
              data={this.state.rooms}
              renderItem={({item}) => this.renderRow(item)}
              keyExtractor={item => item.key}
            />
          </View>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "#F4F5F7",
        alignItems: 'center'
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
    roomsHeader: {
      color: 'black',
      fontSize: 20,
      top: 40,
      bottom: 40
    },
    header: {
      fontWeight: "600",
      fontSize: 20,
      color: "#514E5A",
      marginTop: 60
    },
    roomsInputContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      backgroundColor: '#fff',
      borderBottomColor: '#f9f9f9',
      borderBottomWidth: 2,
      top: 15
    },
    roomsInput: {
      flex: 1,
      height: 40,
      textAlign: 'center',
      fontSize: 18,
      color: 'black',
      borderColor: '#f9f9f9',
      borderWidth: 2,
      borderRadius: 4,
      margin: 10
    },
    roomsNewButton: {
      alignItems: 'center',
      marginRight: 20
    },
    roomsNewButtonText: {
      color: '#1E90FF',
      fontSize: 18
    },
    roomsListContainer: {
      flex: 1,
      alignItems: 'flex-start',
      justifyContent: 'center',
      flexDirection: 'row',
      marginTop: 40,
      //backgroundColor: '#fff',
      backgroundColor: 'transparent'
    },
    roomLi: {
      flex: 1,
      //backgroundColor: '#fff',
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
  });

export default Rooms;