import React, { Component } from "react";
import { View, Text, StyleSheet } from "react-native";


class StatsElement extends Component {

    render(){
        return (
            <View style={styles.statsContainer}>
                    <View style={styles.stat}>
                        <Text style={styles.statAmount}>{this.props.numPosts}</Text>
                        <Text style={styles.statTitle}>Posts</Text>
                    </View>
                    <View style={[styles.stat, { borderColor: "#DFD8C8", borderLeftWidth: 1, borderRightWidth: 1 }]}>
                        <Text style={styles.statAmount}>{this.props.numFollowers}</Text>
                        <Text style={styles.statTitle}>Followers</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statAmount}>{this.props.numFollowing}</Text>
                        <Text style={styles.statTitle}>Following</Text>
                    </View>
            </View>
        );
    };
};

const styles = StyleSheet.create({
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems:'center',
        flex: 1,
        margin: 10
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
})

export default StatsElement;