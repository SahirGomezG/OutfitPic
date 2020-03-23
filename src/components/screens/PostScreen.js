import React, { Component } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, Image, TouchableWithoutFeedback, Keyboard, FlatList, ScrollView, Dimensions} from "react-native";
import Icon from 'react-native-ionicons';
import * as ImagePicker from "expo-image-picker";
import Fire from "../../Fire";
import { ActionSheet, Root} from 'native-base';

import Constants from "expo-constants";
import * as Permissions from "expo-permissions";

const firebase = require("firebase");
require("firebase/firestore");

const width = Dimensions.get('window').width;

class PostScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            text: "",
            image: 'https://lh3.googleusercontent.com/b5CDwBK0hiO_8_Hb2PkfzQmhSFtOfO5BT2F3CsugFGkIZCHVQcBHAiX-JlF0Wzwbi6E-CrzylxK2TXSYrFpM7pHfkQ',
            user: {},
            fileList:[],
        };
    }  

    unsuscribe = null;

    onSelectedImage = (url) => {
        let newDataImg = this.state.fileList;
        let item = {
            id: Date.now(),
            url: url,
        };
        newDataImg.push(item);   
        this.setState({fileList: newDataImg});
    };


    componentDidMount() {
        const user = this.props.uid || Fire.shared.uid;
        this.getPhotoPermission();
        this.unsubscribe = Fire.shared.firestore
            .collection("users")
            .doc(user)
            .onSnapshot(doc => {
                this.setState({ user: doc.data() });
            });   
    }
    
    componentWillUnmount() {
        this.unsubscribe();
    }

    pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3]
        });

        if (!result.cancelled) {
            this.setState({ image: result.uri });
            this.onSelectedImage(result.uri);
        }
    };

    cameraImage = async () =>{
        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3]
        });

          if (!result.cancelled) {
            this.setState({ image: result.uri });
            this.onSelectedImage(result.uri);
        }
    }

    onClickAddImage = () => {
        const BUTTONS = ['Take Photo','Choose Photo Library', 'Cancel'];
        ActionSheet.show(
            {
                options: BUTTONS, 
                cancelButtonIndex: 2,
                title:'Select a photo'},
            buttonIndex => {
                switch (buttonIndex) {
                    case 0:
                        this.cameraImage();
                        break;
                    case 1:
                        this.pickImage();
                        break;
                    default:
                        break;        
                }
            }
        )
    };

    getPhotoPermission = async () => {
        if (Constants.platform.ios) {
            const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

            if (status != "granted") {
                alert("We need permission to use your camera roll if you'd like to incude a photo.");
            }
        }
    };

    handlePost = () => {
        Fire.shared
            .addPost({ text: this.state.text.trim(), localUri: this.state.image, user: this.state.user })
            .then(ref => {
                this.setState({ text: "", image: null });
                this.props.navigation.goBack();
            })
            .catch(error => {
                alert(error);
            });
    };

    renderItem = ({item,index}) => {
        return (
            <View style={styles.itemViewImage}>
                <Image source={{ uri: item.url}} style={styles.itemImage} />
            </View>
        )
    };

    render() {
        const { image } = this.state;
        let {fileList} = this.state;
        return (
            <Root>
            <SafeAreaView style={styles.container}>

                <View style={styles.header}>
                    <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                        <Icon name="md-arrow-back" size={24} color="#D8D9DB"></Icon>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.handlePost}>
                        <Text style={{ fontWeight: "500" }}>Post</Text>
                    </TouchableOpacity>
                </View>

                <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <View style={styles.inputContainer}>
                    <Image source={this.state.user.avatar
                                ? { uri: this.state.user.avatar }
                                : require("../../../assets/default.png")} 
                           style={styles.avatar}>
                    </Image>
                    <TextInput
                        autoFocus={true}
                        multiline={true}
                        numberOfLines={4}
                        style={{ flex: 1 }}
                        placeholder="Want to share something?"
                        onChangeText={text => this.setState({ text })}
                        value={this.state.text}                        
                    ></TextInput>
                </View>
                </TouchableWithoutFeedback>


                <View style={styles.imageOptions}>
                    <TouchableOpacity style={styles.library} onPress={this.onClickAddImage}>
                        <Icon name="ios-camera" size={32} color="#D8D9DB"></Icon>
                    </TouchableOpacity>
        
                    <TouchableOpacity style={styles.library} onPress={this.pickImage}>
                        <Icon name="ios-images" size={32} color="#D8D9DB"></Icon>
                    </TouchableOpacity>
                </View>

                <View style={{ marginHorizontal: 30, marginTop: 30, marginBottom: 30, height: 400 }}>
                {image && (
                    <Image 
                    source={{ uri: this.state.image }} 
                    style={{ width: "100%", height: "100%" }}>
                    </Image>)}
                </View>


            </SafeAreaView>          
            </Root>
        );
    }
}

const styles = StyleSheet.create({
    content:{
        flex:1,
        marginTop: 50,
        paddingLeft: 30,
        paddingRight: 30,
        justifyContent:"center",
        alignItems: "center",
        backgroundColor: 'rgb(255,255,255)'
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#D8D9DB"
    },
    inputContainer: {
        margin: 32,
        flexDirection: "row"
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 16
    },
    photo: {
        marginHorizontal: 32,
        
    },
    library: {
        alignItems: "flex-end",
        marginHorizontal: 40,
        justifyContent: "center",
        //alignItems: "center",
    },
    imageOptions:{
        justifyContent: "space-between",
        flexDirection: "row",
    },
    itemImage:{
        backgroundColor: '#2F455C',
        height: 200,
        width: width - 60,
        borderRadius: 8,
        resizeMode: 'contain',
    },
    itemViewImage:{
        alignItems: 'center',
        borderRadius: 8,
        marginTop: 10
    },  
    feed: {
        flex: 1,
        marginHorizontal: 10
    },
    btnPressStyle: {
        backgroundColor: '#0080ff',
        height: 50,
        width: width - 60,
        alignItems: "center",
        justifyContent:"center",
    },
});

export default PostScreen;