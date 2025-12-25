import { useAdminBooksQuery, useGetUsersQuery ,useDeleteBookMutation} from '@/components/api/Getslice';
import { uri } from '@/components/api/uri';
import { Ionicons } from '@expo/vector-icons'; // Assuming you are using Expo or have react-native-vector-icons installed
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// --- Placeholder Components (for Charts and Graph) ---

// Placeholder for the small engagement chart
const EngagementGraphPlaceholder = () => (
  <View style={styles.engagementGraph}>
    <Text style={styles.placeholderText}>[Engagement Chart]</Text>
  </View>
);

// Placeholder for the cover image (Replace with actual image if available)
const BookCover = ({ img }) => (
  <View style={styles.bookCoverWrapper}>
    <Image
      style={styles.bookCover}
      source={{ uri:  `${uri}/img/${img}` }}
      resizeMode="cover"
    />
  </View>
);

// --- Main Book Details Component ---
export default function BookDetailsScreen() {
    const {data,isLoading}=useAdminBooksQuery('',{
        pollingInterval:100,
        refetchOnFocus:true,
        refetchOnReconnect:true
    })
    const {data:Userdata,}=useGetUsersQuery('',{
        pollingInterval:1000,
        refetchOnFocus:true,
        refetchOnReconnect:true
    })
  // Mock Data
  const bookData = {
    title: 'MYSTERY OF THE LOST CAVE',
    author: 'By Ava Chan',
    rating: '4.5/5',
    genre: 'Adventure | Mystery',
    overview:
      'To issue ipsum dolor sit amet, consectetur adipiscing elit. Tincidunt non nibh sed sed nibh. Tincidunt non nibh sed sed nibh. Ut eu nam leo in in sed sed nibh. Ut eu nam leo in in sed eu nam leo sed sed nibh nibh sed sed nibh. Ut eu nam leo in in sed eu nam leo sed sed nibh nibh sed sed nibh.',
    currentlyReading: '73,500',
    trialConversions: '15.8%',
    totalDownloads: '250,000',
    last30DaysDownloads: '5,200',
  };

  const [user,setuser]=useState({})
  const {id}=useLocalSearchParams()

  useEffect(()=>{
    if(!data)return;
    const find=data.find(res=>res?._id===id)
    if(find){
        setuser(find)
        console.log(!user?.purchasedUsers?.length? user?.price:user?.price*user?.purchasedUsers?.length)
    }
  },[data,id])
  const [amount,setamount]=useState((0))
  useEffect(()=>{
    if(!user)return;
        setamount(!user?.purchasedUsers?.length? user?.price:user?.price*user?.purchasedUsers?.length)
    
  },[data,user])



const Rates = ({ rate }) => {
  if(!rate)return;
  // convert any rate (0–100) into star rating (0–5 stars)
  const maxStars = 5;
  const percentage = Math.max(0, Math.min(rate, 100)); // clamp
  const starValue = (percentage / 100) * maxStars;      // convert to star scale

  const fullStars = Math.floor(starValue);              // number of full stars
  const halfStar = starValue - fullStars >= 0.5;        // show half?
  const emptyStars = maxStars - fullStars - (halfStar ? 1 : 0);

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {/* Full Stars */}
      {[...Array(fullStars)].map((_, i) => (
        <Ionicons
          key={`full-${i}`}
          name="star"
          size={14}
          color="#FFD700"
          style={{ marginLeft: 2 }}
        />
      ))}

      {/* Half Star */}
      {halfStar && (
        <Ionicons
          name="star-half"
          size={14}
          color="#FFD700"
          style={{ marginLeft: 2 }}
        />
      )}

      {/* Empty Stars */}
      {[...Array(emptyStars)].map((_, i) => (
        <Ionicons
          key={`empty-${i}`}
          name="star-outline"
          size={14}
          color="#FFD700"
          style={{ marginLeft: 2 }}
        />
      ))}
    </View>
  );
};

  const [Delete,{isSuccess}]=useDeleteBookMutation()

  useEffect(()=>{

    if(isSuccess){
      router.back()
    }
  },[isSuccess,router])

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* --- Header --- */}
        {/* <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="bookmark-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View> */}

        {/* --- Main Content (Scrollable) --- */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* --- Title Bar (Static at top of scroll) --- */}
          <View style={styles.titleBar}>
            <TouchableOpacity style={styles.editButton} onPress={()=>router.push(`(EditBook)/${id}`)}>
              <Ionicons name="create-outline" size={16} color="#fff" />
              <Text style={styles.editButtonText}>Edit Book</Text>
            </TouchableOpacity>
                        <Text style={styles.mainTitle}>BOOK DETAILS</Text>
            
          </View>

          <View style={styles.contentWrapper}>
            {/* --- Top Section: Book Info & Details --- */}
            <View style={styles.bookInfoSection}>
              <BookCover img={user?.CoverImg} />

              <View style={styles.bookDetails}>
                <Text style={styles.bookTitle}>{user?.title}</Text>
                <Text style={styles.bookAuthor}>{user?.Author}</Text>
                <View style={styles.ratingRow}>
                 <Rates rate={Math.round((Number(user?.activeTrialUsers?.length)/Number(Userdata?.length))*100)} />
                </View>
                {/* <Text style={styles.bookGenre}>{bookData.genre}</Text> */}
              </View>
            </View>

            {/* --- Overview & Action Buttons --- */}
            <View style={styles.overviewSection}>
              <Text style={styles.sectionHeader}>OVERVIEW</Text>
              <Text style={styles.overviewText}>{user?.description}</Text>
              <TouchableOpacity style={styles.readTrialButton} onPress={()=>router.push(`../Reader/${id}`)}>
                <Text style={styles.readTrialButtonText}>READ FREE TRIAL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addLibraryButton} onPress={async()=>Delete({id})}>
                <Text style={styles.addLibraryButtonText}>Delete The Book </Text>
              </TouchableOpacity>
            </View>

            {/* --- User Engagement Section --- */}
            <View style={styles.statsCard}>
              <Text style={styles.sectionHeader}>USER ENGAGEMENT</Text>
              <View style={styles.engagementRow}>
                <View style={styles.engagementMetrics}>
                  <Text style={styles.engagementValue}>
                    {user?.activeTrialUsers?.length} USERS
                  </Text>
                  <Text style={styles.engagementLabel}>CURRENTLY READING</Text>

                  <Text style={styles.engagementValue}>
                    {Math.round((Number(user?.activeTrialUsers?.length)/Number(Userdata?.length))*100)}%
                  </Text>
                  <Text style={styles.engagementLabel}>TRIAL CONVERSIONS</Text>
                </View>
                {/* <EngagementGraphPlaceholder /> */}
              </View>
            </View>

            {/* --- Stats/Downloads Section --- */}
            <View style={styles.statsCard}>
              <Text style={styles.sectionHeader}>STAT/DOWNLOADS</Text>
              <View style={styles.downloadsRow}>
                <View style={styles.downloadMetric}>
                  <Text style={styles.downloadsValue}>
                    {Number(amount).toLocaleString()}
                  </Text>
                  <Text style={styles.downloadsLabel}>TOTAL PURCHASED PRICE</Text>
                </View>
                <View style={styles.downloadMetric}>
                  <Text style={styles.downloadsValue}>
                    {user?.purchasedUsers?.length}
                  </Text>
                  <Text style={styles.downloadsLabel}>LAST 30 DAYS</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.analyticsButton}>
                <Text style={styles.analyticsButtonText}>MORE ANALYTICS</Text>
                <Ionicons name="arrow-forward" size={12} color="#1E3C72" style={{ marginLeft: 5 }} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* --- Footer Navigation --- */}
        <View style={styles.footerNav}>
          <FooterIcon name="home-outline" label="HOME" />
          <FooterIcon name="compass-outline" label="EXPLORE" isActive={true} />
          <FooterIcon name="person-outline" label="PROFILE" />
        </View>
      </View>
    </SafeAreaView>
  );
}

