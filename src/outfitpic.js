import React, {Component} from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { createDrawerNavigator } from 'react-navigation-drawer';
import { 
  Loading, 
  MainFeed, //not used here
  PostStats, 
  Login, 
  Register, 
  FriendsScreen, 
  PostScreen,
  OutfitPostScreen, 
  Feed,
  ChatScreen, 
  Rooms, 
  PrivateChatScreen,
  PollBoard, 
  Comments,
  PublicProfile,
  Profile, 
  ProfileSettings,
  NotificationsSettings,
  VotersScreen,
  Likes,
  FollowersList } from './components/screens';
import { AddButton } from './components/presentation';
import Icon from 'react-native-ionicons';
import { Dimensions } from "react-native";
import { SideBar } from './components/presentation';

const PostStack = createStackNavigator(
  {
    feed : Feed,
    poll : PollBoard,
    comments: Comments,
  },
  {
    initialRouteName:'feed',
    mode: "modal",
    headerMode: "none",
  }
)

const ProfileStack = createStackNavigator(
  {
    profileSettings : ProfileSettings,
  },
  {
    initialRouteName:'profileSettings',
    mode: "modal",
    headerMode: "none",
  }
)

const DrawerNavigator = createDrawerNavigator(
  {
      Home: {
          screen: PostStack,
          navigationOptions: {
              title: "Home",
              drawerIcon: ({ tintColor }) => <Icon name="home" size={16} color={tintColor} />
          }
      },
      Add: {
          screen: OutfitPostScreen,
          navigationOptions: {
              title: "Add",
              drawerIcon: ({ tintColor }) => <Icon name="ios-add-circle" size={16} color={tintColor} />
        }
      },
      Search: {
          screen: FriendsScreen,
          navigationOptions: {
              title: "Search",
              drawerIcon: ({ tintColor }) => <Icon name="search" size={16} color={tintColor} />
          }
      },
      Stats: {
          screen: Profile,
          navigationOptions: {
              title: 'My Polls',
              drawerIcon: ({ tintColor }) => <Icon name="contact" size={16} color={tintColor} />
          }
      },
      Notifications: {
          screen: NotificationsSettings,
          navigationOptions: {
              title: "Notifications",
              drawerIcon: ({ tintColor }) => <Icon name="ios-notifications" size={16} color={tintColor} />
        }
      },
      Settings: {
          screen: ProfileStack,
          navigationOptions: {
              title: "Settings",
              drawerIcon: ({ tintColor }) => <Icon name="ios-settings" size={16} color={tintColor} />
          }
      }
  },
  {
      contentComponent: props => <SideBar {...props}/>,

      drawerWidth: Dimensions.get("window").width * 0.85,
      hideStatusBar: true,

      contentOptions: {
          activeBackgroundColor: "#EEF0F7",
          activeTintColor: "#53115B",
          itemsContainerStyle: {
              marginTop: 16,
              marginHorizontal: 8
          },
          itemStyle: {
              borderRadius: 20
          }
      }
  }
);


const AppContainer = createStackNavigator(
  {
    //default: TabNavigator,
    default: DrawerNavigator,
    chat:ChatScreen,
    privateChat: PrivateChatScreen,
    pollStats: PostStats,
    votersScreen: VotersScreen,
    likesScreen: Likes,
    followersList: FollowersList,
    publicProfile: PublicProfile,
    postModal: {
      screen: OutfitPostScreen,
    },
  },
  {
    mode: "modal",
    headerMode: "none",
  }
);

const IntroStack = createStackNavigator(
    {
      login: Login,
      register: Register,
    },
    {
      initialRouteName: 'login',
    }
  );

const MainStack = createAppContainer(createSwitchNavigator(
    {
      loading: Loading,
      main: AppContainer,
      //menu: DrawerNavigator,
      intro: IntroStack,
    },
    {
      initialRouteName: 'loading',
    }
)); 

class OutfitPic extends Component {
 render() {
     return (<MainStack/>);
  }
}

export default OutfitPic;




/*const TabNavigator = createBottomTabNavigator({
  Feed: { 
    screen: PollStack, 
    navigationOptions: {
    tabBarIcon: ({ tintColor }) => <Icon name="ios-paper" size={24} color={tintColor} />
  }},
  Poll: { 
    screen: PostStats,
    navigationOptions: {
    tabBarIcon: ({ tintColor }) => <Icon name="ios-archive" size={24} color={tintColor} />
  }},
  PostScreen: { 
    screen: OutfitPostScreen, 
    navigationOptions: {
    tabBarIcon: <AddButton/>  
  }},
  Friends: {
    screen: ChatStack, 
    navigationOptions: {
    tabBarIcon: ({ tintColor }) => <Icon name="ios-contacts" size={24} color={tintColor} />
  }},
  Profile: { 
    screen: ProfileSettings, 
    navigationOptions: {
    tabBarIcon: ({ tintColor }) => <Icon name="ios-person" size={24} color={tintColor} />
  }},
},
{ defaultNavigationOptions: {
    tabBarOnPress: ({ navigation, defaultHandler }) => {
        if (navigation.state.key === "PostScreen") {
            navigation.navigate("postModal");
        }
        else {
            defaultHandler();
        }
      }
    },
  tabBarOptions: {
      activeTintColor: "#161F3D",
      inactiveTintColor: "#B8BBC4",
      showLabel: false
  }
});  */