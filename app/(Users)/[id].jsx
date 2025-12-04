import { useGetUsersQuery,useGetBooksQuery } from '@/components/api/Getslice';
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
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
const screenWidth = Dimensions.get('window').width;
const CARD_WIDTH = screenWidth - 40;

// --- Mock Data (Based on the image content) ---
const userData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  booksRead: 15,
  totalPurchases: '$120',
  recentlyViewed: [
    { id: 1, title: 'Recently Viewed Books', lastViewed: '((()))K', count: '300K', color: '#f7d7c4' },
    { id: 2, title: 'Recently Viewed Books', lastViewed: '(123 VIK)', count: '300K', color: '#c4d7f7' },
    // Add more items here if needed
  ],
};


// --- Helper Components ---

// Card for the key metrics (Books Read, Total Purchases)
const MetricCard = ({ title, value }) => (
  <View style={styles.activityMetricCard}>
    <Text style={styles.activityMetricTitle}>{title||""}</Text>
    <Text style={styles.activityMetricValue}>{value||""}</Text>
  </View>
);

// List item for Recently Viewed Books
const ViewedBookItem = ({ item }) => (
  <View style={styles.viewedItem}>
    {/* Colored box/placeholder */}
    <Image source={{uri:`${uri}/img/${item?.CoverImg}`}} style={[styles.viewedColorBlock,]}/>
    <View style={styles.viewedDetails}>
      <Text style={styles.viewedTitle} numberOfLines={1}>{item?.BookName}</Text>
      <Text style={styles.viewedSubtitle} numberOfLines={1}>Last Viewed: {item?.updatedAt}</Text>
    </View>
    <Text style={styles.viewedCount}>{item?.count}</Text>
  </View>
);


// --- Main Component ---

const UserProfileScreen = () => {
  const {id}=useLocalSearchParams()
  const {data,}=useGetUsersQuery('',{
    pollingInterval:1000,
    refetchOnFocus:true,
    refetchOnReconnect:true
  })
  const {data:Booksdata,isLoading}=useGetBooksQuery(id,{
    pollingInterval:1000,
    refetchOnFocus:true,
    refetchOnReconnect:true
  })

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,

    color: (opacity = 1) => `rgba(255, 107, 102, ${opacity})`, // Line color
    labelColor: (opacity = 1) => `rgba(134, 134, 134, ${opacity})`, // Axis/Label color
    style: {
      paddingRight: 0,
      marginRight: -10, // Adjust padding to match the image boundary
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#ff6b66',
      fill: '#fff',
    },
  };

  

  const [user,setuser]=useState({})
  const [databook,setdatabook]=useState([])

  useEffect(()=>{
    
    if(!data)return;
    
    const find=data.find(res=>res?._id===id)
    if(find){
      setuser(find)

    }
    
  },[data])
  
  useEffect(()=>{
    
    if(!Booksdata)return;
    // const find=data.find(res=>res?._id===id)
    // console.log(Booksdata)
    // if(find){
      setdatabook(Booksdata)

    // }
    
  },[Booksdata])

  const lineChartData = {
  labels:databook?.filter(res=>res?.isFreeTrial===true)?.map(res=>res?.
PurchasedDate
), // Labels from the image
  // labels:[], // Labels from the image
  datasets: [
    {
      data:databook?.filter(res=>res?.isFreeTrial===true)?.map(res=>Number(res?.price)), // Sample data for the trend line
      color: (opacity = 1) => `rgba(255, 107, 102, ${opacity})`, // Reddish line color
      strokeWidth: 2,
    },
  ],
};


  return (
    <>
    {!isLoading&&databook.length&& 
     <SafeAreaView style={styles.safeArea}>
      

      <ScrollView contentContainerStyle={styles.container}>
        
        {/* 2. Profile Card */}
        <View style={styles.profileCard}>
          {
              user?.NameId?.img.length?(

                <Image
                source={{ uri: `${uri}/img/${user?.NameId?.img}` }} // Placeholder
                style={styles.profileAvatar}
                />
              ):(
                 <View style={[styles.avatarPlaceholder,{   backgroundColor: '#007bff',}]}> 
                        <Text style={styles.avatarText}>{user?.NameId?.firstname?.charAt(0)}</Text> 
                      </View>
              )
          }
          <Text style={styles.profileName}>{user?.Username}</Text>
          <Text style={styles.profileEmail}>{user?.NameId?.email}</Text>
          
          <View style={styles.profileActions}>
            <TouchableOpacity style={styles.actionButtonLight}>
              <Text style={styles.actionButtonTextDark}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButtonLight}>
              <Text style={styles.actionButtonTextDark}>Reset Password</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Activity Overview Card */}
        <View style={styles.activityCard}>
          <Text style={styles.cardHeader}>Activity Overview</Text>
          
          <View style={styles.activityMetricsRow}>
            {/* <MetricCard  title="Books Read" value={databook?.filter(res=>res?.readPercentage>0).length||0} /> */}
            {/* <MetricCard title="Total Purchases" value={databook?.filter(res=>res?.isPurchased===true)?.map(res=>res?.price)?.reduce((prv,sum)=>prv+sum,0)||0} /> */}
          </View>
          {databook.length>0&&
          <ScrollView horizontal showsHorizontalScrollIndicator={false} >

          <LineChart
            data={lineChartData}
            width={screenWidth*2 } // Adjust chart width within the card padding
            height={180}
            chartConfig={chartConfig}
            bezier
            style={styles.lineChartStyle}
            withVerticalLabels={true}
            segments={5}
            withHorizontalLabels={false} // Remove Y-axis labels to match the image
            />
            </ScrollView>
          }
          
        </View>

        {/* 4. Recently Viewed Card */}
        <View style={styles.activityCard}>
          <Text style={styles.cardHeader}>Recently Viewed Books</Text>
          {
          
          databook?.filter(res=>res?.isFreeTrial===true&&res?.readPercentage>0||res?.ispurchased===true&&res?.readPercentage>0)?.map(item => (
            <ViewedBookItem key={item?._id} item={item} />
          ))}
        </View>

        {/* 5. Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.suspendButton}>
            <Text style={styles.actionButtonTextWhite}>Suspend Account</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton}>
            <Text style={styles.actionButtonTextDark}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  }
  </>


  );
};

// --- Stylesheet ---

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0', // Light gray background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#4a148c', // Dark purple header
    ...Platform.select({
      ios: { paddingTop: 50 }, // Adjust for notch/status bar area
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
    backgroundColor: '#dc3545', // Red for Suspend
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
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default UserProfileScreen;