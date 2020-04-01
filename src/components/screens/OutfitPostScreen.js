import React, {Component} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Image,
  ImageBackground,
  TouchableWithoutFeedback,
  Keyboard,
  Switch,
  FlatList,
  TouchableHighlight,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-ionicons';
import * as ImagePicker from 'expo-image-picker';
import Fire from '../../Fire';
import {ActionSheet, Root} from 'native-base';
import 'react-native-gesture-handler';

import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';

const firebase = require('firebase');
require('firebase/firestore');

class OutfitPostScreen extends Component {
		constructor(props) {
				super(props);
				this.state = {
						text: '',
						image:
							'https://lh3.googleusercontent.com/-O21uHkUnuq25SIdMP63NotDP_kh65s09N5Ud7Nvh2pfJ38-7_Yzc5tWNkQGehySuDg8EKuz4fso8vBRF_MeBw5V',
						user: {},
						fileList: [],
						count: 0,
						duration: 24,
						privatePoll: false,
						comments: false,
						modalVisible: false,
						followers: [],
			};
		}

  unsuscribe = null;

  onSelectedImage = url => {
    let newDataImg = this.state.fileList;
    var arrLength = newDataImg.length;
    let item = {
      id: Date.now(),
      url: url,
    };

    if (arrLength <= 2) {
      newDataImg.push(item);
      this.setState({fileList: newDataImg});
      this.setState({count: this.state.fileList.length});
    } else {
      alert('Ops, you can only share 3 outfits');
    }
  };

