import { useGetUsersQuery, useGetBooksQuery,useUpdateProfileMutation } from '@/components/api/Getslice';
import { uri } from '@/components/api/uri';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal, // Import Modal
  TextInput, // Import TextInput for forms
  Alert, // Import Alert for mock submission feedback
} from 'react-native';
import * as ImagePicker from 'expo-image-picker'; // Import ImagePicker
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;
const CARD_WIDTH = screenWidth - 40;

// --- Modal Components ---

// 1. Edit Profile Form
const EditProfileForm = ({ user, onClose }) => {
  const [Add]=useUpdateProfileMutation()
  const [firstName, setFirstName] = useState(user?.NameId?.firstname || '');
  const [lastName, setLastName] = useState(user?.NameId?.lastname || '');
  const [email, setEmail] = useState(user?.NameId?.email || '');
  // State to hold the locally selected image URI
  const [selectedImageUri, setSelectedImageUri] = useState(
    user?.NameId?.img ? `${uri}/img/${user?.NameId?.img}` : null
  );

  

  const pickImage = async () => {
    // Request permission if not already granted (handled automatically on newer Expo SDKs)
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission denied', 'Permission to access camera roll is required!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      // The URI of the selected image is in the first asset
      setSelectedImageUri(result.assets[0].uri);
      console.log('Selected Image URI:', result.assets[0].uri);
      // NOTE: In a real app, you would prepare this URI for upload.
    }
  };

  const handleSubmit = async({Username}) => {
    // In a real application, you would call a mutation hook here.
    // This submission would handle uploading the 'selectedImageUri' if it changed,
    // and sending the updated profile fields (firstName, lastName, email).
    try{

      const form=new FormData()
      if(selectedImageUri){

        const img=selectedImageUri.split('.').at(-1)
        form.append('file',{
          uri:selectedImageUri,
          name:"file."+img,
          type:"file"+img
        })
      }

    form.append('Username',user?.Username)
    form.append('firstName',firstName)
    form.append('lastName',lastName)
    
    await Add({form})
    console.log('Submitting Profile Edits:', { firstName, lastName, email, newProfileImage: selectedImageUri });
    
    Alert.alert('Success', 'Profile updated successfully!', [{ text: 'OK', onPress: onClose }]);
  }catch(err){
    alert(err.message)
  }
  };

  return (
    <View style={modalStyles.formContainer}>
      <Text style={modalStyles.formHeader}>Edit Profile</Text>

      {/* Image Picker Section */}
      <View style={modalStyles.imagePickerContainer}>
        <TouchableOpacity onPress={pickImage}>
          {selectedImageUri ? (
            <Image
              source={{ uri: selectedImageUri }}
              style={modalStyles.profileImagePreview}
            />
          ) : (
            <View style={[modalStyles.profileImagePreview, { backgroundColor: '#e0e0e0' }]}>
              <Text style={modalStyles.placeholderText}>Tap to Select Image</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={modalStyles.changeImageButton} onPress={pickImage}>
          <Text style={modalStyles.changeImageButtonText}>Change Picture</Text>
        </TouchableOpacity>
      </View>
      {/* End Image Picker Section */}

      <Text style={modalStyles.label}>First Name</Text>
      <TextInput
        style={modalStyles.input}
        value={firstName}
        onChangeText={setFirstName}
        placeholder="First Name"
      />
      <Text style={modalStyles.label}>Last Name</Text>
      <TextInput
        style={modalStyles.input}
        value={lastName}
        onChangeText={setLastName}
        placeholder="Last Name"
      />
      <Text style={modalStyles.label}>Email</Text>
      <TextInput
        style={modalStyles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
      />
      <TouchableOpacity style={modalStyles.submitButton} onPress={handleSubmit}>
        <Text style={modalStyles.submitButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
};

// 2. Reset Password Form
const ResetPasswordForm = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New password and confirmation do not match.');
      return;
    }
    
    form.append('Username',user?.Username)
    form.append('password',currentPassword)
    // In a real application, you would call a mutation hook here (e.g., useResetPasswordMutation)
    console.log('Submitting Password Reset');
    Alert.alert('Success', 'Password reset successful!', [{ text: 'OK', onPress: onClose }]);
    // Add logic to reset the password in the backend/store
  };

  return (
    <View style={modalStyles.formContainer}>
      <Text style={modalStyles.formHeader}>Reset Password</Text>
      <Text style={modalStyles.label}>Current Password</Text>
      <TextInput
        style={modalStyles.input}
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder="Current Password"
        secureTextEntry
      />
      <Text style={modalStyles.label}>New Password</Text>
      <TextInput
        style={modalStyles.input}
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="New Password"
        secureTextEntry
      />
      <Text style={modalStyles.label}>Confirm New Password</Text>
      <TextInput
        style={modalStyles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm New Password"
        secureTextEntry
      />
      <TouchableOpacity style={modalStyles.submitButton} onPress={handleSubmit}>
        <Text style={modalStyles.submitButtonText}>Change Password</Text>
      </TouchableOpacity>
    </View>
  );
};

// 3. Main Modal Wrapper
const EditProfileModal = ({ isVisible, onClose, type, user }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={modalStyles.centeredView}>
        <View style={modalStyles.modalView}>
          {type === 'editProfile' && <EditProfileForm user={user} onClose={onClose} />}
          {type === 'resetPassword' && <ResetPasswordForm onClose={onClose} />}
          
          <TouchableOpacity 
            style={modalStyles.closeButton} 
            onPress={onClose}
          >
            <Text style={modalStyles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// --- Original Helper Components (unmodified) ---

// Card for metrics
const MetricCard = ({ title, value }) => (
  <View style={styles.activityMetricCard}>
    <Text style={styles.activityMetricTitle}>{title || ""}</Text>
    <Text style={styles.activityMetricValue}>{value || ""}</Text>
  </View>
);

// Recently viewed item
const ViewedBookItem = ({ item }) => (
  <View style={styles.viewedItem}>
    <Image
      source={item?.CoverImg ? { uri: `${uri}/img/${item?.CoverImg}` } : undefined}
      style={[styles.viewedColorBlock]}
    />
    <View style={styles.viewedDetails}>
      <Text style={styles.viewedTitle} numberOfLines={1}>{item?.BookName}</Text>
      <Text style={styles.viewedSubtitle} numberOfLines={1}>
        Last Viewed: {item?.updatedAt}
      </Text>
    </View>
    <Text style={styles.viewedCount}>{item?.count}</Text>
  </View>
);


// --- Main Component ---
const UserProfileScreen = () => {
  const { id } = useLocalSearchParams();

  const { data } = useGetUsersQuery('', {
    pollingInterval: 1000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const { data: Booksdata, isLoading } = useGetBooksQuery(id, {
    pollingInterval: 1000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  // State for Modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null); // 'editProfile' or 'resetPassword'

  const openModal = (type) => {
    setModalType(type);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setModalType(null);
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 107, 102, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(134, 134, 134, ${opacity})`,
    style: {
      paddingRight: 0,
      marginRight: -10,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#ff6b66',
      fill: '#fff',
    },
  };

  const [user, setuser] = useState({});
  const [databook, setdatabook] = useState([]);
  const [Add]=useUpdateProfileMutation()

  const [lineChartData,setlineChartData] =useState( {
    labels:[''],
    datasets: [
      {
        data:[''],
        color: (opacity = 1) => `rgba(255, 107, 102, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  }
)

  useEffect(() => {
    if (!data) return;
    const find = data.find(res => res?._id === id);
    if (find) {
      console.log(find)
      setuser(find);
    }
  }, [data, id]);

  useEffect(() => {
    if (!Booksdata) return;
    setdatabook(Booksdata);
    if(Booksdata){
          
      const ms=Booksdata?.map(res =>res)
      const pop=ms.filter(res=>res.isPurchased===true).map(price=>price.price)
      
        setlineChartData({
          labels:!pop.length?['']:pop,
          datasets: [
            {
              data:!pop.length?['']:pop,
                color: (opacity = 1) => `rgba(255, 107, 102, ${opacity})`,
                strokeWidth: 2,
              },
            ],
          })
    }
  }, [Booksdata]);


  
  return (
    <>
      {!isLoading && databook?.length > 0 &&
        <SafeAreaView style={styles.safeArea}>

          <ScrollView contentContainerStyle={styles.container}>

            {/* Profile Card */}
            <View style={styles.profileCard}>
              {user?.NameId?.img?.length ? (
                <Image
                  source={{ uri: `${uri}/img/${user?.NameId?.img}` }}
                  style={styles.profileAvatar}
                />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: '#007bff' }]}>
                  <Text style={styles.avatarText}>{user?.NameId?.firstname?.charAt(0)}</Text>
                </View>
              )}

              <Text style={styles.profileName}>{user?.Username}</Text>
              <Text style={styles.profileEmail}>{user?.NameId?.email}</Text>

              {/* MODIFIED Profile Actions to open modal */}
              <View style={styles.profileActions}>
                <TouchableOpacity 
                  style={styles.actionButtonLight} 
                  onPress={() => openModal('editProfile')} // Open Edit Profile
                >
                  <Text style={styles.actionButtonTextDark}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButtonLight} 
                  onPress={() => openModal('resetPassword')} // Open Reset Password
                >
                  <Text style={styles.actionButtonTextDark}>Reset Password</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Activity Overview */}
            <View style={styles.activityCard}>
              <Text style={styles.cardHeader}>Activity Overview</Text>

              <View style={styles.activityMetricsRow}>
              <MetricCard 	title="Books Read" value={databook?.filter(res=>res?.readPercentage>0).length||0} />
              <MetricCard title="Total Purchases" value={databook?.filter(res=>res?.isPurchased===true)?.map(res=>res?.price)?.reduce((prv,sum)=>prv+sum,0)||0} />
            </View>

              {databook.length > 0 &&
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <LineChart
                    data={lineChartData}
                    width={screenWidth * 2}
                    height={180}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.lineChartStyle}
                    withVerticalLabels={false}
                    segments={5}
                    withHorizontalLabels={false}
                  />
                </ScrollView>
              }
            </View>

            {/* Recently Viewed */}
            <View style={styles.activityCard}>
              <Text style={styles.cardHeader}>Recently Viewed Books</Text>

              {databook?.filter(
                res =>
                  (res?.isFreeTrial === true && res?.readPercentage > 0) ||
                  (res?.ispurchased === true && res?.readPercentage > 0)
              )
                ?.map(item => (
                  <ViewedBookItem key={item?._id} item={item} />
                ))}
            </View>

            {/* Bottom Actions */}
            <View style={styles.bottomActions}>
              {user?.NameId?.Active===true?(

                <TouchableOpacity style={styles.suspendButton}  onPress={async()=>{
                  try{
                    const form=new FormData()
                    form.append('Username',user?.Username)
                    form.append('Active',false)
                    await Add({form})
                  }catch(err){
                    alert(err.message)
                  }
                }}>
                <Text style={styles.actionButtonTextWhite}>Suspend Account</Text>
              </TouchableOpacity>
              ):(

                <TouchableOpacity style={styles.cancelButton} onPress={async()=>{
                  try{
                    const form=new FormData()
                    form.append('Active',true)
                    form.append('Username',user?.Username)

                    await Add({form})
                  }catch(err){
                    alert(err.message)
                  }
                }}>
                <Text style={styles.actionButtonTextDark}>Activate Account</Text>
              </TouchableOpacity>
          )}
            </View>

          </ScrollView>
        </SafeAreaView>}

        {/* The New Modal Component */}
        <EditProfileModal
          isVisible={isModalVisible}
          onClose={closeModal}
          type={modalType}
          user={user}
        />
    </>
  );
};

// --- Stylesheet (Original + New Modal Styles) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#4a148c',
    ...Platform.select({
      ios: { paddingTop: 50 },
    }),
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  container: {
    padding: 10,
    paddingBottom: 20,
  },
  // Profile Card (Top Section)
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  profileEmail: {
    fontSize: 14,
    color: '#777',
    marginBottom: 20,
  },
  profileActions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  actionButtonLight: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    minWidth: 140,
    alignItems: 'center',
  },
  actionButtonTextDark: {
    color: '#333',
    fontWeight: '600',
  },
  actionButtonTextWhite: {
    color: '#fff',
    fontWeight: '600',
  },
  // Activity Cards (Mid Sections)
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  activityMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  activityMetricCard: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    width: '48%',
    alignItems: 'center',
  },
  activityMetricTitle: {
    fontSize: 12,
    color: '#777',
    marginBottom: 3,
  },
  activityMetricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  lineChartStyle: {
    borderRadius: 8,
    paddingRight: 0,
    marginRight: 0,
    paddingLeft: 10,
  },
  // Recently Viewed List
  viewedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  viewedColorBlock: {
    width: 40,
    height: 50,
    borderRadius: 4,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  viewedDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  viewedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  viewedSubtitle: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  viewedCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  // Bottom Actions
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  suspendButton: {
    flex: 1,
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 30, 
    fontWeight: 'bold',
  },
});

// --- New Modal Styles ---
const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxWidth: 400,
  },
  formContainer: {
    width: '100%',
    marginBottom: 20,
  },
  formHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
    marginTop: 10,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    backgroundColor: '#f9f9f9',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 15,
  },
  closeButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  // Image Picker specific styles
  imagePickerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImagePreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  placeholderText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#777',
    padding: 5,
  },
  changeImageButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  changeImageButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default UserProfileScreen;