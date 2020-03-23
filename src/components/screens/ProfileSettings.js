import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView } from 'react-native';
import Fire from "../../Fire";
import Icon from 'react-native-ionicons';
import StatsElement from '../presentation/StatsElement';
import { Item, Picker, Input } from 'native-base';

import Constants from "expo-constants";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import Dialog from "react-native-dialog";

class ProfileSettings extends Component {

    state = {
        user: {},
        textName:'',
        text: '',
        newAvatar: '',
        editMode: false,
        editName: false,
        gender: undefined,
        dialogVisible: false
    };

    unsubscribe = null;

    componentDidMount(){
        const user = this.props.uid || Fire.shared.uid;
        this.unsubscribe = Fire.shared.firestore
            .collection("users")
            .doc(user)
            .onSnapshot(doc => {
                this.setState({ user: doc.data()});
                this.setState({ gender: doc.data().gender})
                this.setState({ textName: doc.data().name})
                this.setState({ text: doc.data().bio})
                this.setState({ newAvatar: doc.data().avatar})
            });     
    }

   componentWillUnmount() {
        this.unsubscribe();
    }

    signOut = () => {
        Fire.shared.signOut();
    }

// Extra functions to update photo profile
    getPhotoPermission = async () => {
        if (Constants.platform.ios) {
            const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

            if (status != "granted") {
                alert("We need permission to use your camera roll if you'd like to include a photo.");
            }
        }
    };

