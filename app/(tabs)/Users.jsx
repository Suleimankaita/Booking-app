import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
// You will need to install this library: npm install react-native-vector-icons
import Icon from 'react-native-vector-icons/Ionicons'; 
import { useGetUsersQuery } from '@/components/api/Getslice';
import { uri } from '@/components/api/uri';
import { router } from 'expo-router';
import { SetRoute } from '../../components/Funcslice';
import { useDispatch } from 'react-redux';
const screenWidth = Dimensions.get('window').width;

// --- Mock Data ---
const USERS_DATA = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', purchased: 12, trials: 2 },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'User', purchased: 5, trials: 1 },
  { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'Guest', purchased: 0, trials: 3 },
  { id: '4', name: 'Diana Prince', email: 'diana@example.com', role: 'User', purchased: 8, trials: 0 },
  { id: '5', name: 'Eve Adams', email: 'eve@example.com', role: 'Admin', purchased: 20, trials: 5 },
  { id: '6', name: 'Frank Miller', email: 'frank@example.com', role: 'User', purchased: 1, trials: 1 },
  // Add more mock users as needed...
];

// --- Helper Components ---

/**
 * Renders an individual user card item for the FlatList.
 */
const UserCard = ({ user,dispatch }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      {/* Placeholder for User Profile Image */}
       {user?.NameId?.img?.length?(

        <Image style={styles.avatarPlaceholder} source={{uri:`${uri}/img/${user?.NameId?.img}`}}/>
      ):( 

       <View style={[styles.avatarPlaceholder,{   backgroundColor: '#007bff',}]}> 
        <Text style={styles.avatarText}>{user?.NameId?.firstname?.charAt(0)}</Text> 
      </View>
      )} 
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user?.NameId?.firstname} {user?.NameId?.lastname}</Text>
        <Text style={styles.userEmail}>{user?.NameId?.email}</Text>
      </View>
      <View style={[styles.roleBadge, user.role === 'Admin' && styles.adminBadge]}>
        <Text style={styles.roleText}>{user.role}</Text>
      </View>
    </View>

    <View style={styles.cardFooter}>
      <View style={styles.statItem}>
        <Icon name="bag-check-outline" size={18} color="#4a148c" />
        <Text style={styles.statValue}>{user?.TrialID?.filter(res=>res.isFreeTrial===true).length}</Text>
        <Text style={styles.statLabel}>Purchases</Text>
      </View>
      <View style={styles.statItem}>
        <Icon name="gift-outline" size={18} color="#4a148c" />
        <Text style={styles.statValue}>{user?.pursedBooksID?.length}</Text>
        <Text style={styles.statLabel}>Free Trials</Text>
      </View>
      <TouchableOpacity onPress={()=>{
        dispatch(SetRoute(user?.Username))
        router.push(`(Users)/${user?._id}`)}
        } style={styles.actionButton}>
        <Text style={styles.actionButtonText}>View Details</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// --- Main Component ---

const UsersPage = () => {
  const {data}=useGetUsersQuery('',{
    pollingInterval:1000,
    refetchOnFocus:true
  })
  const dispatch=useDispatch()
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState(data);

  useEffect(()=>{
    if(!data)return;
    setUsers(data)
  },[data])

  const filterUsers = (query) => {
    setSearchQuery(query);
    if (!query||!data) {
      setUsers(data);
      return;
    }
    const lowercasedQuery = query.toLowerCase();
    const filtered = data.filter(user =>
      user?.NameId?.firstname.toLowerCase().includes(lowercasedQuery) ||
      user?.NameId?.lastname.toLowerCase().includes(lowercasedQuery) ||
      user?.NameId?.email.toLowerCase().includes(lowercasedQuery)
    );
    setUsers(filtered);
  };
  
  // Renders a basic total count block at the top
  const ListHeaderComponent = () => (
    <View style={styles.totalUsersContainer}>
      <Text style={styles.totalUsersCount}>{users?.length}</Text>
      <Text style={styles.totalUsersText}>Total Users</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* <View style={styles.header}>
        <Icon name="people" size={28} color="#4a148c" />
        <Text style={styles.headerText}>User Management</Text>
      </View> */}

      <View style={styles.searchBarContainer}>
        <View style={styles.searchInputWrapper}>
          <Icon name="search-outline" size={20} color="#777" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or email..."
            placeholderTextColor="#777"
            value={searchQuery}
            onChangeText={filterUsers}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="options-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={users}
        renderItem={({ item }) => <UserCard dispatch={dispatch} user={item} />}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={() => (
            <View style={styles.emptyList}>
                <Text style={styles.emptyListText}>No users found matching "{searchQuery}"</Text>
            </View>
        )}
      />
    </SafeAreaView>
  );
};

// --- Stylesheet ---

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 2, }, android: { elevation: 4, }, }),
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4a148c', // Primary color
    marginLeft: 10,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0, // Helps align text input correctly on Android/iOS
  },
  filterButton: {
    backgroundColor: '#007bff', // Blue accent
    borderRadius: 8,
    padding: 8,
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 10,
  },
  totalUsersContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    borderLeftWidth: 5,
    borderLeftColor: '#4a148c',
  },
  totalUsersCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4a148c',
  },
  totalUsersText: {
    fontSize: 16,
    color: '#777',
    marginTop: 5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 15,
    marginBottom: 15,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  userEmail: {
    fontSize: 12,
    color: '#777',
  },
  roleBadge: {
    backgroundColor: '#28a745', // Green for regular users
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  adminBadge: {
    backgroundColor: '#dc3545', // Red for admins
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 5,
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 10,
    color: '#777',
    marginTop: 2,
  },
  actionButton: {
    backgroundColor: '#4a148c', // Primary accent color
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  emptyList: {
    alignItems: 'center',
    padding: 20,
  },
  emptyListText: {
    color: '#777',
    fontSize: 16,
  }
});

export default UsersPage;