import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TextInput, // Added TextInput for search bar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAdminBooksQuery } from '@/components/api/Getslice';
import { uri } from '@/components/api/uri';
import { router } from 'expo-router';
import { useDispatch } from 'react-redux';
import { SetRoute } from '../../components/Funcslice';

// --- 1. Sample Data (Unchanged) ---
const bookData = [
  {
    id: '1',
    title: 'THE ADVENTURE OF CAPTAIN BLUE',
    coverUri: 'https://via.placeholder.com/150/4682B4/FFFFFF?text=Book+1',
    status: 'reading',
    progress: '75%',
    downloads: '1.2M', 
    actionText: 'CONTINUE READING',
    isNew: false,
  },
  {
    id: '2',
    title: 'THE LOST TRIBE OF ATTOE',
    coverUri: 'https://via.placeholder.com/150/6A5ACD/FFFFFF?text=Book+2',
    status: 'reading',
    progress: '73%',
    downloads: null, 
    actionText: 'CONTINUE READING',
    isNew: false,
  },
  {
    id: '3',
    title: 'MYSTERY LOST CAVE',
    coverUri: 'https://via.placeholder.com/150/3CB371/FFFFFF?text=Book+3',
    status: 'new',
    progress: null,
    downloads: null,
    actionText: 'READ NOW', 
    isNew: true,
  },
  {
    id: '4',
    title: 'MYSTERY OF THE LOST CAVE',
    coverUri: 'https://via.placeholder.com/150/FF6347/FFFFFF?text=Book+4',
    status: 'trial_reading',
    progress: null,
    downloads: 'READ ON TRIAL',
    actionText: 'MANAGE',
    isNew: false,
  },
  {
    id: '5',
    title: 'MYSTERY OF THE LOST CAVE',
    coverUri: 'https://via.placeholder.com/150/DAA520/FFFFFF?text=Book+5',
    status: 'trial_free',
    progress: null,
    downloads: 'FREE ON TRIAL',
    actionText: 'MANAGE',
    isNew: false,
  },
  {
    id: '6',
    title: 'CODING BEGINNERS',
    coverUri: 'https://via.placeholder.com/150/B0C4DE/FFFFFF?text=Book+6',
    status: 'downloaded',
    progress: null,
    downloads: '250K DOWNLOADS',
    actionText: 'MANAGE',
    isNew: false,
  },
];