    handlePickAvatar = async () => {
        this.getPhotoPermission();
    
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3]
        });
    
        if (!result.cancelled) {
            this.setState({ newAvatar: result.uri });
        }
      };
    
    handleUpdateInfo = () => {
        Fire.shared.updateProfileInfo(this.state.text, this.state.gender, this.state.textName);
        this.setState({ editMode: false, editName: false})
    }

    handleUpdateAvatar = () => {
        Fire.shared.updateAvatar(this.state.newAvatar);
        this.setState({ dialogVisible: false });
    }

    editToggled = () => {
        this.setState({ editMode: !this.state.editMode })
    }

    editToggledName = () => {
        this.setState({ editName: !this.state.editName })
    }

    onValueChange2(value) {
        this.setState({
          gender: value
        });
    }

    showDialog = () => {
      this.setState({ dialogVisible: true });
    };
   
    handleCancel = () => {
      this.setState({ dialogVisible: false });
    };

    render() {
        const {name, email, numFollowers, numFollowing, numPosts} = this.state.user;
        return (
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
              <KeyboardAvoidingView style = {{ flex:1, justifyContent:'center', alignItems: 'center', backgroundColor: "#EBECF4"}} behavior="padding" enabled>
                <View style={styles.container}>
                  
                  <View style={styles.header}>
                      <Text style={styles.headerTitle}>Profile Settings</Text> 
                      <View style={styles.menu}>
                          <TouchableOpacity onPress={this.props.navigation.openDrawer}>
                              <Icon name="ios-menu" size={24} color="#FFF"></Icon>
                          </TouchableOpacity>
                      </View>     
                  </View>

                <View style={{marginTop: 80, alignItems: "center"}}>
                   <Text style={{color:'black'}}>OutfitPic</Text>
                </View>
            
                 
                <View style={{marginTop: 40, alignItems: "center"}}>
                    <View style={styles.avatarContainer}>
                          <Image
                              source={this.state.newAvatar
                                  ? { uri: this.state.newAvatar }
                                  : require("../../../assets/default.png")
                              }
                              style={styles.avatar}
                          />
                          <View style={styles.add}>
                            <TouchableOpacity onPress={this.handlePickAvatar}>
                                <Icon name="ios-add" size={24} color="#DFD8C8" style={{ marginTop: 0.5, marginLeft: 0.5 }}></Icon>
                            </TouchableOpacity>
                          </View>
                    </View>
                    <View>
                      <TouchableOpacity onPress={this.showDialog}>
                         <Text style={{marginTop: 30, alignItems: "center"}}>Change Profile Photo</Text>
                      </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.statsContainer}>
                    <StatsElement numPosts={numPosts} numFollowers={numFollowers} numFollowing ={numFollowing} ></StatsElement>  
                </View>

                <View style={{marginBottom: 20}}>

                    <View style={{marginBottom: 20, alignItems: "center"}}>
                        <Text>Personal Information</Text>
                    </View>
                          
                    <View style={styles.menuContainer}>
                        <View style={{height: 20, width: 30+'%', paddingHorizontal: 20, marginTop: 10,}} >
                            <Text style={styles.userData}>Name:</Text>
                        </View>
                        <View style={{height: 20, width: 60+'%', marginTop: 10,}}>
                            {!this.state.editName ? (<Text style={styles.userData2}>{name}</Text>)
                                : (<TextInput 
                                    style={styles.userData2} 
                                    placeholder="Name"
                                    onChangeText={textName => this.setState({ textName })}
                                    value={this.state.textName}></TextInput>)
                                }
                     
                        </View>
                        <View style={{height: 20, width: 10+'%', marginTop: 10, marginLeft:10}}>
                            {this.state.editName ?
                            <TouchableOpacity onPress={this.editToggledName}>
                                <Icon name="ios-close-circle" size={20} color="#FF2D42" ></Icon>
                            </TouchableOpacity> : 
                            <TouchableOpacity onPress={this.editToggledName}>
                                <Icon name="ios-remove-circle" size={20} color="#8E95AB" ></Icon>
                            </TouchableOpacity>}
                        </View>
                    </View>

                    <View style={styles.menuContainer}>
                        <View style={styles.userDataTitle} >
                            <Text style={styles.userData}>Email:</Text>
                        </View>
                        <View style={styles.userDataTitle2}>
                            <Text style={styles.userData2}>{email}</Text>
                        </View>
                    </View>
              
                    <View style={styles.menuContainer}>
                        <View style={{height: 40, width: 30+'%', paddingHorizontal: 20, marginTop: 10,}} >
                            <Text style={styles.userData}>Bio:</Text>
                        </View>
                        <View style={{height: 40, width: 60+'%', marginTop: 10,}}>
                            {!this.state.editMode ? (<Text style={styles.userData2}>{this.state.user.bio}</Text>)
                                : (<TextInput 
                                    style={styles.userData2} 
                                    multiline={true}
                                    numberOfLines={3}
                                    placeholder="Tell the world a bit about yourself"
                                    onChangeText={text => this.setState({ text })}
                                    value={this.state.text}></TextInput>)
                                }
                        </View>
                        <View style={styles.userDataEdit}>
                            {this.state.editMode ?
                            <TouchableOpacity onPress={this.editToggled}>
                                <Icon name="ios-close-circle" size={20} color="#FF2D42" ></Icon>
                            </TouchableOpacity> : 
                            <TouchableOpacity onPress={this.editToggled}>
                                <Icon name="ios-remove-circle" size={20} color="#8E95AB" ></Icon>
                            </TouchableOpacity>}
                        </View>
                    </View>

                    <View style={styles.menuContainer}>
                        <View style={styles.userDataTitle} >
                            <Text style={styles.userData}>Gender:</Text>
                        </View>

                        <View style={{ marginTop:-5, marginLeft:-16 }}>                               
                            <Item picker>
                                <Picker
                                    mode="dropdown"
                                    iosIcon={<Icon name="arrow-down" color="#8E95AB" />}
                                    style={{ width: 262 }}
                                    placeholder="Select your gender"
                                    placeholderStyle={styles.userData2}
                                    textStyle={{ fontSize: 13, color: "#4F566D" }}
                                    itemTextStyle={{ fontSize: 14 }}
                                    selectedValue={this.state.gender}
                                    onValueChange={this.onValueChange2.bind(this)}
                                >
                                    <Picker.Item label="Male" value="male" />
                                    <Picker.Item label="Female" value="female" />
                                    <Picker.Item label="Other" value="other" />
                                    <Picker.Item label="Prefer Not to Say" value="prefer not to say" />
                                </Picker>
                            </Item>       
                        </View>    
                    </View>
            

                <View style={styles.rowSection}>
                  <TouchableOpacity onPress={this.handleUpdateInfo}>
                      <Text style={styles.save}>Save Changes</Text>
                  </TouchableOpacity>
                  <Icon name="ios-cloud-upload" size={15} color="#4F566D" style={{  marginLeft: 2 }} ></Icon>
                </View>  

                </View>

                <View style = {styles.lineStyle} />   
            
                <View style={styles.signOut}>
                    <TouchableOpacity onPress={this.signOut}>
                        <Text style={{fontWeight: "600", fontFamily: "HelveticaNeue", fontSize: 13}} >
                            <Icon name="ios-log-out" size={15} color="#4F566D" style={{ marginTop: 10, marginLeft: 0.5 }} ></Icon>   LogOut
                        </Text>
                    </TouchableOpacity> 
                </View>  

                <View>
                  <Dialog.Container visible={this.state.dialogVisible}>
                    <Dialog.Title>Please Confirm</Dialog.Title>
                      <Dialog.Description>
                        Do you want to save a new profile picture? 
                      </Dialog.Description>
                    <Dialog.Button label="Cancel" onPress={this.handleCancel} />
                    <Dialog.Button label="Save" onPress={this.handleUpdateAvatar} />
                  </Dialog.Container>
                </View>

              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>  
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent:'center',
        backgroundColor: "#F4F5F7",
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
        width: 100,
        height: 100,
        borderRadius: 50
    },
    name: {
        marginTop: 24,
        fontSize: 16,
        fontWeight: "600"
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        margin: 20
    },
    menuContainer: {
        margin: 3,
        flexDirection: 'row',
    },
    add: {
        backgroundColor: "#41444B",
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 35,
        height: 35,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center"
    },
    save:{
        height: 20,
        width: 100,
        paddingHorizontal: 10,
        marginHorizontal: 10,
        marginTop: 20,
        marginBottom:20,
        alignItems:'center',
        justifyContent: 'center',
        fontSize: 13,
        fontWeight: "600",
        fontFamily: "HelveticaNeue"
    }, 
    signOut:{
        margin:24,
        alignItems:'center',
        justifyContent: 'center',
    },
    userDataTitle:{
        height: 20,
        width: 30+'%',
        paddingHorizontal: 20,
        marginHorizontal: 0,
        marginTop: 10,
    },
    userDataTitle2:{
        height: 20,
        width: 70+'%',
        marginTop: 10,
    }, 
    userDataEdit:{
        height: 40,
        marginTop: 10,
        width: 10+'%',
        paddingHorizontal: 10,
    }, 
    userData:{
        fontSize: 13,
        fontWeight: "600",
        fontFamily: "HelveticaNeue"
    },
    userData2:{
        //flex:1,
        fontSize: 13,
        fontFamily: "HelveticaNeue",
        color: "#4F566D"
    },
    userDataBioText:{
        fontSize: 13,
        fontFamily: "HelveticaNeue",
        color: "#4F566D",
    },
    lineStyle:{
      borderWidth: 0.5,
      borderColor:'#C3C5CD',
      margin:10,
    },
    rowSection: {
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center"
    },
    menu: {
        position: "absolute",
        top: 50,
        right: 20,
        width: 32,
        height: 32,
        alignItems: "center",
        justifyContent: "center"
    },
});

export default ProfileSettings;

/*<View style={styles.userDataBio}>
                            {this.state.user.bio
                                ? <Text style={styles.userDataBioText}>{this.state.user.bio}</Text>
                                : <TextInput 
                                    style={styles.userData2} 
                                    multiline={true}
                                    numberOfLines={3}
                                    placeholder="Tell the world a bit about yourself"
                                    onChangeText={text => this.setState({ text })}
                                    value={this.state.text}></TextInput>
                                }
                        </View>*/