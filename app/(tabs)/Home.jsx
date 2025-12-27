import { useGetBooksQuery, useGetPurchasedQuery, useGetTrialsQuery, useGetUsersQuery } from '@/components/api/Getslice';
import { uri } from '@/components/api/uri';
import { getuserfound } from '@/components/Funcslice';
import React, { useMemo } from 'react';
import {
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';

const screenWidth = Dimensions.get('window').width;

// --- Helper Functions ---

// Extracted logic to process top items to keep component clean
const getTopItems = (data, isTrial = false, topN = 5) => {
  if (!data || data.length === 0) return [];

  // 1. Filter if needed
  const filteredData = isTrial 
    ? data.filter(item => item.isFreeTrial === true) 
    : data;

  const counts = {};
  const bookMap = {};

  // 2. Count occurrences and map objects
  filteredData.forEach(item => {
    const name = item.BookName || item.title || 'Unknown'; 
    counts[name] = (counts[name] || 0) + 1;
    if (!bookMap[name]) bookMap[name] = item;
  });

  // 3. Sort by count
  return Object.keys(counts)
    .map(name => ({
      book: bookMap[name],
      count: counts[name]
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
};

// --- Sub-Components ---

const MetricCard = ({ title, value, color, showArrow = false }) => (
  <View style={[styles.metricCard, { backgroundColor: color }]}>
    <Text style={styles.metricTitle}>{title}</Text>
    <View style={styles.metricValueContainer}>
      <Text style={styles.metricValue}>{value}</Text>
      {showArrow && <Icon name="arrow-up-outline" size={16} color="#fff" style={styles.arrowIcon} />}
    </View>
  </View>
);

const BookListItem = React.memo(({ title, subtitle, count, img, index, isTopPurchased }) => {
  // Safe Image URI handling
  const imageSource ={ uri: `${uri}/img/${img}` } 

  return (
    <View style={styles.listItem}>
       <Image 
          source={imageSource} 
          style={styles.bookImage} 
          resizeMode='cover'
          // Fallback if the remote image fails
          defaultSource={{ uri: 'https://via.placeholder.com/50' }} 
       />
      
      <View style={styles.bookDetails}>
        <Text style={styles.bookTitle} numberOfLines={1}>{title || 'Unknown Title'}</Text>
        <Text style={styles.bookSubtitle} numberOfLines={1}>
           {subtitle ? `$${subtitle}` : 'Free'}
        </Text>
      </View>
      <Text style={styles.bookCount}>{count}</Text>
    </View>
  );
});

// --- Main Dashboard Component ---

const BookishAnalyticsDashboard = () => {
  const user = useSelector(getuserfound);

  // --- API Hooks (Optimized) ---
  // Polling set to 30s (30000ms) to save battery. 
  // Added skip logic for books query if user ID is missing.
  
  const { data: UserData = [] } = useGetUsersQuery('', {
    pollingInterval: 30000, 
    refetchOnFocus: true,
  });

  const { data: TotalPurchased = [] } = useGetPurchasedQuery('', {
    pollingInterval: 30000,
    refetchOnFocus: true,
  });

  const { data: TotalBook = [] } = useGetBooksQuery(user?.id, {
    pollingInterval: 30000,
    refetchOnFocus: true,
    skip: !user?.id, 
  });

  const { data: TotalTrialBook = [] } = useGetTrialsQuery('', {
    pollingInterval: 30000,
    refetchOnFocus: true,
  });

  // --- Derived Data (Optimized with useMemo) ---
  
  const topPurchasedBooks = useMemo(() => 
    getTopItems(TotalPurchased, false), 
  [TotalPurchased]);

  const topTrialBooks = useMemo(() => 
    getTopItems(TotalBook, true), 
  [TotalBook]);

  const pieChartData = useMemo(() => [
    { name: 'Books', population: TotalBook.length, color: '#4CAF50', legendFontColor: '#333', legendFontSize: 12 },
    { name: 'Users', population: UserData.length, color: '#2196F3', legendFontColor: '#333', legendFontSize: 12 },
    { name: 'Purchased', population: TotalPurchased.length, color: '#FFEB3B', legendFontColor: '#333', legendFontSize: 12 },
    { name: 'Trials', population: TotalTrialBook.length, color: '#FF5722', legendFontColor: '#333', legendFontSize: 12 },
  ], [TotalBook.length, UserData.length, TotalPurchased.length, TotalTrialBook.length]);

  // Prevent crashes if data is loading or empty
  const isLoading = !UserData && !TotalBook;

  if (isLoading) {
      return (
          <View style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
              <ActivityIndicator size="large" color="#4a148c" />
          </View>
      );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Icon name="book" size={28} color="#4a148c" />
        <Text style={styles.headerText}>Analytics</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Row 1 Metrics */}
        <View style={styles.metricRow}>
          <MetricCard title="TOTAL USERS" value={UserData.length} color="#007bff" showArrow={true} />
          <MetricCard title="TOTAL BOOKS" value={TotalBook.length} color="#28a745" />
        </View>
        
        {/* Row 2 Metrics */}
        <View style={styles.metricRow}>
          <MetricCard title="PURCHASED" value={TotalPurchased.length} color="#ffc107" />
          <MetricCard title="FREE TRIALS" value={TotalTrialBook.length} color="#dc3545" />
        </View>
        
        {/* Top Purchased List */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Top Purchased Books</Text>
          {topPurchasedBooks.length > 0 ? (
            topPurchasedBooks.map((item, index) => (
              <BookListItem
                key={index}
                title={item.book?.Author}
                img={item.book?.CoverImg}
                subtitle={item.book?.price}
                count={item.count}
                index={index}
                isTopPurchased={true}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No purchases yet.</Text>
          )}
        </View>

        {/* User Acquisition Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.cardHeader}>USER ACQUISITION</Text>
          <PieChart
            data={pieChartData}
            width={screenWidth - 40} // Adjusted width to fit padding
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>

        {/* Top Trials List */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Top Free Trial Books</Text>
          {topTrialBooks.length > 0 ? (
             topTrialBooks.map((item, index) => (
              <BookListItem
                key={index}
                title={item.book?.Author}
                img={item.book?.CoverImg}
                subtitle={item.book?.price}
                count={item.count}
                index={index}
                isTopPurchased={false}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No trials active.</Text>
          )}
        </View>

      </ScrollView>
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
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4a148c', 
    marginLeft: 10,
  },
  container: {
    padding: 10,
    paddingBottom: 30,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metricCard: {
    width: (screenWidth / 2) - 15, 
    height: 100,
    borderRadius: 12,
    padding: 15,
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  arrowIcon: {
    marginLeft: 5,
    marginTop: -5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 15,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333',
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  bookImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 15,
    backgroundColor: '#eee',
  },
  bookDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  bookTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  bookSubtitle: {
    fontSize: 13,
    color: '#777',
  },
  bookCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a148c',
  },
  emptyText: {
    padding: 15,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center'
  }
});

export default BookishAnalyticsDashboard;