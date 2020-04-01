import React, { Component } from 'react';
import {View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, Modal, FlatList, SafeAreaView, TouchableWithoutFeedback, TouchableHighlight} from 'react-native';
import Icon from 'react-native-ionicons';
import Fire from "../../Fire";
import {LineChart, ProgressChart, BarChart, PieChart} from "react-native-chart-kit";
import ImageZoom from 'react-native-image-pan-zoom';
import ProgressCircle from 'react-native-progress-circle';
import Dialog from "react-native-dialog";

const width = Dimensions.get('window').width;

const chartConfig2 = {
    backgroundColor: "#4f6273",
    backgroundGradientFrom: "#45708c",
    backgroundGradientTo: "#1a2933",
    decimalPlaces: 0, // optional, defaults to 2dp
    barPercentage: 1.5,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        style: {
                borderRadius: 16
                },
        propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#ffa726"
         }
    }

const data2 = {
    labels: ["1", "2", "3"],
    datasets: [
      {
        data: [25, 41, 30]
      }
    ]
  };

class PostStats extends Component{
    static navigationOptions = ({ navigation }) => ({
        //title: 'Stats',
        header: null
      })

    constructor(props){
        super(props);
        this.state = {
            pollId: this.props.navigation.state.params.pollId,
            poll: {},
            photos:[],
            numParticipants: 0,
            votes: [],
            modalVisible: false,
            modalImage: '',
            dialogVisible: false,
            blockComments: false,
        }
    }

    unsubscribe = null;

    componentDidMount() {
        const user = this.props.uid || Fire.shared.uid;
        const pollId = this.state.pollId;
        let outfitPollRef = Fire.shared.firestore.collection("outfitPolls").doc(pollId);
  
        this.unsubscribe = outfitPollRef.get()
            .then(doc => {
              this.setState({ poll: doc.data() });
              this.setState({ photos: doc.data().images });
              this.setState({ blockComments: doc.data().blockComments})
              var votes = this.state.poll.votes;
              var result = Object.keys(votes).map(key => ({id: Number(key), votes: votes[key]}));
              this.setState({ votes: result });
            });

        let participantsRef = outfitPollRef.collection('participants').doc('--participantsCount--').get()
            .then(doc => {
                this.setState({ numParticipants: doc.data().total });
            });    
    }
    
    componentWillUnmount() {
        //this.unsubscribe();
    }

    openListVoters(photoId){
        this.props.navigation.navigate('votersScreen', { pollId: this.state.pollId, photoId: photoId});
    }
    
    openComments(){
        this.props.navigation.navigate('comments', { pollId: this.state.pollId });
    }

    openLikes(){
        this.props.navigation.navigate('likesScreen', { pollId: this.state.pollId });
    }

    setModalVisible(visible,imageKey) {
        this.setState({modalImage: this.state.poll.images[imageKey].url});
        this.setState({modalVisible: visible});
    };

    showDialog = () => {
        this.setState({ dialogVisible: true });
    };
     
    handleCancel = () => {
        this.setState({ dialogVisible: false });
    };

    deletePost = () => {
        const user = Fire.shared.uid;
        if ( user === this.state.poll.uid){
            Fire.shared.DeletePost(this.state.pollId)
            .then(ref => {
                this.props.navigation.goBack();
            })
            .catch(error => {
                alert(error);
            });
        } else {
            alert ('Not authorized to perfom this action')
        }
    } 

    renderItem = ({item,index}) => {
        return (
          <View style={styles.mediaImageContainer}> 
            <TouchableWithoutFeedback key={index} onPress={() => {this.setModalVisible(true,index)}}>
                <Image source={{ uri: item.url }} style={styles.image} resizeMode="cover"/>  
            </TouchableWithoutFeedback>        
          </View>
        )
      }; 

