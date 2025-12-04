import { useGetBooksQuery, useGetPurchasedQuery, useGetTrialsQuery, useGetUsersQuery } from '@/components/api/Getslice';
import { uri } from '@/components/api/uri';
import React, { useEffect, useState } from 'react';
import {
  Dimensions, Image, Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/Ionicons';


const screenWidth = Dimensions.get('window').width;

// --- Data Simulation (based on the image content) ---
// Note: We'll use placeholders for actual book cover images as React Native 
// requires images to be imported locally or referenced by a URI.

const dashboardData = {
  // Top Row Metrics (split into two views in the image, but all data is present)
  totalUsers: '1,200K',
  totalBooks: '50,000+',
  totalPurchased: '850K',
  freeTrials: '850K', // Adjusted based on the right screen of the image
  
  topPurchased: [
    { title: 'The Alchemist', subtitle: '(120K)', count: '120K', imgUrl: 'placeholder' },
    { title: 'Atomic Habits', subtitle: '(95K)', count: '80K', imgUrl: 'placeholder' },
    { title: 'The Silent Patient', subtitle: 'Project Hail Mary', count: '70K', imgUrl: 'placeholder' },
  ],
  topFreeTrials: [
    { title: 'Educated', subtitle: 'The Crawdads Sing', count: '35K', imgUrl: 'placeholder' },
    { title: 'The Midnight Library', subtitle: 'Circe', count: '30K', imgUrl: 'placeholder' },
    { title: 'The Four Agreements', subtitle: '', count: '22K', imgUrl: 'placeholder' },
  ],
};


const lineChartData = {
  labels: ['Jan', 'Feb', 'Mar $75K', 'Apr $75K', 'Apr $900'],
  datasets: [
    {
      data: [35, 45, 75, 55, 90], // Revenue in thousands (e.g., 90 is $90K)
      color: (opacity = 1) => `rgba(255, 193, 7, ${opacity})`, // Yellow/Orange line
      strokeWidth: 3,
    },
  ],
};

// --- Helper Components ---

// Card for the main metrics (Total Users, Books, etc.)
const MetricCard = ({ title, value, color, iconName, showArrow = false ,data}) => (
  <View style={[styles.metricCard, { backgroundColor: color }]}>
    <Text style={styles.metricTitle}>{title}</Text>
    <View style={styles.metricValueContainer}>
      <Text style={styles.metricValue}>{value}</Text>
      {showArrow && <Icon name="arrow-up-outline" size={16} color="#fff" style={styles.arrowIcon} />}
    </View>
  </View>
);

// List item for Top Books
const BookListItem = ({ title, subtitle, count,img, index, isTopPurchased }) => {
    // Style adjustments based on the image's specific formatting for the third purchased book
    const subtitleText = isTopPurchased && index === 2 ? subtitle : subtitle.replace(/[()]/g, '');
console.log(img)
    return (
        <View style={styles.listItem}>
            {/* Placeholder for Book Cover Image */}
            {/* <View style={[styles.bookCoverPlaceholder, isTopPurchased && index === 0 && styles.cover1, isTopPurchased && index === 1 && styles.cover2]} /> */}
            <Image source={{uri:`${uri}/img/${img}`}} style={{width:50,height:50,marginRight:10}} resizeMode='cover'/>
            
            <View style={styles.bookDetails}>
                <Text style={styles.bookTitle} numberOfLines={1}>{title}</Text>
                {subtitleText && (
                    <Text style={styles.bookSubtitle} numberOfLines={1}>
                        {/* Only show the subtitle if it's not the primary title for clarity */}
                        {isTopPurchased && index === 2 ? subtitleText : subtitle}
                    </Text>
                )}
            </View>
            <Text style={styles.bookCount}>{count}</Text>
        </View>
    );
};


// --- Main Dashboard Component ---

const BookishAnalyticsDashboard = () => {

  const {data:UserData,isLoading:UserLoading}= useGetUsersQuery('',{
    pollingInterval:1000,
    refetchOnFocus:true
  })
  const {data:TotalPurchased,isLoading:TotalPurchasedLoading}= useGetPurchasedQuery('',{
    pollingInterval:1000,
    refetchOnFocus:true
  })
  const {data:TotalBook,isLoading:TotalBookLoading}= useGetBooksQuery('',{
    pollingInterval:1000,
    refetchOnFocus:true
  })
  const {data:TotalTrialBook,isLoading:TotalTrialBookLoading}= useGetTrialsQuery('',{
    pollingInterval:1000,
    refetchOnFocus:true
  })

  
    const pieChartData = [
  { name: 'ToTal Books', population:TotalBook?.length||0 , color: '#4CAF50', legendFontColor: '#333', legendFontSize: 12 }, // Green
  { name: 'ToTal Users', population: UserData?.length||0, color: '#2196F3', legendFontColor: '#333', legendFontSize: 12 }, // Blue
  { name: 'ToTal Purchased', population: TotalPurchased?.length||0, color: '#FFEB3B', legendFontColor: '#333', legendFontSize: 12 }, // Yellow
  { name: 'ToTal Free Trials', population: TotalTrialBook?.length||0, color: '#FF5722', legendFontColor: '#333', legendFontSize: 12 }, // Orange-Red
];

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(134, 134, 134, ${opacity})`, 
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 8,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#ffc107',
    },
    // Custom function to handle the labels shown in the image (e.g., Mar $75K)
    formatYLabel: (y) => `$${y}K`, 
  };
  
  const [Topbooks,setTopBooks]=useState([])
  const [TopTrials,setTopTrials]=useState([])
  const [datas,setdata]=useState([])

  const obj = [
  { id: 0, name: "suleiman" },
  { id: 0, name: "suleiman" }
];

const obj2 = [
  { id: 1, name: "suleiman" },
  { id: 1, name: "suleiman" }
];

  useEffect(() => {
  if (!UserData) return;

  
// 1️⃣ Get unique names from obj
const uniqueNames1 = [...new Set(obj.map(item => item.name))];

// 2️⃣ Get unique names from obj2
const uniqueNames2 = [...new Set(obj2.map(item => item.name))];

// 3️⃣ Find matching names (still unique)
const matches = uniqueNames1.filter(name => uniqueNames2.includes(name));

// 4️⃣ Count how many matched in total
const totalMatchCount =
  obj.filter(a => matches.includes(a.name))?.length +
  obj2.filter(b => matches.includes(b.name))?.length;

console.log("Unique matched name:", matches[0]); 
console.log("Total matched count:", totalMatchCount);

  const names1 = obj.map(item => item.name);
  const names2 = obj2.map(item => item.name);

  const matchCount = names1.filter(name => names2.includes(name));

  // console.log("Number of matching names:", matchCount);

  setdata(UserData);
}, [UserData]);


useEffect(()=>{
  if(!TotalPurchased)return;
  console.log(TotalPurchased)
  const uniqueMap = new Map();

  TotalPurchased.forEach(item => {
    uniqueMap.set(item.BookName, item); // key = BookName
  });

  // 2️⃣ Convert Map values to an array (unique items)
  const uniqueList = [...uniqueMap.values()];

  // 3️⃣ Count occurrences dynamically
  const counts = {};
  TotalPurchased.forEach(item => {
    counts[item.BookName] = (counts[item.BookName] || 0) + 1;
  });

  // console.log( uniqueList,counts)
  

  const getTopPurchasedBooks = (arr, topN = 5) => {
  const counts = {};
  const bookMap = {};

  // Count purchases + store one instance of each book
  arr.forEach(item => {
    const name = item.BookName;
    counts[name] = (counts[name] || 0) + 1;
    if (!bookMap[name]) bookMap[name] = item;
  });

  // Convert to sortable list
  const sortable = Object.keys(counts).map(name => ({
    book: bookMap[name],
    count: counts[name]
  }));

  // Sort by count (highest first)
  sortable.sort((a, b) => b.count - a.count);

  // Return top N
  setTopBooks(sortable.slice(0, topN))
  return sortable.slice(0, topN);
};


getTopPurchasedBooks(TotalPurchased)

  // return {
    // unique: uniqueList,     // only unique BookName items
    // counts                  // how many times each BookName appeared
  // };
},[TotalPurchased])


  useEffect(()=>{
    if(!TotalBook)return;

      

  const getTopPurchasedBooks = (arr, topN = 5) => {
  const counts = {};
  const bookMap = {};

  // Count purchases + store one instance of each book
  arr.forEach(item => {
    const name = item.BookName;
    counts[name] = (counts[name] || 0) + 1;
    if (!bookMap[name]) bookMap[name] = item;
  });

  // Convert to sortable list
  const sortable = Object.keys(counts).map(name => ({
    book: bookMap[name],
    count: counts[name]
  }));

  // Sort by count (highest first)
  sortable.sort((a, b) => b.count - a.count);

  // Return top N
  setTopTrials(sortable.slice(0, topN))
  return sortable.slice(0, topN);
};


getTopPurchasedBooks(TotalBook.filter(res=>res.isFreeTrial===true))

  },[TotalBook])

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Icon name="book" size={28} color="#4a148c" />
        <Text style={styles.headerText}>Bookish Analytics Dashboard</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* 1. Metric Cards Row 1 (Left Screen View) */}
        <View style={styles.metricRow}>
          <MetricCard
            title="TOTAL USERS"
            value={datas?.length||0}
            color="#007bff" // Blue
            showArrow={true}
          />
          <MetricCard
            title="TOTAL BOOKS"
            value={TotalBook?.length||0}
            color="#28a745" // Green
            showArrow={false}
          />
        </View>
        
        {/* 2. Metric Cards Row 2 (Right Screen View - Overlaps with row 1 in a combined view) */}
        <View style={styles.metricRow}>
          <MetricCard
            title="TOTAL PURCHASED"
            value={TotalPurchased?.length||0}
            color="#ffc107" // Orange
            showArrow={false}
          />
          <MetricCard
            title="FREE TRIALS"
            value={TotalTrialBook?.length||0}
            color="#dc3545" // Red
            showArrow={false}
          />
        </View>
        
        {/* 3. Top Purchased Books List (Left Screen View) */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Top Purchased Books</Text>
          {Topbooks?.map((book, index) => {
            console.log(book)
            return (
            <BookListItem
              key={index}
              title={book?.book?.Author}
              img={book?.book?.CoverImg}
              // The subtitle in the image is often the count or an extra detail
              subtitle={`${book?.book?.price||0}`}
              count={book?.count}
              index={index}
              isTopPurchased={true}
            />
          )})}
        </View>

        {/* 4. User Acquisition Pie Chart (Right Screen View) */}
        <View style={styles.chartCard}>
          <Text style={styles.cardHeader}>USER ACQUISITION</Text>
          <PieChart
            data={pieChartData}
            width={screenWidth * 0.9} 
            height={220}
            chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="10"
            absolute
            // This centers the chart in the view by adjusting the positioning
            style={{ marginLeft: -15 }}
          />
        </View>

        {/* 5. Top Free Trial Books List (Left Screen View) */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Top Free Trial Books</Text>
          {TopTrials?.map((book, index) => {
            return(
            <BookListItem
              key={index}
              title={book?.book?.Author}
              img={book?.book?.CoverImg}
              // The subtitle in the image is often the count or an extra detail
              subtitle={`${book?.book?.price||0}`}
              count={book?.count}
              index={index}
              isTopPurchased={false}
            />
          )})}
        </View>

        {/* 6. Monthly Revenue Line Chart (Right Screen View) */}
        {/* <View style={styles.chartCard}>
          <Text style={styles.cardHeader}>MONTHLY REVENUE</Text>
          <LineChart
            data={lineChartData}
            width={screenWidth * 0.9}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.lineChartStyle}
          />
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Stylesheet for Responsiveness ---

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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4a148c', 
    marginLeft: 10,
  },
  container: {
    padding: 10,
  },
  // Metric Cards Layout
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metricCard: {
    width: (screenWidth / 2) - 15, 
    height: 100,
    borderRadius: 8,
    padding: 15,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 5,
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  arrowIcon: {
    marginLeft: 5,
    marginTop: -5,
  },
  // General Card Styles
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    paddingHorizontal: 15,
    width: '100%',
  },
  // Book List Item
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingHorizontal: 15, // To match the card header
    marginLeft: -15, // Adjust to cover the full width of the card
    width: screenWidth - 20, // Full width minus container padding
  },
  bookCoverPlaceholder: {
    width: 30,
    height: 45, // Smaller height to match the image
    backgroundColor: '#ccc', 
    borderRadius: 2,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  // Specific Placeholder coloring to mimic the image
  cover1: { backgroundColor: '#f5cba7' }, 
  cover2: { backgroundColor: '#a9cce3' }, 
  
  bookDetails: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 10,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  bookSubtitle: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  bookCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  lineChartStyle: {
    borderRadius: 8,
    marginVertical: 8,
    // Add horizontal padding inside the chart card to center the chart output
    marginHorizontal: 15, 
  },
});

export default BookishAnalyticsDashboard;