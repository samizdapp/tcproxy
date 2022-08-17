import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Linking } from 'react-native';
import {useEffect} from 'react'
import net from 'react-native-tcp-socket'
import * as WebBrowser from 'expo-web-browser';

function init(){


const server = new net.Server();

server.on('connection', (socket) => {
  console.log('got socket', socket)
  const forward = new net.Socket()
  let connected = false;
  const chunks = []
  socket.on('data', d => {
    console.log('req data',d)
    if (!connected){
      chunks.push(d)
    } else {
      forward.write(d)
    }
  })

  forward.on('data', d => {
    socket.write(d)
  })

  forward.connect({
    port: 80,
    host: '192.168.50.195',
    reuseAddress: true,
  }, () => {
    console.log('got forward connect')
    connected = true;
    for (const c of chunks){
      forward.write(c)
    }
  })
});

server.listen({ port: 8080, host: '127.0.0.1', reuseAddress: true }, async () => {
  console.log('listen cb')
  const port = server.address()?.port;
  if (!port) throw new Error('Server port not found');
  Linking.openURL('http://localhost:8080/pwa')
});
}

export default function App() {
  useEffect(() => {
    init()
  }, [])
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
