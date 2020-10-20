//@refresh reset

import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useCallback } from "react";
import Svg, { Path } from 'react-native-svg';
import WavyHeader from './src/WavyHeader';

import {
  StyleSheet,
  Text,
  View,
  YellowBox,
  TextInput,
  Button,
  Dimensions
} from "react-native";
//import GradientHeader from "react-native-gradient-header";
import { GiftedChat } from 'react-native-gifted-chat';
import * as firebase from "firebase";
import "firebase/firestore";
import AsyncStorage from "@react-native-community/async-storage";
import Icon from "react-native-vector-icons/FontAwesome";

const firebaseConfig = {
  apiKey: "AIzaSyCuJ2L22WLzLPWx-zmj3V9H-puDZo63sks",
  authDomain: "react-native-chat-pg.firebaseapp.com",
  databaseURL: "https://react-native-chat-pg.firebaseio.com",
  projectId: "react-native-chat-pg",
  storageBucket: "react-native-chat-pg.appspot.com",
  messagingSenderId: "231051248457",
  appId: "1:231051248457:web:179bd29186f4e268e91098",
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig)
}

YellowBox.ignoreWarnings(["Setting a timer for a long period of time"]);
// yahan db define karke read karega
// can use document also but using collection .. patalagao
const db = firebase.firestore();
const chatsRef = db.collection('chats');

export default function App() {
  const [user, setUser] = useState("");
  const [name, setName] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    readUser();
    const unsubscribe = chatsRef.onSnapshot((querySnapshot) => {
      //could have used querySnapshot.forEach for getting all values
      const messagesFirestore = querySnapshot
        .docChanges()
        .filter(({ type }) => type == "added")
        .map(({doc}) => {
          const message = doc.data();
          return {...message, createdAt: message.createdAt.toDate() };
        }).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime() );
        appendMessages(messagesFirestore);
    });
    return () => unsubscribe()
  }, []);

  const appendMessages = useCallback(
    (messages) => {
        setMessages((previousMessages) => GiftedChat.append(previousMessages, messages))
    },
    [messages]
)

  async function readUser() {
    const user = await AsyncStorage.getItem("user");
    if (user) {
      setUser(JSON.parse(user));
    }
  }

  async function handlePress() {
    const _id = Math.random().toString(36).substring(7);
    const user = { _id, name };
    await AsyncStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Assignmets Yahan</Text>
        <Text style={styles.sub}> Enter Secret Chat Room  </Text>
        <View style={styles.container}>
          
        </View>
        <View style={styles.home}>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
        />
        <View style={styles.buttons}>
        <Button title="Enter the chat" onPress={handlePress} color="#2b0956"  />
        </View>
        </View>
      </View>
    );
  }

  async function handleSend(messages) {
    const writes = messages.map(m => chatsRef.add(m));
    await Promise.all(writes);
  }
  
  
  return (
      <GiftedChat messages={messages} user={user} onSend={handleSend} />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    fontSize: 56,
    backgroundColor: "#fff2f2",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  textStyle: {
    fontSize: 56,
    color: "#C1E3FF",
  },
  input: {
    color:'#6b0956',
    backgroundColor: "#fff",
    height: 5,
    width: "100%",
    borderWidth: 1,
    marginBottom: 50,
    padding: 30,
    borderColor: "gray",
    borderRadius: 5,
  },
  buttons: {
    width: '100%',
    fontStyle: 'bold',
    borderRadius: 5,
    height: 50
  },
  header: {
    fontWeight: 'bold',
    fontSize: 75,
    //fontFamily: 'sans',
    padding: 30,
    color: '#755985',
    paddingBottom: 50,
    
  },
  sub: {
    backgroundColor:'#ffe6e7',
    fontSize: 24,
    fontFamily: 'sans-serif',
    padding: 10,
    color: '#442b63',
    borderWidth: 1,
    marginBottom: 30,
    borderStyle: 'dashed',
    borderColor: 'ffffff'
  },
  home:{

  },
  bottomalign:{

  },
  headerContainer: {
    marginTop: 10,
    marginHorizontal: 10
  },
  svgCurve: {
    position: 'absolute',
    width: Dimensions.get('window').width
  },
  headerText: {
    fontSize: 56,
    fontWeight: 'bold',
    // change the color property for better output
    color: '#fff',
    textAlign: 'center',
  }
});
