import React, {Component} from 'react';
import {View, Text, StyleSheet, Image, Dimensions, TouchableOpacity} from 'react-native';
import config  from "../../config";

class Post extends Component {
    constructor(){
      super();
      this.state= {
        liked: false,
        screenWidth: Dimensions.get("window").width
      };
    }

    likedToggled(){
      this.setState({
        liked: !this.state.liked
      })
    }

    render(){
      const imageHeight = Math.floor(this.state.screenWidth * 1.1);
      const imageSelection = this.props.item %2 === 0 
        ? 'https://lh3.googleusercontent.com/UO5z374_I4tT3RKctRlMTqW61Qvd6hif0iBsYR60ZG02U9r9_Byjkdz0PSFMd5DANnpwuZCPfIpzQ7ScBPXh8e0mIg' 
        : 'https://lh3.googleusercontent.com/b5CDwBK0hiO_8_Hb2PkfzQmhSFtOfO5BT2F3CsugFGkIZCHVQcBHAiX-JlF0Wzwbi6E-CrzylxK2TXSYrFpM7pHfkQ'
      const imageUri = imageSelection + "=s" + imageHeight + "-c";
      const heartIconColor = (this.state.liked) ? 'rgb(252,61,57)' : null;
    
      return (
            <View style={{ flex:1, width: 100+'%' }}>
                <View style={styles.userBar}>
                  <View style={{ flexDirection:"row", alignItems:"center"}} >
                    <Image 
                      style={styles.userPic}
                      source={{
                        uri:
                        "https://lh3.googleusercontent.com/0I7Vc1o_8-xsysIug3DZzwe6vgap5oQogiD0olTIfvUf4dv3k23kpwz0VG1pUYSSC1biAyd_Onv7h41PztdPQEwjHXk"
                        }}
                    />
                    <Text style={{ marginLeft:10 }}>SahirG</Text>   
                  </View>
                  <View style={{ alignItems: "center"}}>
                      <Text style={{ fontSize:30 }}>...</Text>
                  </View>
                </View>
                <TouchableOpacity activeOpacity={1} onPress={() => {
                  this.likedToggled();
                }}>       
                    <Image 
                      style={{ width:this.state.screenWidth, height:450 }}
                      source={{
                        uri: imageUri
                      }}
                    />
                </TouchableOpacity> 
                <View style={styles.iconBar}>
                  <Image style={[styles.icon,{tintColor: heartIconColor}]} source={config.images.heartIcon} />
                  <Image style={styles.icon} source={config.images.chatIcon} />
                  <Image style={styles.icon} source={config.images.arrowIcon} />
                </View>
                <View style={styles.iconBar}>
                    <Image style={{height:20, width:20, marginLeft:10 }} source={config.images.heartIcon} />
                    <Text> 128 Likes</Text>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    userBar:{
        width:100+'%', 
        height: config.styleConstants.rowHeight, 
        backgroundColor:"rgb(255,255,255)",
        flexDirection:"row",
        paddingHorizontal: 10,
        justifyContent: "space-between",
        marginBottom:5,
        marginTop:5,
    },
    userPic:{
        height:40,
        width:40,
        borderRadius: 20,
    },
    iconBar:{
      height: config.styleConstants.rowHeight,
      width:100+'%',
      borderColor: 'rgb(233,233,233)',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderBottomWidth: StyleSheet.hairlineWidth,
      flexDirection: 'row',
      alignItems: 'center',
    },
    icon: {
      height: 25,
      width: 25,
      marginHorizontal: 10,
    },
});

export default Post;