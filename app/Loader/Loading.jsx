import { StyleSheet, Text, View,Animated,Easing,Image } from 'react-native'
import React, { useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons';
import Logo from "../../assets/images/logo.png"

const Loading = () => {

    const spinValue = new Animated.Value(0);

    useEffect(()=>{
        Animated.loop(

            Animated.timing(spinValue, {
                toValue: 1,
                duration: 1000,
                easing: Easing.linear,
                useNativeDriver: true,
            })

        ).start()

    },[])

    const roatate = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    })
    const scale =spinValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 1.2, 1],
    });

  return (
    <SafeAreaView style={{width:"100%",height:"100%",backgroundColor:'rgba(1, 2, 2, 0.16)', justifyContent:'center', alignItems:'center',zIndex:1000,position:'fixed'}}>
      
        <Animated.View style={{width:100, height:100,  transform:[{scale:scale}]}} >
        <View style={{width:100,height:100,borderRadius:100,backgroundColor:'rgba(255,255,255,0.6)'}}>
            
        <Image source={Logo}style={{width:100,height:100,borderRadius:100,}} />
            </View> 
        </Animated.View>

    </SafeAreaView>
  )
}

export default Loading

const styles = StyleSheet.create({})