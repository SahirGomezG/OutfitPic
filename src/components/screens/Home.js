import React, { Component } from "react";
import { View, Text, StyleSheet, Image, FlatList } from "react-native";
import Icon from 'react-native-ionicons';
import moment from "moment";
import { Poll } from '../presentation';
import Fire from "../../Fire";

class Home extends Component {

    state = {
        posts: [],
        isLoading: true,
    };

    unsuscribe = null;

    componentDidMount(){
        //const user = this.props.uid || Fire.shared.uid;
        this.unsubscribe = Fire.shared.firestore
            .collection("posts").orderBy('timestamp')
            .onSnapshot(snapshot => {
                var postsFB = [];
                snapshot.forEach(doc => {
                  postsFB = [({
                    id: doc.id,
                    name: doc.data().user.name,
                    text: doc.data().text,
                    timestamp: doc.data().timestamp,
                    avatar: doc.data().user.avatar,
                    image: doc.data().image,
                  }), ...postsFB];
                });
                this.setState({ posts: postsFB });
                this.setState({isLoading: false});
            })
    };

    componentWillUnmount() {
        this.unsubscribe();
    }

    _renderPost({item}){
        return (
            <Poll
                id={item.id}
                name={item.name}
                text={item.text}
                timestamp={item.timestamp}
                avatar={item.avatar} 
                image={item.image}   
            />
        );
    }; 
    /*renderPost = (post) => {
        return (
            <View style={styles.feedItem}>
                <Image source={{uri:post.avatar}} style={styles.avatar} />
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <View>
                            <Text style={styles.name}>{post.name}</Text>
                            <Text style={styles.timestamp}>{moment(post.timestamp).fromNow()}</Text>
                        </View>

                        <Icon name="ios-more" size={24} color="#73788B" />
                    </View>
                    <Text style={styles.post}>{post.text}</Text>
                    <Image source={{uri:post.image}} style={styles.postImage} resizeMode="cover" />
                    <View style={{ flexDirection: "row" }}>
                        <Icon name="ios-heart-empty" size={24} color="#73788B" style={{ marginRight: 16 }} />
                        <Icon name="ios-chatboxes" size={24} color="#73788B" />
                    </View>
                </View>
            </View>
        );
    };*/
    render() {
        
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Feed</Text>          
                </View>
                <FlatList
                    style={styles.feed}
                    data={this.state.posts}
                    //renderItem={({ item }) => this.renderPost(item)}
                    renderItem = {this._renderPost}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                    refreshing={this.state.isLoading}
                    onRefresh={this.componentDidMount}
                ></FlatList>
            </View>
        );
    };
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#EBECF4"
    },
    header: {
        paddingTop: 64,
        paddingBottom: 16,
        backgroundColor: "#FFF",
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
        fontSize: 20,
        fontWeight: "600",
        color: "#514E5A",
    },
    feed: {
        marginHorizontal: 16
    },
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
        height: 150,
        borderRadius: 5,
        marginVertical: 16
    }
});

export default Home;