    renderGraphItem =({item, index}) => { 
        const percentage = this.state.numParticipants === 0 ? 1 : (item.votes/this.state.numParticipants*100).toFixed(1);
        return (
            <TouchableWithoutFeedback key={index} onPress={() => {this.openListVoters(index.toString())}}>
                <View style={styles.mediaGraphContainer}>     
                    <ProgressCircle
                        percent={percentage}
                        radius={60}
                        borderWidth={20}
                        color='#b53f45'
                        shadowColor='#c7bacc'
                        bgColor="#fff">
                            <Text style={{ fontSize: 16, color: "#4F566D",fontFamily: "HelveticaNeue" }}>{percentage} %</Text>
                    </ProgressCircle>
                    <Icon name="md-people" size={24} color="#4F566D"/>   
                </View>
            </TouchableWithoutFeedback> 
        )
    }  

    render() {
       
        return (
            <SafeAreaView style={styles.content}>
                <View >
                <View style={styles.titleBar}>
                    <TouchableOpacity style={styles.back} onPress={() => this.props.navigation.goBack()}>
                        <Icon name="arrow-round-back"></Icon>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.back} onPress={this.showDialog}>  
                        <Icon name="md-trash" size={24} color="#52575D"></Icon>
                    </TouchableOpacity> 
                </View>

                <View style={{alignItems:'center'}} >
                    <Text style={styles.title}> Poll Insights</Text>
                </View>
               
                <View style={styles.statsContainer}>
                    <View style={styles.stat}>
                        {this.state.numParticipants
                        ? <Text style={styles.statTitle}><Icon name="person" color="#E27128"/></Text>
                        : <Text style={styles.statTitle}><Icon name="person"/></Text>}
                        <Text style={styles.statAmount}>{this.state.numParticipants}</Text>
                    </View>
                    <View style={[styles.stat, { borderColor: "#DFD8C8", borderLeftWidth: 1, borderRightWidth: 1 }]}>
                        {this.state.poll.numComments 
                        ? <TouchableOpacity onPress={() => this.openComments()}><Text style={styles.statTitle}><Icon name="chatboxes" color="#E27128"/></Text></TouchableOpacity>
                        : <Text style={styles.statTitle}><Icon name="chatboxes"/></Text>}
                        {!this.state.blockComments 
                        ? <TouchableOpacity onPress={() => this.openComments()}>
                            <Text style={styles.statAmount}>{this.state.poll.numComments}</Text>
                         </TouchableOpacity> 
                        : <Text style={styles.statAmount}><Icon name="lock" size={18}/></Text>  }        
                    </View>
                    <View style={styles.stat}>
                        {this.state.poll.likesCount
                        ? <TouchableOpacity onPress={() => this.openLikes()}><Text style={styles.statTitle}><Icon name="heart" color="#E27128"/></Text></TouchableOpacity>
                        : <Text style={styles.statTitle}><Icon name="heart"/></Text>}
                        <TouchableOpacity onPress={() => this.openLikes()}>
                            <Text style={styles.statAmount}>{this.state.poll.likesCount}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                
                
                <View style={{flexDirection: 'row'}}>
                    <View style={styles.postsContainer}>
                        <FlatList
                            style={styles.feedFlatlist}
                            data={this.state.photos}
                            renderItem = {this.renderItem}
                            keyExtractor={item => item.id}
                            showsVerticalScrollIndicator={false}
                        ></FlatList>
                    </View>
                    <View style={styles.postsContainer}>
                        <FlatList
                            style={styles.feedFlatlist}
                            data={this.state.votes}
                            renderItem = {this.renderGraphItem}
                            keyExtractor={(item,index) => index.toString()}
                            showsVerticalScrollIndicator={false}
                        ></FlatList>
                    </View>
                </View>
        
                <View style={{marginTop: 22}}>
                    <Modal
                        style={styles.modal}
                        animationType="slide"
                        transparent={true}
                        visible={this.state.modalVisible}
                        onRequestClose={() => {Alert.alert('Modal has been closed.');
                    }}>
                        <View style={styles.modal}>
                            <TouchableHighlight onPress={() => { this.setModalVisible(!this.state.modalVisible,0)}}>
                              <Icon name="ios-close-circle" size={45} color="#fff" />
                            </TouchableHighlight>                          
                            <ImageZoom cropWidth={Dimensions.get('window').width}
                                      cropHeight={Dimensions.get('window').height-200}
                                      imageWidth={400}
                                      imageHeight={400}>
                                <Image style={{width:400, height:400, flex:1}}
                                      source={{ uri:this.state.modalImage }}/>
                            </ImageZoom> 
                        </View>
                    </Modal>
                </View> 

                <View>
                    <Dialog.Container visible={this.state.dialogVisible}>
                        <Dialog.Title>Delete Post?</Dialog.Title>
                        <Dialog.Button label="Cancel" onPress={this.handleCancel} />
                        <Dialog.Button label="Delete" onPress={this.deletePost} />
                    </Dialog.Container>
                </View> 

                </View>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    content:{
        flex:1,
        justifyContent:"center",
        alignItems: "center",
        backgroundColor: "#E8EDF2"  
    },
    modal:{
        flex:1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.9)',
    },
    modalDelete:{
        flexDirection:'column',
        width: 300, 
        height: 150,
        padding: 26,
        justifyContent:"center",
        alignItems:'center',
        borderRadius: 12,
        backgroundColor:'#FBFBFB'
    },
    back: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "rgba(21, 22, 48, 0.1)",
        alignItems: "center",
        justifyContent: "center"
      },
    titleBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        //marginTop: 24,
        marginHorizontal: 16
    },
    title:{
        color: "#4F566D",
        fontFamily: "HelveticaNeue", 
        fontWeight: '200',
        fontSize:16,
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems:'center',
        margin: 14,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 8,
        shadowColor: "#5D3F6A",
        shadowOffset: { height: 5 },
        shadowOpacity: 0.2
    },
    stat: {
        alignItems: "center",
        flex: 1,
    },
    statAmount: {
        color: "#4F566D",
        fontSize: 18,
        fontWeight: "300"
    },
    statTitle: {
        color: "#C3C5CD",
        fontSize: 12,
        fontWeight: "500",
        marginTop: 4
    },
    section: {
        //flexDirection: "column",
        alignContent:'center',
        marginHorizontal: 14,
        marginBottom: 10,
        paddingBottom: 10,
        borderBottomColor: "#EAEAED",
        borderBottomWidth: 1,
      },
    graphStyle: {
        marginVertical: 8,
        borderRadius: 16
    },
    postsContainer: {
        margin:10,
        alignItems: 'center',
        shadowColor: "#5D3F6A",
        shadowRadius: 8,
        shadowOpacity: 0.2
    },
    image: {
        flex: 1,
        height: undefined,
        width: undefined
      },
    mediaImageContainer: {
        width: 140,
        height: 160,
        borderRadius: 8,
        overflow: "hidden",
        marginHorizontal:5,
        marginBottom: 15
    },
    mediaGraphContainer: {
        justifyContent: 'center',
        alignItems:'center',
        width: 120,
        height: 160,
        borderRadius: 8,
        overflow: "hidden",
        marginHorizontal:5,
        marginBottom: 15
    },
    feedFlatlist: {
        marginHorizontal: 10,
        marginTop: 10,
      },  
 
});

export default PostStats;

/*<BarChart
                        style={styles.graphStyle}
                        data={data2}
                        width={width-15}
                        height={220}
                        //yAxisLabel="$"
                        chartConfig={chartConfig2}
                        //verticalLabelRotation={30}
                        fromZero={true}
                        withInnerLines={true}
                        showBarTops={true}
                        absolute={true}
                        //hideLegend={true}
                    />*/

                   /* 
                    <LineChart
                    data={{
                    labels: ["January", "February", "March", "April", "May", "June"],
                    datasets: [
                        {
                        data: [
                            Math.random() * 100,
                            Math.random() * 100,
                            Math.random() * 100,
                            Math.random() * 100,
                            Math.random() * 100,
                            Math.random() * 100
                        ]
                        }
                    ]
                    }}
                    width={width-20} // from react-native
                    height={120}
                    yAxisLabel="$"
                    yAxisSuffix="k"
                    yAxisInterval={1} // optional, defaults to 1
                    chartConfig={chartConfig2}
                    bezier
                    style={styles.graphStyle}
                />
                  */            
             