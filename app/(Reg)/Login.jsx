import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAUTHMutation } from '@/components/api/Getslice';
import { useDispatch } from 'react-redux';
import { settoken } from '@/components/Funcslice';
import LOGO_IMAGE from "../../assets/images/logo.png";
import { useRouter } from 'expo-router';
import Loading from '../Loader/Loading';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
  const router = useRouter();
  const [Sub, { isLoading, isSuccess, isError, error }] = useAUTHMutation();
  const dispatch = useDispatch();
  const [username, setusername] = useState('');
  const [password, setpassword] = useState('');

  useEffect(() => {
    if (isSuccess) {
      router.replace('/');
    }
  }, [isSuccess]);

  const Submit = async () => {
    try {
      const result = await Sub({ Username:username, password });

      console.log('Login Response:', result);

      if (result?.error) {
        alert(result.error?.data?.message || 'Invalid credentials');
        return;
      }
      if (result?.data) {
        
        dispatch(settoken(result?.data));
        await AsyncStorage.setItem('cokkie', JSON.stringify(result?.data));
        router.replace('/');
      }
    } catch (err) {
      alert(err?.message || 'An unexpected error occurred');
    }
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <Image source={LOGO_IMAGE} style={styles.logo} resizeMode="cover" />

        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Log in to continue</Text>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <AntDesign name="user" size={20} color="#777" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor={'black'}
              autoCapitalize="none"
              value={username}
              onChangeText={setusername}
            />
          </View>

          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="lock-outline" size={20} color="#777" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={'black'}
              secureTextEntry
              value={password}
              onChangeText={setpassword}
            />
          </View>
        </View>

        <TouchableOpacity onPress={() => router.push('/otp')} style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={Submit}>
          <Text style={styles.buttonText}>LOG IN</Text>
        </TouchableOpacity>

        <View style={styles.signupLinkContainer}>
          <Text style={styles.noAccountText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => router.replace('/Sign')}>
            <Text style={styles.signupLinkText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <Loading />
        </View>
      )}
    </>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 20,
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    borderRadius: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#777',
    marginBottom: 40,
  },
  inputContainer: {
    width: '90%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000000ff',
  },
  forgotPasswordContainer: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 20,
    padding: 10,
  },
  forgotPasswordText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    width: '80%',
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupLinkContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  noAccountText: {
    fontSize: 16,
    color: '#777',
  },
  signupLinkText: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '600',
    marginLeft: 5,
  },
  loadingOverlay: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: '#14141434',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});

export default LoginScreen;
