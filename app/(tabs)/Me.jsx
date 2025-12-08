import { getuserfound,clearAuth } from '@/components/Funcslice';
import { useGetUsersQuery } from '@/components/api/Getslice';
import { uri } from '@/components/api/uri';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useUpdateProfileMutation} from '@/components/api/Getslice';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Useauth from '../hooks/Useauth';
import { useDispatch, useSelector } from 'react-redux';
const PRIMARY_COLOR = '#4A90E2'; 
const BACKGROUND_COLOR = '#F4F7F9'; 
const CARD_BACKGROUND = '#FFFFFF';
const TEXT_COLOR = '#333333';
const SUBTITLE_COLOR = '#757575';
const BORDER_COLOR = '#EEEEEE';




const softShadow = Platform.select({
    ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 5,
    },
    android: {
        elevation: 3,
    },
});


const SettingsItem = ({ iconName, label, value, onPress, isEditable = false }) => (
    <TouchableOpacity 
        style={profileStyles.itemContainer} 
        onPress={onPress}
        disabled={!onPress}
    >
        <Ionicons 
            name={iconName} 
            size={24} 
            color={PRIMARY_COLOR} 
            style={profileStyles.itemIcon} 
        />
        <View style={profileStyles.itemTextContainer}>
            <Text style={profileStyles.itemLabel}>{label}</Text>
            <Text style={profileStyles.itemValue} numberOfLines={1}>{value}</Text>
        </View>
        {isEditable && (
            <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={SUBTITLE_COLOR} 
            />
        )}
    </TouchableOpacity>
);

const SettingsButton = ({ label, color, iconName, onPress }) => (
    <TouchableOpacity 
        style={[profileStyles.actionButton, { backgroundColor: color + '10' }]}
        onPress={onPress}
    >
        <Ionicons 
            name={iconName} 
            size={20} 
            color={color} 
            style={profileStyles.actionButtonIcon} 
        />
        <Text style={[profileStyles.actionButtonText, { color }]}>{label}</Text>
    </TouchableOpacity>
);



const UserSettingsScreen = () => {
    // const {clearAuth}=Useauth()
    const found=useSelector(getuserfound)
    const [Edit,{isLoading}]=useUpdateProfileMutation()
    const {data}=useGetUsersQuery('',{
        pollingInterval:1000,
        refetchOnFocus:true,
        refetchOnReconnect:true
    })
    const [user, setUser] = useState({});
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalField, setModalField] = useState(null); 
    const [tempValue, setTempValue] = useState('');
    const dispatch=useDispatch()
    
    useEffect(()=>{
        if(!data)return;
        const find=data.find(res=>res?._id===found?.id)
        if(find){
            console.log(find)
            setUser(find)
        }
    },[data])
    
    const handleLogout = () => {
        Alert.alert(
            "Confirm Logout",
            "Are you sure you want to log out of your account?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Log Out", style: "destructive", onPress: () => {
                    console.log('User logged out');
                    dispatch(clearAuth())
                }},
            ]
        );
    };
    
    const openEditModal = (field) => {
        setModalField(field);
        if (field === 'name') setTempValue(user.NameId?.firstname);
        else if (field === 'email') setTempValue(user.NameId?.email);
        else if (field === 'password') setTempValue('');
        
        setIsModalVisible(true);
    };
    
    const saveEdit = async() => {
        
        try{const form =new FormData()
        if (modalField === 'name') {
        } else if (modalField === 'email') {
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(tempValue)) {
                Alert.alert("Invalid Email", "Please enter a valid email address.");
                return;
            }
            form.append("Username",user?.Username)
            form.append('email',tempValue)
            await Edit({form}).unwrap()
        } else if (modalField === 'password') {
            if (tempValue.length < 6) {
                form.append("Username",user?.Username)
                form.append("password",tempValue.trim())
                await Edit({form}).unwrap()
                Alert.alert("Password Too Short", "Password must be at least 6 characters.");
                return;
            }
            Alert.alert("Success", "Password change request sent.");
        }
        
        setIsModalVisible(false);
        setTempValue('');
        setModalField(null);
    }catch(err){
        alert(err.message)
    }
}
;

    const pickImage = async () => {
        try{

            if (Platform.OS !== 'web') {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work.');
                return;
            }
        }
        
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });
        
        if (!result.canceled) {
            const img=result?.assets[0].uri.split('.').at(-1);
            const form=new FormData()
            form.append("Username",user?.Username)
            form.append('file',{
                uri:result?.assets[0].uri,
                type:'file.'+img,
                name:'file.'+img,
            })
            await Edit({form}).unwrap()

            console.log("New avatar URI:", result.assets[0].uri);
        }
    }catch(err){
        alert(err?.message)
    }
}


    const renderEditModal = () => {
        let title = '';
        let inputType = 'default';
        let placeholder = '';
        
        if (modalField === 'name') {
            title = 'Edit Full Name';
            placeholder = 'Enter your full name';
        } else if (modalField === 'email') {
            title = 'Edit Email Address';
            inputType = 'email-address';
            placeholder = 'Enter your new email';
        } else if (modalField === 'password') {
            title = 'Change Password';
            inputType = 'default';
            placeholder = 'Enter new password (min 6 chars)';
        }

        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <KeyboardAvoidingView 
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={modalStyles.centeredView}
                >
                    <View style={modalStyles.modalView}>
                        <Text style={modalStyles.modalTitle}>{title}</Text>
                        
                        <TextInput
                            style={modalStyles.modalTextInput}
                            onChangeText={setTempValue}
                            value={tempValue}
                            keyboardType={inputType}
                            placeholder={placeholder}
                            placeholderTextColor={SUBTITLE_COLOR}
                            autoCapitalize={modalField === 'email' ? 'none' : 'words'}
                            secureTextEntry={modalField === 'password'}
                            autoFocus={true}
                        />
                        
                        <View style={modalStyles.modalButtonRow}>
                            <TouchableOpacity
                                style={[modalStyles.modalButton, modalStyles.buttonCancel]}
                                onPress={() => setIsModalVisible(false)}
                            >
                                <Text style={[modalStyles.buttonText, { color: SUBTITLE_COLOR }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[modalStyles.modalButton, modalStyles.buttonSave]}
                                onPress={saveEdit}
                            >
                                <Text style={[modalStyles.buttonText, { color: CARD_BACKGROUND }]}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        );
    };

    return (
        <SafeAreaView style={profileStyles.container}>
            {renderEditModal()}
            <ScrollView contentContainerStyle={profileStyles.scrollContent}>

                <View style={profileStyles.header}>
                    {/* <Text style={profileStyles.headerTitle}>Profile Settings</Text> */}
                </View> 

                <View style={profileStyles.profileCard}>
                    <TouchableOpacity onPress={pickImage}>
                        <Image resizeMode='cover' source={{uri:`${uri}/img/${user?.NameId?.img}`}} style={profileStyles.avatar} />
                        <View style={profileStyles.cameraBadge}>
                             <Ionicons name="camera" size={18} color={CARD_BACKGROUND} />
                        </View>
                    </TouchableOpacity>
                    <Text style={profileStyles.userName}>{user.Username}</Text>
                    <Text style={profileStyles.userHandle}>{user?.NameId?.firstname}</Text>
                </View>

                <View style={profileStyles.sectionContainer}>
                    <Text style={profileStyles.sectionTitle}>Account Details</Text>
                    
                    <View style={profileStyles.card}>
                        <SettingsItem 
                            iconName="mail-outline"
                            label="Email Address"
                            value={user.NameId?.email}
                            onPress={() => openEditModal('email')}
                            isEditable={true}
                        />
                        <View style={profileStyles.separator} />
                        {/* <SettingsItem 
                            iconName="person-outline"
                            label="Full Name"
                            value={user.name}
                            onPress={() => openEditModal('name')}
                            isEditable={true}
                        /> */}
                        <View style={profileStyles.separator} />
                        <SettingsItem 
                            iconName="lock-closed-outline"
                            label="Password"
                            value="••••••••"
                            onPress={() => openEditModal('password')}
                            isEditable={true}
                        />
                    </View>
                </View>

                <View style={profileStyles.sectionContainer}>
                    <Text style={profileStyles.sectionTitle}>Actions</Text>
                    
                    <SettingsButton 
                        label="Log Out"
                        color="#D32F2F"
                        iconName="log-out-outline"
                        onPress={handleLogout}
                    />
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};


