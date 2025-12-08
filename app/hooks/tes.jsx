import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import Useauth from './Useauth'
const tes = () => {
    const {id}=Useauth()
  return {id}
}

export default tes

const styles = StyleSheet.create({})