import React, { Component } from 'react';
import { Post } from '../presentation';
import { FlatList} from 'react-native';

class PostFeed extends Component {

  _returnKey(item){
    return item.toString();
    } 
  _renderPost({item}){
    return <Post item={item}/>
    }
    render() {
    return <FlatList 
                data={[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]}
                renderItem = {this._renderPost}
                keyExtractor = {this._returnKey}
                showsVerticalScrollIndicator={false}
            />;
    }
}
export default PostFeed;
