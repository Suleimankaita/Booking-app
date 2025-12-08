import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const RemoveCookie = async() => {
    try{
        await AsyncStorage.removeItem('cokkie')
    }catch(err){
        alert(err?.message)
    }
}

export default RemoveCookie

const styles = StyleSheet.create({})