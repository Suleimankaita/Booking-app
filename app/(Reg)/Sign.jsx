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
    Platform,
    Modal,
    SafeAreaView,
    KeyboardAvoidingView
} from 'react-native';
import { useRegMutation, useAUTHMutation } from '@/components/api/Getslice';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker'; 
import DateTimePicker from '@react-native-community/datetimepicker'; 
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { settoken } from '@/components/Funcslice';
import { useDispatch } from 'react-redux';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegistrationScreen = () => {
    // API Hooks
    const [Registrations, { isSuccess: regSuccess, isLoading, isError, error }] = useRegMutation();
    const [Login, { isSuccess: logSuccess }] = useAUTHMutation();
    const dispatch = useDispatch();

    // Refs for inputs
    const usernameRef = useRef(null);
    const passwordRef = useRef(null);
    const emailRef = useRef(null);
    const firstNameRef = useRef(null);
    const lastNameRef = useRef(null);

    // State Initialization
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        firstname: '',
        lastname: '',
        password: '',
        // Initialize date safely inside state
        birth: new Date(new Date().setFullYear(new Date().getFullYear() - 20)), 
        profileImageUri: null,
    });

    const [loading, setLoading] = useState(false);
    const [receiveEmails, setReceiveEmails] = useState(true);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // --- Effects ---

    // Handle Registration Error
    useEffect(() => {
        if (isError) {
            const errorMsg = error?.data?.message || "An unexpected error occurred.";
            Alert.alert("Registration Error", errorMsg);
            setLoading(false);
        }
    }, [isError, error]);

    // Handle Login Success (Auto Login after Reg)
    useEffect(() => {
        if (logSuccess) {
            setLoading(false);
            router.replace('/');
        }
    }, [logSuccess]);

    // --- Handlers ---

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
        const [Birth, setBirth] = useState(new Date(new Date().setFullYear(new Date().getFullYear() - 20)));
    const focusNextInput = (ref) => {
        if (ref?.current) {
            ref.current.focus();
        } else {
            Keyboard.dismiss();
        }
    };

    const handleImagePick = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                return Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8, // Reduced quality slightly for faster upload
            });

            if (!result.canceled) {
                setFormData(prev => ({
                    ...prev,
                    profileImageUri: result.assets[0].uri
                }));
            }
        } catch (err) {
            Alert.alert("Error", "Failed to pick image.");
        }
    };

    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || formData.birth;
        console.log("Selected Date:", currentDate);
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
            
        }

        if (event.type === 'set' || Platform.OS === 'ios') {
            handleInputChange('birth', currentDate);
        }
        setBirth(currentDate);
    };

    const performLogin = async () => {
        try {
            const res = await Login({ 
                Username: formData.username, 
                password: formData.password 
            }).unwrap(); // Use .unwrap() to handle RTK Query errors correctly in try/catch
            
            await AsyncStorage.setItem('cokkie', JSON.stringify(res));
            dispatch(settoken(res));
        } catch (err) {
            setLoading(false);
            Alert.alert("Login Failed", err?.data?.message || err?.message || "Could not log in automatically.");
        }
    };

    const handleRegister = async () => {
        if (loading) return;

        // Basic Validation
        if (!formData.username || !formData.email || !formData.firstname || !formData.password) {
            Alert.alert("Missing Fields", "Please fill in all required fields.");
            return;
        }

        setLoading(true);
        Keyboard.dismiss();

        try {
            const form = new FormData();
            
            // Append Text Fields
            form.append('firstname', formData.firstname);
            form.append('lastname', formData.lastname);
            form.append('email', formData.email);
            form.append('Username', formData.username);
            form.append('password', formData.password);
            form.append('Birth', Birth.toISOString().split('T')[0]); // Format as YYYY-MM-DD
            form.append('receiveEmails', String(receiveEmails)); // Convert boolean to string for FormData

            // Append Image (CRITICAL FIX FOR ANDROID)
            if (formData.profileImageUri) {
                const uri = Platform.OS === 'android' 
                    ? formData.profileImageUri 
                    : formData.profileImageUri.replace('file://', '');
                
                const filename = uri.split('/').pop();
                
                // Infer type based on extension
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image/jpeg`;

                form.append('file', {
                    uri: uri,
                    name: filename,
                    type: type, // MUST be a valid MIME type (e.g., image/jpeg), not 'file.jpg'
                });
            }

            // Call API
            const regs = await Registrations({form}).unwrap(); // Use .unwrap() to catch errors here
            
            console.log("Registration Success:", regs);
            
            // If successful, attempt login
            await performLogin();

        } catch (error) {
            console.error("Registration Error:", error);
            setLoading(false);
            const msg = error?.data?.message || "Network request failed. Please check your internet connection.";
            Alert.alert("Registration Failed", msg);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* KeyboardAvoidingView handles the scrolling logic automatically and better than measureLayout */}
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContent} 
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Create Account</Text>
                        <Text style={styles.headerSubtitle}>Complete your profile details below</Text>
                    </View>
                    
                    {/* Profile Picture */}
                    <View style={styles.profileSection}>
                        <View style={styles.profileImageWrapper}>
                            {formData.profileImageUri ? (
                                <Image source={{ uri: formData.profileImageUri }} style={styles.profileImage} />
                            ) : (
                                <Icon name="person-outline" size={40} color="#fff" />
                            )}
                            <TouchableOpacity style={styles.cameraIcon} onPress={handleImagePick}>
                                <Icon name="camera" size={18} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.uploadButton} onPress={handleImagePick}>
                            <Text style={styles.uploadButtonText}>
                                {formData.profileImageUri ? 'Change Photo' : 'Add Profile Photo'}
                            </Text>
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
                                placeholderTextColor={'#333'}
                                onChangeText={(text) => handleInputChange('username', text)}
                                autoCapitalize="none"
                                returnKeyType="next"
                                onSubmitEditing={() => focusNextInput(passwordRef)}
                            />
                        </View>
                        
                        {/* Password */}
                        <View style={styles.inputGroup}>
                            <MaterialCommunityIcons name="lock" size={22} color="#444" style={styles.inputIcon} />
                            <TextInput
                                ref={passwordRef}
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor={'#333'}
                                value={formData.password}
                                onChangeText={(text) => handleInputChange('password', text)}
                                autoCapitalize="none"
                                secureTextEntry
                                returnKeyType="next"
                                onSubmitEditing={() => focusNextInput(emailRef)}
                            />
                        </View>
                        
                        {/* Email */}
                        <View style={styles.inputGroup}>
                            <Icon name="mail-outline" size={22} color="#444" style={styles.inputIcon} />
                            <TextInput
                                ref={emailRef}
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor={'#333'}
                                value={formData.email}
                                onChangeText={(text) => handleInputChange('email', text)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                returnKeyType="next"
                                onSubmitEditing={() => focusNextInput(firstNameRef)}
                            />
                        </View>
                        
                        {/* First Name */}
                        <View style={styles.inputGroup}>
                            <Icon name="bookmark-outline" size={22} color="#444" style={styles.inputIcon} />
                            <TextInput
                                ref={firstNameRef}
                                style={styles.input}
                                placeholder="First Name"
                                placeholderTextColor={'#333'}
                                value={formData.firstname}
                                onChangeText={(text) => handleInputChange('firstname', text)}
                                returnKeyType="next"
                                onSubmitEditing={() => focusNextInput(lastNameRef)}
                            />
                        </View>
                        
                        {/* Last Name */}
                        <View style={styles.inputGroup}>
                            <Icon name="bookmark-outline" size={22} color="#444" style={styles.inputIcon} />
                            <TextInput
                                ref={lastNameRef}
                                style={styles.input}
                                placeholder="Last Name"
                                placeholderTextColor={'#333'}

                                value={formData.lastname}
                                onChangeText={(text) => handleInputChange('lastname', text)}
                                returnKeyType="done"
                                onSubmitEditing={() => {
                                    Keyboard.dismiss();
                                    setShowDatePicker(true);
                                }}
                            />
                        </View>
                        
                        {/* Date of Birth Trigger */}
                        <TouchableOpacity 
                            style={styles.inputGroup} 
                            onPress={() => {
                                Keyboard.dismiss();
                                setShowDatePicker(true);
                            }}
                        >
                            <Icon name="calendar-outline" size={22} color="#444" style={styles.inputIcon} />
                            <Text style={[styles.input, { paddingVertical: 14, color: '#333' }]}>
                                {formatDate(formData.birth)}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* iOS Date Picker Modal */}
                    {showDatePicker && Platform.OS === 'ios' && (
                        <Modal
                            transparent={true}
                            animationType="fade"
                            visible={showDatePicker}
                            onRequestClose={() => setShowDatePicker(false)}
                        >
                            <View style={styles.iosPickerOverlay}> 
                                <View style={styles.iosPickerContent}>
                                    <View style={styles.iosPickerHeader}>
                                        <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                            <Text style={styles.iosPickerButtonText}>Cancel</Text>
                                        </TouchableOpacity>
                                        <Text style={styles.iosPickerTitle}>Date of Birth</Text>
                                        <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                            <Text style={[styles.iosPickerButtonText, { fontWeight: 'bold' }]}>Done</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <DateTimePicker
                                        value={formData.birth}
                                        mode="date"
                                        display="spinner"
                                        onChange={onDateChange}
                                        maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 5))}
                                        style={styles.pickerIOS}
                                        textColor="black"
                                    />
                                </View>
                            </View>
                        </Modal>
                    )}

                    {/* Android Date Picker */}
                    {showDatePicker && Platform.OS === 'android' && (
                        <DateTimePicker
                            value={formData.birth}
                            mode="date"
                            display="default" 
                            onChange={onDateChange}
                            maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 5))}
                        />
                    )}

                    {/* Newsletter Switch */}
                    <View style={styles.switchContainer}>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Icon name="information-circle-outline" size={18} color="#999" style={{marginRight: 8}} />
                            <Text style={styles.switchText}>Receive promotional emails</Text>
                        </View>
                        <Switch
                            trackColor={{ false: "#ccc", true: "#3498db" }}
                            thumbColor={"#fff"}
                            onValueChange={setReceiveEmails}
                            value={receiveEmails}
                        />
                    </View>

                    {/* Submit Button */}
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

                    {/* Login Link */}
                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>Already have an account?</Text>
                        <TouchableOpacity onPress={() => router.push('./Login')}>
                            <Text style={styles.loginLink}>Login</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f9fc', 
        paddingTop: Platform.OS === 'android' ? 40 : 0,
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
        marginTop: 20,
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
        overflow: 'hidden',
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 5,
        right: 5,
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
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        height: '100%',
    },
    iosPickerOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    iosPickerContent: {
        width: '100%',
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    iosPickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        height: 50,
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
        height: 220,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
        marginBottom: 30,
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
        marginBottom: 20,
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