// --- STYLES ---

// 🆕 Define modal specific styles
const modalStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalView: {
        width: '85%',
        margin: 20,
        backgroundColor: CARD_BACKGROUND,
        borderRadius: 12,
        padding: 30,
        alignItems: "center",
        ...softShadow,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 20,
        color: TEXT_COLOR,
    },
    modalTextInput: {
        width: '100%',
        height: 50,
        backgroundColor: BACKGROUND_COLOR,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 20,
        fontSize: 16,
        color: TEXT_COLOR,
    },
    modalButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        borderRadius: 8,
        padding: 12,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    buttonCancel: {
        backgroundColor: BACKGROUND_COLOR,
    },
    buttonSave: {
        backgroundColor: PRIMARY_COLOR,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '700',
    },
});

// Reuse softShadow from previous block
const profileStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BACKGROUND_COLOR, },
    scrollContent: { paddingBottom: 40, paddingHorizontal: 20, },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, marginBottom: 10, },
    headerTitle: { fontSize: 22, fontWeight: '700', color: TEXT_COLOR, },
    profileCard: { alignItems: 'center', paddingVertical: 20, marginBottom: 20, },
    avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: CARD_BACKGROUND, marginBottom: 10, },
    cameraBadge: { position: 'absolute', bottom: 10, right: 0, backgroundColor: PRIMARY_COLOR, borderRadius: 15, padding: 4, borderWidth: 2, borderColor: CARD_BACKGROUND, },
    userName: { fontSize: 24, fontWeight: '800', color: TEXT_COLOR, marginTop: 5, },
    userHandle: { fontSize: 14, color: SUBTITLE_COLOR, fontWeight: '600', },
    sectionContainer: { marginBottom: 30, },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: SUBTITLE_COLOR, marginBottom: 12, paddingHorizontal: 10, },
    card: { backgroundColor: CARD_BACKGROUND, borderRadius: 12, ...softShadow, overflow: 'hidden', },
    itemContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 15, },
    itemIcon: { marginRight: 15, },
    itemTextContainer: { flex: 1, },
    itemLabel: { fontSize: 14, color: SUBTITLE_COLOR, },
    itemValue: { fontSize: 16, fontWeight: '600', color: TEXT_COLOR, marginTop: 2, },
    separator: { height: StyleSheet.hairlineWidth, backgroundColor: BORDER_COLOR, marginLeft: 54, },
    actionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 20, borderRadius: 12, marginTop: 10, ...softShadow, },
    actionButtonIcon: { marginRight: 15, },
    actionButtonText: { fontSize: 16, fontWeight: '700', },
});

export default UserSettingsScreen;