// --- 2. Book Item Component (Unchanged) ---
const BookItem = ({ book, onBookPress,dispatch }) => {
  let statusDisplay;
  
  // NOTE: Switched to book.readPercentage for status checks based on data structure from previous backend file
  // Need to adjust the status display logic to handle the actual data structure if this were real
  // For now, keeping the simplified logic based on original mock data
  if (book.status === 'reading') {
    statusDisplay = `${book.activeTrialUsers?.length>0} READ`;
  } else {
    statusDisplay = book.downloads;
  }
  
  // Customizing the action button style based on status
  const isContinueReading = book.actionText === 'CONTINUE READING';

  return (
    <TouchableOpacity style={styles.bookContainer} onPress={() => onBookPress(book)}>
      <View style={styles.bookCoverWrapper}>
        <Image style={styles.bookCover} source={{ uri: `${uri}/img/${book.CoverImg}` }} />

        {/* Top-Right Tags (New/Downloads) */}
        <View style={styles.tagWrapper}>
          {book.isNew && (
            <View style={styles.newTag}>
              <Text style={styles.newTagText}>NEW</Text>
            </View>
          )}
          {book.downloads && book.status === 'reading' && (
            <View style={styles.downloadCount}>
              <Text style={styles.downloadCountText}>{book.downloads}</Text>
            </View>
          )}
        </View>

        {/* Progress Bar (if reading) */}
        {book.status === 'reading' && (
          <View style={styles.progressBarWrapper}>
            <View style={[styles.progressBar, { width: book.readPercentage }]} />
          </View>
        )}
      </View>

      <Text numberOfLines={2} style={styles.bookTitle}>
        {book.title}
      </Text>
      <Text numberOfLines={2} style={[styles.bookTitle,{color:'rgba(39, 69, 218, 1)'}]}>
        {book.Author}
      </Text>

      {/* Status/Download Text - IMPROVED STYLE */}
      <Text style={styles.statusText}>{statusDisplay}</Text>

      {/* Action Button - IMPROVED STYLE */}
      <TouchableOpacity 
      onPress={()=> {
        dispatch(SetRoute(book?.BookName))
        router.push(`(AllBooksDetails)/${book?._id}`)}}
        style={[
          styles.actionButton, 
          isContinueReading ? styles.primaryActionButton : styles.secondaryActionButton
        ]}
      >
        <Text 
          style={[
            styles.actionButtonText, 
            isContinueReading ? styles.primaryActionText : styles.secondaryActionText
          ]}
        >
          Manage
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

// --- 3. Main Library Component (Added Search) ---
export default function MyLibraryScreen() {
  const {data:BookData} = useAdminBooksQuery()
  const [activeTab, setActiveTab] = useState('ALL BOOKS');
  const [searchQuery, setSearchQuery] = useState(''); // NEW: State for search input
  
  const handleBookPress = (book) => {
    router.push(`(AllBooksDetails)/${book?._id}`)
        dispatch(SetRoute(book?.BookName))

    console.log('Book Pressed:', book.title);
  };

  const [data,setdata]=useState([])


  useEffect(()=>{
    if(!BookData)return ;
    setdata(BookData)
  },[BookData])

  // --- NEW: Filter Logic ---
  const filteredBooks = data.filter(book => {
    // 1. Filter by Search Query (BookName or Author)
    const matchesSearch = 
      book.BookName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      book.Author.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // 2. Filter by Active Tab (applied to search results)
    if (activeTab === 'Purchased Books') {
      // Assuming purchased books are readable, and non-purchased books with readPercentage > 0 are reading on trial
      return book.purchasedUsers?.length > 0 || book.isPurchased === true; 
    }
    if (activeTab === 'TRIAL BOOKS') {
      return book.activeTrialUsers?.length > 0 ;
    }
    // If 'ALL BOOKS' (or any other tab), return true (rely only on search filter)
    return true; 
  });
  // --- END NEW: Filter Logic ---

  const dispatch=useDispatch()
  const renderItem = ({ item }) => <BookItem book={item} dispatch={dispatch} onBookPress={handleBookPress} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* --- Search Bar Section (NEW) --- */}
        <View style={styles.searchBarContainer}>
            <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
            <TextInput
                style={styles.searchInput}
                placeholder="Search books by title or author..."
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
        </View>

        {/* --- Tabs Section --- */}
        <View style={styles.tabBar}>
          {['ALL BOOKS', 'Purchased Books', 'TRIAL BOOKS'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabItem,
                activeTab === tab && styles.activeTab,
              ]}
              onPress={() => {
                setActiveTab(tab);
                // Optionally clear search when switching tabs, or keep it applied
                // setSearchQuery(''); 
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* --- Book Grid --- */}
        <FlatList
          data={filteredBooks} // Use the new filtered data source
          renderItem={renderItem}
          keyExtractor={(item) => item.BookName} // Keying by BookName is more reliable than item.id
          numColumns={3}
          ListEmptyComponent={
          <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
          <Text>No book to display {activeTab} </Text>
          </View>
          
          }
        
          contentContainerStyle={styles.bookGrid}
        />

        {/* --- Footer Navigation --- */}
      </View>
    </SafeAreaView>
  );
}

// --- 4. Helper for Footer Icons (Unchanged) ---
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

// --- 5. Styling (Refined Containers) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // --- NEW: Search Bar Styles ---
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    marginHorizontal: 15,
    marginVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: '#333',
  },
  // --- Header Styles (Unchanged) ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#1E3C72',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1,
  },
  editButton: {
    padding: 5,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 5,
  },

  // --- Tab Bar Styles (Unchanged) ---
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabItem: {
    paddingHorizontal: 15,
    paddingBottom: 5,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#1E3C72',
  },
  tabText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#1E3C72',
  },

  // --- Book Grid Styles (Improved Container/Card) ---
  bookGrid: {
    paddingHorizontal: 10,
    paddingTop: 15,
  },
  bookContainer: {
    flex: 1,
    margin: 5,
    padding: 5,
    // Using a light, subtle background and a stronger shadow/border for depth
    backgroundColor: '#f9f9f9', // Very light gray background
    borderRadius: 12, // More rounded corners
    alignItems: 'center',
    maxWidth: '31.33%',
    borderWidth: 1,
    borderColor: '#e0e0e0', // Light gray border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, // Increased subtle shadow
    shadowRadius: 4,
    elevation: 3, // For Android shadow
  },
  bookCoverWrapper: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 8, // More rounded covers
    overflow: 'hidden',
    marginBottom: 5,
    borderWidth: 1, // Slight cover border
    borderColor: '#ccc',
  },
  bookCover: {
    width: '100%',
    height: '100%',
  },
  tagWrapper: {
    position: 'absolute',
    top: 5,
    right: 5,
    alignItems: 'flex-end',
  },
  newTag: {
    backgroundColor: '#007bff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  newTagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  downloadCount: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Slightly darker overlay
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  downloadCountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  progressBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4, // Slightly thicker progress bar
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#30A530', // Green for progress
  },
  bookTitle: {
    fontSize: 12,
    fontWeight: '700', // Bolder title
    textAlign: 'center',
    marginTop: 5,
    // height: 30,
    color: '#1E3C72', // Darker text for title
  },
  // --- IMPROVED Status Text Style ---
  statusText: {
    fontSize: 10,
    color: '#777',
    marginVertical: 4,
    textAlign: 'center',
  },
  
  // --- IMPROVED Action Button Styles ---
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 25, // Pill shape
    marginTop: 5,
    marginBottom: 8,
    width: '95%', // Takes up most of the card width
  },
  // Style for "CONTINUE READING" (Primary)
  primaryActionButton: {
    backgroundColor: '#1E3C72', // Use the dark header blue as primary color
  },
  primaryActionText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  // Style for "MANAGE" or "READ NOW" (Secondary)
  secondaryActionButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007bff', // Use a lighter blue border
  },
  secondaryActionText: {
    color: '#007bff',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },


  // --- Footer Styles (Unchanged) ---
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