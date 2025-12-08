import React, { useState, useRef, useEffect } from 'react';
import { 
    StyleSheet, 
    Text, 
    View, 
    TextInput, 
    TouchableOpacity, 
    ScrollView, 
    Switch, 
    Alert,
    ActivityIndicator,
    Image, 
    Keyboard,
    findNodeHandle, 
    Platform,
    Modal ,
    SafeAreaView
} from 'react-native';
import { useRegMutation,useAUTHMutation } from '@/components/api/Getslice';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker'; 
import DateTimePicker from '@react-native-community/datetimepicker'; 
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { settoken } from '@/components/Funcslice';
import { useDispatch } from 'react-redux';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
const RegistrationScreen = () => {
    const [Registrations,{isSuccess:regSuccess,isLoading,isError,error}]=useRegMutation()
    const [Login,{isSuccess:logsuccess}]=useAUTHMutation()
    const twentyYearsAgo = new Date();
    const [Births,setBirths]=useState('')
    twentyYearsAgo.setFullYear(twentyYearsAgo.getFullYear() - 20);
    const dispatch=useDispatch()
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        firstname: '',
        lastname: '',
        password: '',
        birth: twentyYearsAgo, 
        profileImageUri: null,
    });
    const [loading, setLoading] = useState(false);
    const [receiveEmails, setReceiveEmails] = useState(true);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleInputChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const formatDate = (date) => {
        if (!(date instanceof Date) || isNaN(date.getTime())) return 'DD/MM/YYYY';
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const scrollViewRef = useRef(null); 
    const usernameRef = useRef(null);
    const passwordRef = useRef(null);
    const emailRef = useRef(null);
    const firstNameRef = useRef(null);
    const lastNameRef = useRef(null);
    const birthRef = useRef(null); 

    useEffect(()=>{
        if(isError){
            alert(error?.data?.message)
        }
    },[isError])



    useEffect(()=>{
      const ms=async()=>{
              const get=await AsyncStorage.getItem('cokkie')
              console.log(32, get)
              if(get){
              }

      }
      ms()
    },[])
    const Logins=async()=>{
        try{
            const res=await Login({Username:formData.username,password:formData.password})
            console.log(res.data)
            await AsyncStorage.setItem('cokkie',JSON.stringify(res.data))
            dispatch(settoken(res.data))
        }catch(err){
            alert(err?.message)
        }
    }
    useEffect(()=>{
        if(logsuccess){
        router.replace('/')
        }
    },[logsuccess])

    // --- 3. Scroll and Focus Logic (Unchanged) ---
    const handleScrollToInput = (inputRef) => {
        const inputNode = findNodeHandle(inputRef.current);
        
        if (inputNode && scrollViewRef.current) {
            setTimeout(() => {
                inputRef.current.measureLayout(
                    findNodeHandle(scrollViewRef.current),
                    (x, y) => {
                        console.log(x , y)
                        // scrollViewRef.current.scrollTo({ y: y - 10, animated: true });
                    },
                    () => {}
                );
            }, 100); 
        }
    };
    
    const focusNextInput = (ref) => {
        if (ref.current) {
            ref.current.focus();
        } else {
            Keyboard.dismiss();
        }
    };

    const addimg=async()=>{
        try{
            const {status}=await ImagePicker.requestMediaLibraryPermissionsAsync()
            if(status!=='granted'){
                return alert('Sorry we dont have permission to access your library')
            }
            const result= await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 1,
                });
                if(!result.canceled){
                    setFormData(prev=>({
                        ...prev,
                        profileImageUri:result.assets[0].uri
                    }))
                }
        }catch(err){
            alert(err.message)
        }
    }

    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || formData.birth;
        setBirths(currentDate?.toISOString())
        if (Platform.OS === 'android') {
            setShowDatePicker(false); 
        }

        if (event.type === 'set') {
            handleInputChange('birth', currentDate);
        }
    };

    const confirmIOSDate = () => {
        setShowDatePicker(false);
        scrollViewRef.current?.scrollToEnd({ animated: true }); 
    };

    useEffect(()=>{
        console.log(Births)
    },[Births])

    const handleRegister = async () => {
        if (loading) return;

        if (!formData.username || !formData.email || !formData.firstname ||!Births) {
            Alert.alert("Missing Fields", "Please fill in all required fields.");
            return;
        }

        setLoading(true);
        Keyboard.dismiss();

        const registrationData = {
            username: formData.username,
            email: formData.email,
            firstname: formData.firstname,
            lastname: formData.lastname,
            birth: formData.birth.toISOString(), 
            receiveEmails: receiveEmails,
        };

        try {
            await new Promise(resolve => setTimeout(resolve, 2000)); 
            const form=new FormData();
            form.append('firstname',formData.firstname)    
            form.append('lastname',formData.lastname)    
            form.append('email',formData.email)    
            form.append('Username',formData.username);
            form.append('password',formData.password);
            form.append('Birth',Births);
            const img=formData.profileImageUri.split('.').at(-1)
            form.append('file',{
                uri:formData.profileImageUri,
                name:'file.'+img,
                type:'file.'+img,
            });

            const regs=await Registrations({form})
            console.log(regs)
            if(regs.data){
                
                Logins()
            } 

            setLoading(false);
            Alert.alert(
                "Success! 🎉", 
                `Account created for ${formData.username}.`,
                [{ text: "Continue", onPress: () => { /* Add navigation logic here */ } }]
            );
        } catch (error) {
            setLoading(false);
            Alert.alert("Registration Failed", "A network or server error occurred. Please try again.");
        }
    };

    // --- 6. Render UI ---
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                ref={scrollViewRef} 
                contentContainerStyle={styles.scrollContent} 
                keyboardShouldPersistTaps="handled"
            >
                
                {/* Header and Profile Picture Sections (Unchanged) */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Create Account</Text>
                    <Text style={styles.headerSubtitle}>Complete your profile details below</Text>
                </View>
                
                <View style={styles.profileSection}>
                    <View style={styles.profileImageWrapper}>
                        {formData.profileImageUri ? (
                            <Image source={{ uri: formData.profileImageUri }} style={styles.profileImage} />
                        ) : (
                            <Icon name="person-outline" size={40} color="#fff" />
                        )}
                        <TouchableOpacity style={styles.cameraIcon} onPress={addimg}>
                            <Icon name="camera" size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.uploadButton} onPress={addimg}>
                        <Text style={styles.uploadButtonText}>{formData.profileImageUri ? 'Change Photo' : 'Add Profile Photo'}</Text>
                    </TouchableOpacity>
                </View>

                {/* Form Fields */}
                <View style={styles.formContainer}>
                    {/* Username */}
                    <View style={styles.inputGroup}>
                        <Icon name="person-circle-outline" size={22} color="#444" style={styles.inputIcon} />
                        <TextInput
                            ref={usernameRef}
                            style={styles.input}
                            placeholder="Username"
                            value={formData.username}
                            onChangeText={(text) => handleInputChange('username', text)}
                            autoCapitalize="none"
                            returnKeyType="next"
                            onSubmitEditing={() => focusNextInput(passwordRef)}
                            onFocus={() => handleScrollToInput(usernameRef)} 
                        />
                    </View>
                    
                    <View style={styles.inputGroup}>
                        <MaterialCommunityIcons name="lock" size={22} color="#444" style={styles.inputIcon} />
                        <TextInput
                            ref={passwordRef}
                            style={styles.input}
                            placeholder="Password"
                            value={formData.password}
                            onChangeText={(text) => handleInputChange('password', text)}
                            autoCapitalize="none"
                            returnKeyType="next"
                            onSubmitEditing={() => focusNextInput(emailRef)}
                            onFocus={() => handleScrollToInput(passwordRef)} 
                        />
                    </View>
                    
                    {/* Email */}
                    <View style={styles.inputGroup}>
                        <Icon name="mail-outline" size={22} color="#444" style={styles.inputIcon} />
                        <TextInput
                            ref={emailRef}
                            style={styles.input}
                            placeholder="Email"
                            value={formData.email}
                            onChangeText={(text) => handleInputChange('email', text)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            returnKeyType="next"
                            onSubmitEditing={() => focusNextInput(firstNameRef)}
                            onFocus={() => handleScrollToInput(emailRef)} 
                        />
                    </View>
                    
                    {/* First Name */}
                    <View style={styles.inputGroup}>
                        <Icon name="bookmark-outline" size={22} color="#444" style={styles.inputIcon} />
                        <TextInput
                            ref={firstNameRef}
                            style={styles.input}
                            placeholder="First Name"
                            value={formData.firstname}
                            onChangeText={(text) => handleInputChange('firstname', text)}
                            returnKeyType="next"
                            onSubmitEditing={() => focusNextInput(lastNameRef)}
                            onFocus={() => handleScrollToInput(firstNameRef)} 
                        />
                    </View>
                    
                    {/* Last Name */}
                    <View style={styles.inputGroup}>
                        <Icon name="bookmark-outline" size={22} color="#444" style={styles.inputIcon} />
                        <TextInput
                            ref={lastNameRef}
                            style={styles.input}
                            placeholder="Last Name"
                            value={formData.lastname}
                            onChangeText={(text) => handleInputChange('lastname', text)}
                            returnKeyType="done"
                            onSubmitEditing={() => {
                                Keyboard.dismiss();
                                setShowDatePicker(true);
                            }}
                            onFocus={() => handleScrollToInput(lastNameRef)} 
                        />
                    </View>
                    
                    {/* Date of Birth - Touchable Input */}
                    <TouchableOpacity 
                        style={styles.inputGroup} 
                        onPress={() => {
                            Keyboard.dismiss();
                            handleScrollToInput(birthRef); 
                            setShowDatePicker(true);
                        }}
                        ref={birthRef}
                    >
                        <Icon name="calendar-outline" size={22} color="#444" style={styles.inputIcon} />
                        <Text style={[styles.input, styles.dateInputText, { color: formatDate(formData.birth) === 'DD/MM/YYYY' ? '#7f8c8d' : '#333' }]}>
                            {formatDate(formData.birth)}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* DatePicker Component */}
                {/* Full-Width, Bottom-Sheet iOS Picker Modal */}
                {showDatePicker && Platform.OS === 'ios' && (
                    <Modal
                        transparent={true} // Revert to transparent background to see main screen beneath
                        animationType="slide"
                        visible={showDatePicker}
                        onRequestClose={() => setShowDatePicker(false)}
                    >
                        {/* iOS Picker Overlay: Takes full screen height but justifies content to the end */}
                        <View style={styles.iosPickerOverlay}> 
                            
                            {/* The Picker Container itself: full width, fixed height */}
                            <View style={styles.iosPickerContent}>
                                <View style={styles.iosPickerHeader}>
                                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                        <Text style={styles.iosPickerButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.iosPickerTitle}>Select Date of Birth</Text>
                                    <TouchableOpacity onPress={confirmIOSDate}>
                                        <Text style={[styles.iosPickerButtonText, { fontWeight: 'bold', color: '#3498db' }]}>Done</Text>
                                    </TouchableOpacity>
                                </View>
                                
                                <DateTimePicker
                                    value={formData.birth}
                                    mode="date"
                                    display="spinner"
                                    onChange={onDateChange}
                                    maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 5))}
                                    style={styles.pickerIOS}
                                />
                            </View>
                        </View>
                    </Modal>
                )}

                {/* Android Picker (renders natively as a dialog) */}
                {showDatePicker && Platform.OS === 'android' && (
                    <DateTimePicker
                        value={formData.birth}
                        mode="date"
                        display="default" 
                        onChange={onDateChange}
                        maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 5))}
                    />
                )}

                {/* Promotional Emails Switch and Button (Unchanged) */}
                <View style={styles.switchContainer}>
                    <Text style={styles.switchText}>Receive promotional emails</Text>
                    <Icon name="information-circle-outline" size={18} color="#999" style={{marginRight: 8}} />
                    <Switch
                        trackColor={{ false: "#ccc", true: "#3498db" }}
                        thumbColor={"#fff"}
                        onValueChange={setReceiveEmails}
                        value={receiveEmails}
                    />
                </View>

                <TouchableOpacity 
                    style={[styles.signUpButton, loading && styles.signUpButtonDisabled]} 
                    onPress={handleRegister}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.signUpButtonText}>Sign Up</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>Already have an account?</Text>
                    <TouchableOpacity onPress={() => { /* Add navigation logic here */ }}>
                        <Text style={styles.loginLink}>Login</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f9fc', 
        paddingTop: 40,
    },
    scrollContent: {
        paddingHorizontal: 25,
        paddingBottom: 40,
        alignItems: 'center',
    },
    header: {
        width: '100%',
        alignItems: 'flex-start',
        marginBottom: 30,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#7f8c8d',
        marginTop: 5,
    },
    
    // --- Profile Picture Styles (Unchanged) ---
    profileSection: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 35,
    },
    profileImageWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#bdc3c7', 
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#3498db',
        borderRadius: 15,
        padding: 6,
        borderWidth: 2,
        borderColor: '#f7f9fc',
    },
    uploadButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
    },
    uploadButtonText: {
        color: '#3498db',
        fontWeight: '600',
        fontSize: 16,
    },

    // --- Form Styles (Unchanged) ---
    formContainer: {
        width: '100%',
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12, 
        marginBottom: 15,
        paddingHorizontal: 15,
        height: 55,
        borderWidth: 1,
        borderColor: '#e0e7ee', 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        paddingVertical: 10,
    },
    dateInputText: {
        // Handled dynamically
    },

    // --- FIXED HEIGHT / FULL WIDTH iOS Picker Styles ---
    iosPickerOverlay: {
        flex: 1,
        justifyContent: 'flex-end', // Aligns content to the bottom
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dim background
    },
    iosPickerContent: {
        width: '100%',
        backgroundColor: '#fff', // White background for the sheet
    },
    iosPickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        height: 50,
        backgroundColor: '#f7f7f7',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    iosPickerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    iosPickerButtonText: {
        color: '#3498db',
        fontSize: 16,
    },
    pickerIOS: {
        backgroundColor: '#fff',
        width: '100%', 
        height: 250, // Standard height for the date picker wheel
    },

    // --- General Styles (Unchanged) ---
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 15,
        marginBottom: 30,
        paddingHorizontal: 5,
    },
    switchText: {
        fontSize: 15,
        color: '#555',
    },

    signUpButton: {
        width: '100%',
        height: 55,
        backgroundColor: '#3498db',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#3498db',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 10,
    },
    signUpButtonDisabled: {
        backgroundColor: '#95a5a6',
        shadowOpacity: 0.1,
        elevation: 1,
    },
    signUpButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },

    loginContainer: {
        flexDirection: 'row',
        marginTop: 25,
    },
    loginText: {
        fontSize: 15,
        color: '#777',
        marginRight: 5,
    },
    loginLink: {
        fontSize: 15,
        color: '#3498db',
        fontWeight: '700',
    }
});

export default RegistrationScreen;