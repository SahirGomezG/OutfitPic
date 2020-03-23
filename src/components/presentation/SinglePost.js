import React, {Component} from 'react';
import {View, Text, StyleSheet, Image, Dimensions, TouchableOpacity} from 'react-native';
import Icon from 'react-native-ionicons';
import moment from "moment";

/*class SinglePost extends Component {
   constructor(){
        super();
        this.state = {
            id: "",
            name:"",
            text: "",
            timestamp: 0,
            avatar: "",
            image: "",
        }
   };
    render(){
        const name = this.props.name; 
        const text = this.props.text;
        const timestamp = this.props.timestamp;

        return (
            <View style={styles.feedItem}>
                <Image source={{uri:this.state.avatar}} style={styles.avatar} />
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <View>
                            <Text style={styles.name}>{name}</Text>
                            <Text style={styles.timestamp}>{moment(this.state.timestamp).fromNow()}</Text>
                        </View>
    
                        <Icon name="ios-more" size={24} color="#73788B" />
                    </View>
                    <Text style={styles.post}>{text}</Text>
                    <Image source={{uri:this.state.image}} style={styles.postImage} resizeMode="cover" />
                    <View style={{ flexDirection: "row" }}>
                        <Icon name="ios-heart-empty" size={24} color="#73788B" style={{ marginRight: 16 }} />
                        <Icon name="ios-chatboxes" size={24} color="#73788B" />
                    </View>
                </View>
            </View>
        );

    }
}*/

function SinglePost({ id, name, text, timestamp, avatar, image }) {
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

                    <Icon name="ios-more" size={24} color="#73788B" />
                </View>
                <Text style={styles.post}>{text}</Text>
                <Image source={{uri:image}} style={styles.postImage} resizeMode="cover" />
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
        borderRadius: 5,
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
        fontSize: 15,
        fontWeight: "500",
        color: "#454D65"
    },
    timestamp: {
        fontSize: 11,
        color: "#C4C6CE",
        marginTop: 4
    },
    post: {
        marginTop: 16,
        fontSize: 14,
        color: "#838899"
    },
    postImage: {
        width: undefined,
        height: 280,
        borderRadius: 5,
        marginVertical: 16
    }
});

export default SinglePost;