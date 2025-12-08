import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
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
import { 
    useGetCategoriesQuery, 
    useRemoveCategoriesMutation, 
    useGetUsersQuery, 
    useAdd_categoriesMutation,
    useUpdateProfileMutation 
} from '@/components/api/Getslice';
import { uri } from '@/components/api/uri';

// --- STYLING CONSTANTS ---
const PRIMARY_COLOR = '#4A90E2';
const BACKGROUND_COLOR = '#F4F7F9';
const CARD_BACKGROUND = '#FFFFFF';
const TEXT_COLOR = '#333333';
const SUBTITLE_COLOR = '#757575';
const BORDER_COLOR = '#EEEEEE';
const DANGER_COLOR = '#D32F2F';

// --- INITIAL USER DATA ---
const INITIAL_USER_DATA = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    username: '@jdoe',
    avatarUrl: 'https://i.pravatar.cc/100?img=3',
};

// --- REUSABLE SHADOW STYLE ---
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

// --- REUSABLE COMPONENTS ---
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

// --- MAIN COMPONENT: UserSettingsScreen ---

const UserSettingsScreen = () => {
    // API Queries
    const { data: CateData } = useGetCategoriesQuery('', {
        pollingInterval: 1000,
        refetchOnFocus: true
    });
    const { data: UserData } = useGetUsersQuery('', {
        pollingInterval: 1000,
        refetchOnFocus: true
    });

    // Mutations
    const [AddCate] = useAdd_categoriesMutation();
    const [delecate] = useRemoveCategoriesMutation();
    const [Edit] = useUpdateProfileMutation();

    // State
    const [user, setUser] = useState(INITIAL_USER_DATA);
    const [categories, setCategories] = useState([]);
    
    // Independent fields for logic
    const [email, setemail] = useState('');
    const [username, setusername] = useState('');
    const [password, setpassword] = useState('');
    const [img, setimg] = useState('');
    
    // Modal State
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalField, setModalField] = useState(null);
    const [tempValue, setTempValue] = useState('');
    const [newCategoryText, setNewCategoryText] = useState('');

    const id = "6928356f57a6192347d3ee00"; // Hardcoded ID as provided

    // --- EFFECT: SYNC CATEGORIES ---
    useEffect(() => {
        if (!CateData) return;
        setCategories(CateData);
    }, [CateData]);

    // --- EFFECT: SYNC USER DATA ---
    useEffect(() => {
        if (!UserData) return;
        const find = UserData.find(res => res?._id === id);
        
        if (find) {
            // Update independent state variables
            setemail(find?.email);
            setpassword(find?.password);
            setusername(find?.Username);
            setimg(find?.NameId?.img);

            // Update the main User object so the UI updates
            setUser(prev => ({
                ...prev,
                name: find?.Username || prev.name,
                email: find?.email || prev.email,
                // If the API provided an image, we would map it here too
            }));
        }
    }, [UserData]);

    // --- FUNCTIONALITY ---

    const handleLogout = () => {
        Alert.alert("Confirm Logout", "Are you sure you want to log out?", [
            { text: "Cancel", style: "cancel" },
            { text: "Log Out", style: "destructive", onPress: () => console.log('Logged out') },
        ]);
    };

    const handleDeleteAccount = () => {
        Alert.alert("Delete Account", "Are you sure? This cannot be undone.", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete Forever", style: "destructive", onPress: () => console.log('Account deleted') },
        ]);
    };

    const openEditModal = (field) => {
        setModalField(field);
        if (field === 'name') setTempValue(user.name);
        else if (field === 'email') setTempValue(user.email);
        else if (field === 'password') setTempValue(''); // Don't show current password
        setIsModalVisible(true);
    };

    const saveEdit = async() => {
        const form =new FormData()
        if (modalField === 'name') {
            const newName = tempValue.trim();
            if (newName) {
                console.log("name, ",newName)
                setUser(prev => ({ ...prev, name: newName }));
                setusername(newName); // Keep state synced
                // TODO: Add API call to update name here
            }
        } else if (modalField === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(tempValue)) {
                Alert.alert("Invalid Email");
                return;
            }
            
            const newEmail = tempValue.trim();
            form.append('Username',username) 
            form.append('email',newEmail) 
            await Edit({form})

            console.log("email ",newEmail)

            setUser(prev => ({ ...prev, email: newEmail }));
            setemail(newEmail); // Keep state synced
            // TODO: Add API call to update email here

        } else if (modalField === 'password') {
            if (tempValue.length < 6) {
                Alert.alert("Password too short");
                return;
            }
            setpassword(tempValue); // Update password state
            console.log(tempValue)
            form.append('Username',username) 
            form.append('password',tempValue)
            await Edit({form})
            Alert.alert("Success", "Password changed locally.");
            // TODO: Add API call to update password here
        }
        setIsModalVisible(false);
        setTempValue('');
        setModalField(null);
    };

    const pickImage = async () => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') return Alert.alert('Permission needed');
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, aspect: [1, 1], quality: 1,
        });
        if (!result.canceled) {
            setUser(prev => ({ ...prev, avatarUrl: result.assets[0].uri }));
            const imgs=result.assets[0].uri.split('.').at(-1)
            const form=new FormData()
            form.append('Username',username)

            form.append('file',{
                uri:result.assets[0].uri ,
                name:"file."+img,
                typ:"file."+img,
            })
            await Edit({form})

        }
    };

    // --- CATEGORY FUNCTIONALITY ---
    const handleAddCategory = async () => {
        if (newCategoryText.trim().length === 0) {
            Alert.alert("Couldn't add", "Please enter a category name.");
            return;
        }
        try {
            await AddCate({ name: newCategoryText }).unwrap();
            setNewCategoryText(''); // Clear input
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteCategory = async (indexToDelete) => {
        try {
            Alert.alert(
                "Delete Category",
                "Are you sure you want to remove this category?",
                [
                    { text: "Cancel", style: "cancel" },
                    { 
                        text: "Delete", 
                        style: "destructive", 
                        onPress: async () => {
                            await delecate({ id: indexToDelete }).unwrap();
                        }
                    }
                ]
            );
        } catch (err) {
            alert(err.message);
        }
    };

    const renderEditModal = () => {
        let title = '', inputType = 'default', placeholder = '', isPassword = false;
        if (modalField === 'name') { title = 'Edit Name'; placeholder = 'Full Name'; }
        else if (modalField === 'email') { title = 'Edit Email'; inputType = 'email-address'; placeholder = 'New Email'; }
        else if (modalField === 'password') { title = 'Change Password'; placeholder = 'New Password'; isPassword = true; }

        return (
            <Modal animationType="fade" transparent={true} visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={modalStyles.centeredView}>
                    <View style={modalStyles.modalView}>
                        <Text style={modalStyles.modalTitle}>{title}</Text>
                        <TextInput
                            style={modalStyles.modalTextInput}
                            onChangeText={setTempValue}
                            value={tempValue}
                            keyboardType={inputType}
                            placeholder={placeholder}
                            placeholderTextColor={SUBTITLE_COLOR}
                            secureTextEntry={isPassword}
                            autoFocus={true}
                        />
                        <View style={modalStyles.modalButtonRow}>
                            <TouchableOpacity style={[modalStyles.modalButton, modalStyles.buttonCancel]} onPress={() => setIsModalVisible(false)}>
                                <Text style={[modalStyles.buttonText, { color: SUBTITLE_COLOR }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[modalStyles.modalButton, modalStyles.buttonSave]} onPress={saveEdit}>
                                <Text style={[modalStyles.buttonText, { color: CARD_BACKGROUND }]}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        );
    };

    // --- SCREEN RENDER ---
    return (
        <SafeAreaView style={profileStyles.container}>
            {renderEditModal()}
            <ScrollView contentContainerStyle={profileStyles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={profileStyles.header}>
                </View>

                {/* Profile Avatar & Name */}
                <View style={profileStyles.profileCard}>
                    <TouchableOpacity onPress={pickImage}>
                        <Image source={{ uri: `${uri}/img/${img}` }} style={profileStyles.avatar} />
                        <View style={profileStyles.cameraBadge}>
                            <Ionicons name="camera" size={18} color={CARD_BACKGROUND} />
                        </View>
                    </TouchableOpacity>
                    <Text style={profileStyles.changePictureText}>Change Profile Picture</Text>
                </View>

                {/* Admin Name Section */}
                <View style={profileStyles.sectionContainer}>
                    <Text style={profileStyles.sectionTitle}>Admin Name</Text>
                    <TouchableOpacity style={profileStyles.staticInputLikeCard} onPress={() => openEditModal('name')}>
                        <Text style={profileStyles.staticInputText}>{user.name}</Text>
                    </TouchableOpacity>
                </View>

                {/* Manage Categories Section */}
                <View style={profileStyles.sectionContainer}>
                    <Text style={profileStyles.sectionTitle}>Manage Categories</Text>
                    <View style={profileStyles.card}>
                        {/* List existing categories */}
                        <View style={profileStyles.categoryListContainer}>
                            {categories.map((category) => (
                                <View key={category?._id || Math.random()} style={profileStyles.categoryItem}>
                                    <Text style={profileStyles.categoryText}>{category?.name}</Text>
                                    <TouchableOpacity onPress={() => handleDeleteCategory(category?._id)} style={profileStyles.deleteCategoryButton}>
                                        <Ionicons name="trash-outline" size={20} color={DANGER_COLOR} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                        
                        {/* Add new category */}
                        <View style={profileStyles.addCategoryContainer}>
                            <TextInput 
                                style={profileStyles.addCategoryInput}
                                placeholder="Add new category"
                                placeholderTextColor={SUBTITLE_COLOR}
                                value={newCategoryText}
                                onChangeText={setNewCategoryText}
                            />
                            <TouchableOpacity style={profileStyles.addCategoryButton} onPress={handleAddCategory}>
                                <Ionicons name="add" size={24} color={PRIMARY_COLOR} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Security Info */}
                <View style={profileStyles.sectionContainer}>
                    <Text style={profileStyles.sectionTitle}>Security Info</Text>
                    <View style={profileStyles.card}>
                        <SettingsItem 
                            iconName="mail-outline" 
                            label="Email" 
                            value={user.email} 
                            onPress={() => openEditModal('email')} 
                            isEditable={true} 
                        />
                        <View style={profileStyles.separator} />
                        <SettingsItem 
                            iconName="lock-closed-outline" 
                            label="Password" 
                            value={password ? "••••••••" : "Not Set"} // Mask the password
                            onPress={() => openEditModal('password')} 
                            isEditable={true} 
                        />
                    </View>
                </View>

                {/* Actions Section */}
                <View style={profileStyles.sectionContainer}>
                    <Text style={profileStyles.sectionTitle}>Actions</Text>
                    <SettingsButton label="Log Out" color={DANGER_COLOR} iconName="log-out-outline" onPress={handleLogout} />
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

// --- STYLES ---
const modalStyles = StyleSheet.create({
    centeredView: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: 'rgba(0, 0, 0, 0.6)' },
    modalView: { width: '85%', margin: 20, backgroundColor: CARD_BACKGROUND, borderRadius: 12, padding: 30, alignItems: "center", ...softShadow },
    modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20, color: TEXT_COLOR },
    modalTextInput: { width: '100%', height: 50, backgroundColor: BACKGROUND_COLOR, borderRadius: 8, paddingHorizontal: 15, marginBottom: 20, fontSize: 16, color: TEXT_COLOR },
    modalButtonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
    modalButton: { borderRadius: 8, padding: 12, flex: 1, marginHorizontal: 5, alignItems: 'center' },
    buttonCancel: { backgroundColor: BACKGROUND_COLOR },
    buttonSave: { backgroundColor: PRIMARY_COLOR },
    buttonText: { fontSize: 16, fontWeight: '700' },
});

const profileStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BACKGROUND_COLOR },
    scrollContent: { paddingBottom: 40, paddingHorizontal: 20 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20, marginBottom: 10 },
    headerTitle: { fontSize: 22, fontWeight: '700', color: TEXT_COLOR },
    profileCard: { alignItems: 'center', marginBottom: 30 },
    avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#ddd', marginBottom: 10 },
    cameraBadge: { position: 'absolute', bottom: 30, right: '36%', backgroundColor: PRIMARY_COLOR, borderRadius: 15, padding: 6, borderWidth: 3, borderColor: BACKGROUND_COLOR },
    changePictureText: { color: PRIMARY_COLOR, fontWeight: '600', marginTop: 5},
    sectionContainer: { marginBottom: 25 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: TEXT_COLOR, marginBottom: 12, marginLeft: 4 },
    card: { backgroundColor: CARD_BACKGROUND, borderRadius: 12, ...softShadow, overflow: 'hidden' },
    itemContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 15 },
    itemIcon: { marginRight: 15 },
    itemTextContainer: { flex: 1 },
    itemLabel: { fontSize: 14, color: SUBTITLE_COLOR },
    itemValue: { fontSize: 16, fontWeight: '600', color: TEXT_COLOR, marginTop: 2 },
    separator: { height: StyleSheet.hairlineWidth, backgroundColor: BORDER_COLOR, marginLeft: 15, marginRight: 15 },
    actionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 20, borderRadius: 12, marginTop: 10, ...softShadow },
    actionButtonIcon: { marginRight: 15 },
    actionButtonText: { fontSize: 16, fontWeight: '700' },
    staticInputLikeCard: { backgroundColor: CARD_BACKGROUND, borderRadius: 8, padding: 15, borderWidth: 1, borderColor: BORDER_COLOR },
    staticInputText: { fontSize: 16, color: TEXT_COLOR },
    categoryListContainer: { padding: 5 },
    categoryItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 15, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: BORDER_COLOR },
    categoryText: { fontSize: 16, color: TEXT_COLOR },
    deleteCategoryButton: { padding: 5 },
    addCategoryContainer: { flexDirection: 'row', alignItems: 'center', padding: 10 },
    addCategoryInput: { flex: 1, height: 45, backgroundColor: BACKGROUND_COLOR, borderRadius: 8, paddingHorizontal: 15, fontSize: 16, color: TEXT_COLOR, marginRight: 10 },
    addCategoryButton: { width: 45, height: 45, borderRadius: 8, backgroundColor: PRIMARY_COLOR + '20', justifyContent: 'center', alignItems: 'center' },
});

export default UserSettingsScreen;