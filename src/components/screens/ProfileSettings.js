import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, ScrollView } from 'react-native';
import Fire from "../../Fire";
import Icon from 'react-native-ionicons';
import StatsElement from '../presentation/StatsElement';
import { Item, Picker, Input } from 'native-base';

import Constants from "expo-constants";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import Dialog from "react-native-dialog";
import PasswordForm from '../presentation/PasswordForm';

class ProfileSettings extends Component {

    state = {
        user: {},
        textName:'',
        text: '',
        newAvatar: '',
        editMode: false,
        editName: false,
        editPassword: false,
        gender: undefined,
        dialogVisible: false,

        currentPassword: "",
        newPassword: "",
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

    editToggledPassword = () => {
        this.setState({ editPassword: !this.state.editPassword })
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
        const { name, email } = this.state.user;
        const { currentPassword, newPassword } = this.state;
        return (
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

                <View style={{marginTop: 50, alignItems: "center"}}>
                    <Text style={[styles.headerTitle, {color:'black'}]}>OutfitPic</Text>
                </View>

                <ScrollView style={{marginBottom: 20}} indicatorStyle={"black"}>
                 
                    <View style={{marginTop: 20, alignItems: "center"}}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={this.state.newAvatar
                                ? { uri: this.state.newAvatar }
                                : require("../../../assets/default.png")} 
                                style={styles.avatar}
                            />         
                            <TouchableOpacity style={styles.add} onPress={this.handlePickAvatar}>
                                <View>
                                    <Icon name="ios-add" size={24} color="#DFD8C8" style={{ marginTop: 0.5, marginLeft: 0.5 }}></Icon>
                                </View>
                            </TouchableOpacity>          
                        </View>
                        <View>
                            <TouchableOpacity onPress={this.showDialog}>
                                <Text style={{marginTop: 30, alignItems: "center"}}>Change Profile Photo</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                

                    <View style={{marginBottom: 20, marginTop: 40, alignItems: "center"}}>
                        <Text style={{fontWeight:'500', fontFamily: "HelveticaNeue"}}>Personal Information</Text>
                    </View>

                    <View style={styles.menuContainer}>
                        <View style={{height: 40, width: 30+'%', paddingHorizontal: 20, marginTop: 10,}} >
                            <Text style={styles.userData}>Bio:</Text>
                        </View>
                        <View style={{height: 40, width: 60+'%', marginTop: 10,}}>
                            {!this.state.editMode 
                            ? <Text style={styles.userData2}>{this.state.user.bio}</Text>
                            : <TextInput 
                                style={styles.userData2} 
                                multiline={true}
                                numberOfLines={3}
                                placeholder="Tell the world a bit about yourself"
                                onChangeText={text => this.setState({ text })}
                                value={this.state.text}></TextInput>
                            }
                        </View>
                        <View style={styles.userDataEdit}>
                            {this.state.editMode 
                            ? <TouchableOpacity onPress={this.editToggled}>
                                 <Icon name="ios-close-circle" size={20} color="#FF2D42" ></Icon>
                              </TouchableOpacity> 
                            : <TouchableOpacity onPress={this.editToggled}>
                                 <Icon name="ios-remove-circle" size={20} color="#8E95AB" ></Icon>
                              </TouchableOpacity>
                            }
                        </View>
                    </View>
                          
                    <View style={styles.menuContainer}>
                        <View style={{height: 20, width: 30+'%', paddingHorizontal: 20, marginTop: 10,}} >
                            <Text style={styles.userData}>Name:</Text>
                        </View>
                        <View style={{height: 20, width: 60+'%', marginTop: 10,}}>
                            {!this.state.editName 
                            ? <Text style={styles.userData2}>{name}</Text>
                            : <TextInput 
                                style={styles.userData2} 
                                placeholder="Name"
                                onChangeText={textName => this.setState({ textName })}
                                value={this.state.textName}></TextInput>
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

                    <View style={styles.menuContainer}>
                        <View style={{height: 20, width: 30+'%', paddingHorizontal: 20, marginTop: 10 }} >
                            <Text style={styles.userData}>Password:</Text>
                        </View>
                        <View style={{height: 96, width: 60+'%', marginTop:10 }}>
                            {!this.state.editPassword 
                            ? <Text style={styles.userData2}>-------------</Text> 
                            : <PasswordForm currentPassword={currentPassword} newPassword={newPassword}/>}        
                        </View>
                        <View style={{height: 20, width: 10+'%', marginTop: 10, marginLeft:10}}>
                            {this.state.editPassword 
                            ? <TouchableOpacity onPress={this.editToggledPassword}>
                                <Icon name="ios-close-circle" size={20} color="#FF2D42" ></Icon>
                              </TouchableOpacity> 
                            : <TouchableOpacity onPress={this.editToggledPassword}>
                                <Icon name="ios-remove-circle" size={20} color="#8E95AB" ></Icon>
                              </TouchableOpacity>}
                        </View>
                    </View> 

                    <View style={{marginTop:20, alignItems:'center'}}>            
                        <TouchableOpacity style={styles.saveButton} onPress={this.handleUpdateInfo}>
                            <Text style={styles.saveText}>Save Changes</Text>
                        </TouchableOpacity>
                    </View>  

                    <View style = {styles.lineStyle} />   
            
                    <View style={styles.signOut}>
                        <TouchableOpacity onPress={this.signOut}>
                            <Text style={{fontWeight: "600", fontFamily: "HelveticaNeue", fontSize: 13}} >
                                <Icon name="ios-log-out" size={15} color="#4F566D" style={{ marginTop: 10, marginLeft: 0.5 }} ></Icon>   LogOut
                            </Text>
                        </TouchableOpacity> 
                    </View>
                </ScrollView>

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
        width: 112,
        height: 112,
        borderRadius: 56,
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
        backgroundColor: "#b53f45",
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 35,
        height: 35,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center"
    },
    saveText:{
        color: '#FFF',
        fontSize: 14,
        fontWeight: "200",
        fontFamily: "HelveticaNeue"
    },
    saveButton: {
        marginHorizontal: 30,
        marginTop:20,
        width: 70+'%',
        backgroundColor: "#252B3B",
        borderRadius: 10,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#5D3F6A",
        shadowOffset: { height: 5 },
        shadowRadius: 5,
        shadowOpacity: 0.5
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
    menu: {
        position: "absolute",
        top: 50,
        right: 20,
        width: 32,
        height: 32,
        alignItems: "center",
        justifyContent: "center"
    },
    changePasswordButton: {
        marginHorizontal: 30,
        //marginTop:20,
        //width: 70+'%',
        backgroundColor: "#252B3B",
        borderRadius: 10,
        height: 22,
        alignItems: 'center',
        justifyContent: 'center',
    }
});

export default ProfileSettings;
