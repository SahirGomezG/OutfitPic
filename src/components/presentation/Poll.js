import React, {Component} from 'react';
import {View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, FlatList} from 'react-native';
import Icon from 'react-native-ionicons';
import moment from "moment";

function Item ({item,index}) {
    return (
        <View style={styles.mediaImageContainer}>
          <Image source={{ uri: item }} style={styles.image} resizeMode="cover"/>               
        </View> 
    )
};  

function openPollBoard(){
    //const chatKey = this.setOnetoOne(user);
    //this.props.navigation.navigate('poll', {chatKey: chatKey, friendName: user.name});
    this.props.navigation.navigate('poll');
};

function Poll({ id, name, text, timestamp, avatar, images, privatePoll, blockComments, duration }) {
    return(
        <View style={styles.feedItem}>
            <Image source={avatar
                    ? { uri:avatar }
                    : require("../../../assets/default.png")} 
                   style={styles.avatar} />
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View>
                        <Text style={styles.name}>{name}</Text>
                        <Text style={styles.timestamp}>{moment(timestamp).fromNow()}</Text>
                    </View>
                    <TouchableOpacity >
                        <Icon name="ios-more" size={24} color="#73788B" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.post}>{text}</Text>
                <FlatList
                    data={images}
                    renderItem={({ item }) => <Item item={item} />}
                    keyExtractor={(item,index) => index.toString()}
                    horizontal={true}
                />
                <View style={{ flexDirection: "row" }}>
                    <Icon name="ios-heart-empty" size={24} color="#73788B" style={{ marginRight: 16 }} />
                    <Icon name="ios-chatboxes" size={24} color="#73788B" />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    feedItem: {
        backgroundColor: "#FFF",
        borderRadius: 10,
        padding: 8,
        flexDirection: "row",
        marginVertical: 8
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
        marginTop: 10,
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
        width: 180,
        height: 200,
        borderRadius: 10,
        overflow: "hidden",
        marginHorizontal: 10,
      },  
});

export default Poll;