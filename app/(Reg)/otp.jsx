import { uri } from '@/components/api/Getslice';
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator, 
  ScrollView
} from 'react-native';
import * as Device from "expo-device" 
import { useSend_otpMutation,useVerify_otpMutation,useResetsMutation,useEdit_profileMutation,useReset_passwordMutation } from '@/components/api/Getslice';
import { router } from 'expo-router';
const API_URL =uri; // Replace with your backend base URL

const ForgotPasswordScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [contact, setContact] = useState('');
  const [SendMail]=useSend_otpMutation()
  const [Verify]=useVerify_otpMutation()
  const [Reset,{isSuccess}]=useReset_passwordMutation()
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const intervalRef = useRef(null);

  const maskedContact = contact.replace(/^(.)(.*)(.{4})$/, '$1***$3');

  // 🕒 Countdown timer for resend
  useEffect(() => {
    if (timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [timer]);

 
  useEffect(()=>{
    if(isSuccess){
      router.push('/Login')
    }
  },[isSuccess,router])

  const handleSendOtp = async () => {
    if (!contact) {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }

    setLoading(true);
    try {
      const data= await SendMail({email: contact,Device});
      console.log(data);

      if (data.data) {
        Alert.alert('Success', `OTP sent to ${maskedContact}`);
        setStep(2);
        const expireMs = data.expireAt ? data.expireAt - Date.now() : 5 * 60 * 1000;
        setTimer(Math.floor(expireMs / 1000));
      } else {
        Alert.alert('Error', data.message || 'Failed to send OTP.');
      }
    } catch (err) {
      Alert.alert('Error', 'Server not reachable.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      const data = await Verify({ email: contact, otp});
      console.log(data);
      if (data.data.success) {
        Alert.alert('Success', 'OTP verified successfully!');
        setStep(3);
      } else if (data.message === "OTP expired or not found") {
        Alert.alert('Error', 'OTP expired! Please resend a new one.');
        setTimer(0);
      } else {
        Alert.alert('Error', data.message || 'Invalid OTP.');
      }
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Network error while verifying OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const data = await Reset({email:contact,newPassword });
      console.log(data);
      if (data.data?.sucess) {
        Alert.alert('Success', 'Password reset successfully! Please log in.');
      } else {
        Alert.alert('Error', data.message || 'Password reset failed.');
      }
    } catch (err) {
      Alert.alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Step 1: Request OTP ---
  const renderStep1 = () => (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.subtitle}>
        Enter your registered email. We'll send you a verification code.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="example@domain.com"
        value={contact}
        onChangeText={setContact}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSendOtp}
        disabled={loading || !contact}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Verification Code</Text>}
      </TouchableOpacity>
    </View>
  );

  // --- Step 2: Verify OTP ---
  const renderStep2 = () => (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Code</Text>
      <Text style={styles.subtitle}>
        A 6-digit code was sent to **{maskedContact}**
      </Text>

      <TextInput
        style={[styles.input, styles.otpInput]}
        placeholder="Enter 6-digit code"
        value={otp}
        onChangeText={(text) => setOtp(text.slice(0, 6))}
        keyboardType="numeric"
        maxLength={6}
      />

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleVerifyOtp}
        disabled={loading || otp.length !== 6}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify Code</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSendOtp} disabled={timer > 0 || loading}>
        <Text style={[styles.linkText, { opacity: timer > 0 ? 0.5 : 1 }]}>
          {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // --- Step 3: Reset Password ---
  const renderStep3 = () => (
    <View style={styles.container}>
      <Text style={styles.title}>Set a New Password</Text>
      <Text style={styles.subtitle}>Enter your new password below.</Text>

      {/* ✅ Fixed the field names */}
      {/* <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      /> */}
      
      <View/>
      
      <TextInput
        style={styles.input}
        placeholder="newPassword"
        secureTextEntry
         value={newPassword}
        onChangeText={setNewPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleResetPassword}
        disabled={loading || !newPassword || newPassword !== confirmPassword}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Reset Password</Text>}
      </TouchableOpacity>
    </View>
  );

  switch (step) {
    
    case 1: return <ScrollView scrollEnabled={false} style={{flex:1}} contentContainerStyle={{flex:1}} automaticallyAdjustKeyboardInsets> {renderStep1()}</ScrollView>;
    case 2: return <ScrollView scrollEnabled={false} contentContainerStyle={{flex:1}}automaticallyAdjustKeyboardInsets>{renderStep2()}</ScrollView>;
    case 3: return <ScrollView  scrollEnabled={false} contentContainerStyle={{flex:1}}automaticallyAdjustKeyboardInsets> {renderStep3()}</ScrollView>;
    default: return renderStep1();
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 10,
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: '#3498db',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    minHeight: 50,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
    marginTop: 10,
  },
});

export default ForgotPasswordScreen;