// --- Helper for Footer Icons ---
const FooterIcon = ({ name, label, isActive }) => (
  <TouchableOpacity style={styles.footerIconContainer}>
    <Ionicons
      name={name}
      size={24}
      color={isActive ? '#1E3C72' : '#888'}
    />
    <Text
      style={[
        styles.footerIconText,
        { color: isActive ? '#1E3C72' : '#888' },
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

// --- Styling ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // --- Header/Title Bar Styles ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#1E3C72', // Dark Blue
  },
  headerButton: {
    padding: 5,
  },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E3C72',
    letterSpacing: 1,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3C72', // Dark Blue background for the edit pill
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },

  // --- Scroll Content & Layout ---
  scrollContent: {
    paddingBottom: 20, // Space above the footer
  },
  contentWrapper: {
    paddingHorizontal: 20,
  },
  bookInfoSection: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 20,
  },
  bookCoverWrapper: {
    width: 120,
    height: 180,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  bookCover: {
    width: '100%',
    height: '100%',
  },
  bookDetails: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E3C72',
    marginBottom: 5,
  },
  bookAuthor: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  bookRating: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
  },
  bookGenre: {
    fontSize: 14,
    color: '#888',
  },

  // --- Overview Section ---
  overviewSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E3C72',
    marginBottom: 10,
  },
  overviewText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 20,
  },
  readTrialButton: {
    backgroundColor: '#007bff', // Blue Primary Button
    paddingVertical: 12,
    borderRadius: 4,
    marginBottom: 10,
  },
  readTrialButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  addLibraryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 4,
  },
  addLibraryButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },

  // --- Stats Card Styles ---
  statsCard: {
    backgroundColor: '#f5f7fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  engagementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  engagementMetrics: {
    flex: 1,
  },
  engagementValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E3C72',
  },
  engagementLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
  },
  engagementGraph: {
    width: 100,
    height: 50,
    backgroundColor: '#eee',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  placeholderText: {
    fontSize: 10,
    color: '#888',
  },
  downloadsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  downloadMetric: {
    flex: 1,
    marginRight: 10,
  },
  downloadsValue: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1E3C72',
  },
  downloadsLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  analyticsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 5,
  },
  analyticsButtonText: {
    color: '#1E3C72',
    fontSize: 14,
    fontWeight: '700',
  },

  // --- Footer Styles ---
  footerNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  footerIconContainer: {
    alignItems: 'center',
  },
  footerIconText: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
});