  componentDidMount() {
    const user = this.props.uid || Fire.shared.uid;
    let currentuserRef = Fire.shared.firestore.collection('users').doc(user);
    this.getPhotoPermission();
    this.unsubscribe = currentuserRef.onSnapshot(doc => {
      this.setState({user: doc.data()});
    });
    const followingRef = currentuserRef
      .collection('followers')
      .limit(30)
      .get()
      .then(snapshot => {
        var followersFB = [user];
        snapshot.forEach(doc => {
          followersFB = [doc.id, ...followersFB];
        });
        this.setState({followers: followersFB});
      });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.cancelled) {
      this.setState({image: result.uri});
      this.onSelectedImage(result.uri);
    }
  };

  cameraImage = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.cancelled) {
      this.setState({image: result.uri});
      this.onSelectedImage(result.uri);
    }
  };

  onClickAddImage = () => {
    const BUTTONS = ['Take Photo', 'Choose Photo Library', 'Cancel'];
    ActionSheet.show(
      {
        options: BUTTONS,
        cancelButtonIndex: 2,
        title: 'Select a photo',
      },
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
      },
    );
  };

  getPhotoPermission = async () => {
    if (Constants.platform.ios) {
      const {status} = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      const {status2} = await Permissions.askAsync(Permissions.CAMERA);

      if (status != 'granted') {
        alert(
          "We need permission to use your camera roll if you'd like to include a photo.",
        );
      }
    }
	};
	
	get userInfo() {
		return {
				name: this.state.user.name,
				avatar: this.state.user.avatar,
				joined: this.state.user.joined,
				email: this.state.user.email
		};
	}	

  handleOutfitPost = () => {
    if (this.state.fileList.length != 0) {
      Fire.shared
        .addOutfitPic({
          text: this.state.text.trim(),
          images: this.state.fileList,
          user: this.userInfo,
          duration: this.state.duration,
          privatePoll: this.state.privatePoll,
          blockComments: this.state.comments,
          followers: this.state.followers,
        })
        .then(ref => {
          this.setState({text: '', fileList: [], count: 0, privatePoll: false});
          this.props.navigation.goBack();
        })
        .catch(error => {
          alert(error);
        });
    } else {
      alert('Pleaase add your outfits');
    }
  };

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  deleteItem = data => {
    let allItems = [...this.state.fileList];
    let filteredItems = allItems.filter(item => item.id != data.id);
    this.setState({fileList: filteredItems});
    this.setState({count: filteredItems.length});
  };

  emptyComponent = () => {
    return (
      <View
        style={{
          marginHorizontal: 80,
          marginTop: 10,
          height: 250,
          width: 225,
          borderRadius: 18,
          alignContent: 'center',
        }}>
        <Image
          source={{
            uri:
              'https://lh3.googleusercontent.com/cxgS5VhHlPSCb0Iheq4mYpDHg7laJ_ODQn9x76Pho2nUlZXMLuz7QDNmtyMcQ1BKWTE5AV7N1YeVtMxsrpYX7xsj',
          }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
    );
  };

  renderItem = ({item, index, separators}) => {
    return (
      <View style={styles.mediaImageContainer}>
        <ImageBackground
          source={{uri: item.url}}
          style={styles.image}
          resizeMode="cover">
          <TouchableHighlight onPress={() => this.deleteItem(item)}>
            <Icon
              name="md-trash"
              size={25}
              color="white"
              style={{position: 'absolute', top: 10, right: 10}}></Icon>
          </TouchableHighlight>
        </ImageBackground>
      </View>
    );
  };

  render() {
    const {duration, privatePoll, comments} = this.state;
    let {fileList} = this.state;
    return (
      <Root>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.back}
              onPress={() => this.props.navigation.goBack()}>
              <Icon name="arrow-round-back" size={25}></Icon>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.handleOutfitPost}>
              <Text
                style={{
                  fontWeight: '400',
                  fontFamily: 'HelveticaNeue',
                  color: '#FFF',
                  fontSize: 16,
                }}>
                Share
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.inputContainer}>
              <Image
                source={
                  this.state.user.avatar
                    ? {uri: this.state.user.avatar}
                    : require('../../../assets/default.png')
                }
                style={styles.avatar}></Image>
              <TextInput
                autoFocus={true}
                multiline={true}
                numberOfLines={2}
                style={{flex: 1, fontSize: 13, fontFamily: 'HelveticaNeue'}}
                placeholder="Describe the event you want to rock and roll (cocktail, dinner, date...)"
                onChangeText={text => this.setState({text})}
                value={this.state.text}></TextInput>
            </View>
          </TouchableWithoutFeedback>

          <View style={styles.section}>
            <TouchableOpacity
              style={styles.addImage}
              onPress={this.onClickAddImage}>
              <Icon name="ios-add-circle" size={50} color="#53115B"></Icon>
            </TouchableOpacity>
          </View>

          <View style={styles.photosContainer}>
            <FlatList
              data={fileList}
              renderItem={this.renderItem}
              keyExtractor={(item, index) => index.toString()}
              extraData={this.state}
              horizontal={true}
              ListEmptyComponent={this.emptyComponent}
            />
          </View>

          <View style={styles.section}>
            <View>
              <Text style={styles.title}>More Options</Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                this.setModalVisible(true);
              }}>
              <View style={styles.option}>
                <Text
                  style={{
                    fontWeight: '400',
                    color: '#4F566D',
                    fontFamily: 'HelveticaNeue',
                  }}>
                  Private Poll{' '}
                </Text>
                <View style={{marginRight: 20}}>
                  <Icon
                    name="ios-lock"
                    size={24}
                    color={privatePoll === false ? '#EAEAED' : '#FF7657'}
                  />
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.option}>
              <Text
                style={{
                  fontWeight: '400',
                  color: '#4F566D',
                  fontFamily: 'HelveticaNeue',
                }}>
                Block Comments{' '}
              </Text>
              <Switch
                value={comments}
                style={{transform: [{scaleX: 0.8}, {scaleY: 0.8}]}}
                ios_backgroundColor="#EAEAED"
                trackColor={{false: '#EAEAED', true: '#FF7657'}}
                onValueChange={() => this.setState({comments: !comments})}
              />
            </View>

            <View style={styles.section}>
              <View>
                <Text style={styles.title}>Poll Duration</Text>
              </View>
              <View style={styles.group}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.first,
                    duration === 24 ? styles.active : null,
                  ]}
                  onPress={() => this.setState({duration: 24})}>
                  <Text
                    style={[
                      styles.buttonText,
                      duration === 24 ? styles.activeText : styles.inactiveText,
                    ]}>
                    24 hr
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, duration === 6 ? styles.active : null]}
                  onPress={() => this.setState({duration: 6})}>
                  <Text
                    style={[
                      styles.buttonText,
                      duration === 6 ? styles.activeText : styles.inactiveText,
                    ]}>
                    6 hr
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.last,
                    duration === 1 ? styles.active : null,
                  ]}
                  onPress={() => this.setState({duration: 1})}>
                  <Text
                    style={[
                      styles.buttonText,
                      duration === 1 ? styles.activeText : styles.inactiveText,
                    ]}>
                    1 hr
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{marginTop: 12}}>
              <Modal
                animationType="slide"
                transparent={true}
                visible={this.state.modalVisible}
                onRequestClose={() => {
                  Alert.alert('Modal has been closed.');
                }}>
                <TouchableWithoutFeedback
                  onPress={() => {
                    this.setModalVisible(!this.state.modalVisible);
                  }}>
                  <View
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 22,
                    }}>
                    <View style={styles.modal}>
                      <TouchableOpacity
                        onPress={() => {
                          this.setModalVisible(!this.state.modalVisible);
                        }}>
                        <Text style={{color: '#514E5A', fontWeight: '200'}}>
                          Close
                        </Text>
                      </TouchableOpacity>

                      <View style={{alignItems: 'center', marginTop: -5}}>
                        <Text style={styles.title}>Who can see this?</Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => this.setState({privatePoll: false})}>
                        <View style={styles.section}>
                          <View style={styles.optionsModal}>
                            <Icon
                              name="md-globe"
                              size={22}
                              color="#4F566D"
                              style={{marginRight: 15}}
                            />
                            <View style={{width: 200}}>
                              <Text
                                style={{
                                  fontWeight: '400',
                                  color: '#4F566D',
                                  fontFamily: 'HelveticaNeue',
                                }}>
                                Public
                              </Text>
                              <Text
                                style={{
                                  color: '#4F566D',
                                  fontFamily: 'HelveticaNeue',
                                  fontSize: 10,
                                }}>
                                Visible to everyone on the Internet
                              </Text>
                            </View>
                            {!privatePoll ? (
                              <Icon
                                name="ios-checkbox"
                                size={22}
                                color="#12A40B"
                              />
                            ) : null}
                          </View>
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => this.setState({privatePoll: true})}>
                        <View style={styles.section}>
                          <View style={styles.optionsModal}>
                            <Icon
                              name="ios-people"
                              size={22}
                              color="#4F566D"
                              style={{marginRight: 15}}
                            />
                            <View style={{width: 200}}>
                              <Text
                                style={{
                                  fontWeight: '400',
                                  color: '#4F566D',
                                  fontFamily: 'HelveticaNeue',
                                }}>
                                Only Folllowers
                              </Text>
                              <Text
                                style={{
                                  color: '#4F566D',
                                  fontFamily: 'HelveticaNeue',
                                  fontSize: 10,
                                }}>
                                Visible to you and your OutfitPic followers
                              </Text>
                            </View>
                            {privatePoll ? (
                              <Icon
                                name="ios-checkbox"
                                size={22}
                                color="#12A40B"
                              />
                            ) : null}
                          </View>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>
            </View>
          </View>

          <View style={styles.mediaCount}>
            <Text
              style={[
                styles.text,
                {fontSize: 20, color: '#DFD8C8', fontWeight: '300'},
              ]}>
              {this.state.count}
            </Text>
            <Text
              style={[
                styles.text,
                {fontSize: 10, color: '#DFD8C8', textTransform: 'uppercase'},
              ]}>
              Outfits
            </Text>
          </View>
        </View>
      </Root>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(255,255,255)',
  },
  back: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(21, 22, 48, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#8E95AB',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#D8D9DB',
  },
  inputContainer: {
    margin: 20,
    flexDirection: 'row',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  photo: {
    marginHorizontal: 32,
  },
  addImage: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  image: {
    flex: 1,
    height: undefined,
    width: undefined,
  },
  mediaImageContainer: {
    width: 225,
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  mediaCount: {
    backgroundColor: '#41444B',
    position: 'absolute',
    top: '50%',
    marginTop: -5,
    marginLeft: 30,
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    shadowColor: 'rgba(0, 0, 0, 0.38)',
    shadowOffset: {width: 0, height: 10},
    shadowRadius: 20,
    shadowOpacity: 1,
  },
  title: {
    fontWeight: '600',
    fontSize: 15,
    color: '#514E5A',
    marginTop: 10,
    marginBottom: 10,
  },
  section: {
    flexDirection: 'column',
    marginHorizontal: 14,
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomColor: '#EAEAED',
    borderBottomWidth: 1,
  },
  photosContainer: {
    backgroundColor: '#E8EDF2',
    paddingTop: 10,
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomColor: '#EAEAED',
    borderBottomWidth: 1,
  },
  option: {
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modal: {
    width: 300,
    height: 220,
    paddingLeft: 20,
    paddingRight: 20,
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#DEDEE2',
  },
  optionsModal: {
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cancelModal: {
    position: 'absolute',
    top: 10,
    left: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ------ style for poll duration section ------

  group: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#53115B',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 10,
    alignContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    textAlign: 'center',
    fontWeight: '500',
  },
  active: {
    //backgroundColor: "#FF7657"
    backgroundColor: '#53115B',
  },
  activeText: {
    color: '#FFF',
  },
  inactiveText: {
    color: '#514E5A',
  },
  first: {
    borderTopLeftRadius: 13,
    borderBottomLeftRadius: 13,
  },
  last: {
    borderTopRightRadius: 13,
    borderBottomRightRadius: 13,
  },
});

export default OutfitPostScreen;
