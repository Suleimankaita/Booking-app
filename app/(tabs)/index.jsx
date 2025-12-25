import { router, useRouter } from "expo-router";
import SkeletonLoader from "expo-skeleton-loader";
import React, { useEffect, useState } from "react"; // Removed Suspense
// import { REAL_BOOKS } from "@/dB/RealBooks"; // REMOVED MOCK DATA IMPORT
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useGetBooksQuery ,useGetCategoriesQuery} from "@/components/api/Getslice"; // RTK Query hook
import { uri } from "@/components/api/uri";
import { getuserfound, SetRoute } from "../../components/Funcslice";
import { useDispatch, useSelector } from "react-redux";
import Useauth from "../hooks/Useauth";
const { width } = Dimensions.get("window");
const SPACING = 16;
const CARD_WIDTH = (width - 3 * SPACING) / 2;

/* -----------------------------
    1. CONSTANTS (Unchanged)
----------------------------- */

const CATEGORIES = [{_id:0,name:"All"}];

/* -----------------------------
    2. FULL PAGE SKELETON (Unchanged)
----------------------------- */

const FullPageSkeleton = () => {
  
  // Helpers for placeholder arrays
  const recommendedPlaceholders = Array(3).fill(0);
  const gridPlaceholders = Array(6).fill(0);

  return (
    <SkeletonLoader boneColor="#e6e6e6" highlightColor="#f2f2f2">
      <SkeletonLoader.Container style={{ paddingHorizontal: SPACING, paddingTop: 12 }}>
        {/* Search bar skeleton */}
        <SkeletonLoader.Container style={[styles.searchBar, { marginHorizontal: 0 }]}>
          <SkeletonLoader.Item width={20} height={20} style={{ marginRight: 10, borderRadius: 6 }} />
          <SkeletonLoader.Item width="80%" height={20} />
        </SkeletonLoader.Container>

        {/* Categories skeleton */}
        <SkeletonLoader.Container style={{ flexDirection: "row", marginTop: 12, marginBottom: 12 }}>
          {Array(6).fill(6).slice(0, 6).map((_, i) => (
            <SkeletonLoader.Item
              key={i}
              width={80}
              height={30}
              style={{ borderRadius: 20, marginRight: 10 }}
            />
          ))}
        </SkeletonLoader.Container>

        {/* Continue Reading skeleton */}
        <SkeletonLoader.Container style={{ marginBottom: 20 }}>
          <SkeletonLoader.Item width={180} height={22} style={{ marginBottom: 12 }} />
          <SkeletonLoader.Container style={[styles.continueReadingCard, { padding: 12 }]}>
            <SkeletonLoader.Item width={80} height={120} style={{ borderRadius: 8, marginRight: 12 }} />
            <SkeletonLoader.Container style={{ flex: 1 }}>
              <SkeletonLoader.Item width="80%" height={18} style={{ marginBottom: 8 }} />
              <SkeletonLoader.Item width="60%" height={14} style={{ marginBottom: 12 }} />
              <SkeletonLoader.Item width="100%" height={6} style={{ borderRadius: 3 }} />
              <SkeletonLoader.Item width="40%" height={12} style={{ marginTop: 8 }} />
            </SkeletonLoader.Container>
          </SkeletonLoader.Container>
        </SkeletonLoader.Container>

        {/* Recommended skeleton (horizontal) */}
        <SkeletonLoader.Container style={{ marginBottom: 20 }}>
          <SkeletonLoader.Item width={220} height={22} style={{ marginBottom: 12 }} />
          <SkeletonLoader.Container style={{ flexDirection: "row" }}>
            {recommendedPlaceholders.map((_, idx) => (
              <SkeletonLoader.Container
                key={idx}
                style={[styles.recommendedCard, { padding: 6, marginRight: 12 }]}
              >
                <SkeletonLoader.Item width={100} height={150} style={{ borderRadius: 8, marginBottom: 8 }} />
                <SkeletonLoader.Item width="80%" height={14} style={{ alignSelf: 'center', marginBottom: 6 }} />
                <SkeletonLoader.Item width="60%" height={12} style={{ alignSelf: 'center' }} />
              </SkeletonLoader.Container>
            ))}
          </SkeletonLoader.Container>
        </SkeletonLoader.Container>

        {/* All books skeleton (grid) */}
        <SkeletonLoader.Container style={{ marginBottom: 30 }}>
          <SkeletonLoader.Item width={150} height={22} style={{ marginBottom: 12 }} />

          <SkeletonLoader.Container>
            <View style={styles.gridWrapper}>
              {gridPlaceholders.slice(0, 2).map((_, i) => (
                <SkeletonLoader.Container key={`r0-${i}`} style={styles.gridCard}>
                  <SkeletonLoader.Item width="100%" height={CARD_WIDTH * 1.5} style={{ borderRadius: 8, marginBottom: 6 }} />
                  <SkeletonLoader.Item width="90%" height={16} style={{ marginBottom: 6 }} />
                  <SkeletonLoader.Item width="60%" height={12} />
                </SkeletonLoader.Container>
              ))}
            </View>

            <View style={styles.gridWrapper}>
              {gridPlaceholders.slice(2, 4).map((_, i) => (
                <SkeletonLoader.Container key={`r1-${i}`} style={styles.gridCard}>
                  <SkeletonLoader.Item width="100%" height={CARD_WIDTH * 1.5} style={{ borderRadius: 8, marginBottom: 6 }} />
                  <SkeletonLoader.Item width="90%" height={16} style={{ marginBottom: 6 }} />
                  <SkeletonLoader.Item width="60%" height={12} />
                </SkeletonLoader.Container>
              ))}
            </View>

            <View style={styles.gridWrapper}>
              {gridPlaceholders.slice(4, 6).map((_, i) => (
                <SkeletonLoader.Container key={`r2-${i}`} style={styles.gridCard}>
                  <SkeletonLoader.Item width="100%" height={CARD_WIDTH * 1.5} style={{ borderRadius: 8, marginBottom: 6 }} />
                  <SkeletonLoader.Item width="90%" height={16} style={{ marginBottom: 6 }} />
                  <SkeletonLoader.Item width="60%" height={12} />
                </SkeletonLoader.Container>
              ))}
            </View>
          </SkeletonLoader.Container>
        </SkeletonLoader.Container>

        <View style={{ height: 70 }} />
      </SkeletonLoader.Container>
    </SkeletonLoader>
  );
};

/* -----------------------------
    3. ACTUAL CONTENT SECTIONS (Modified to accept data as props)
----------------------------- */

// ContinueReadingSection now takes a book object as a prop
const ContinueReadingSection = ({ book,dispatch }) => {
  if (!book) return null; // Safety check if no continue reading book is available
  return (
    <>
      <Text style={styles.sectionTitle}>Continue Reading</Text>
      <TouchableOpacity style={styles.continueReadingCard} onPress={()=>{
        dispatch(SetRoute(book.BookName))
        router.push(`(ReaderDetails)/${book?._id}`)
        
      }} >
        <Image source={{ uri: `${uri}/img/${book?.CoverImg}` }} style={styles.continueReadingCover} />
        <View style={styles.readingDetails}>
          <Text style={styles.continueTitle}>{book?.title}</Text>
          <Text style={styles.continueAuthor}>{book?.Author}</Text>
          <View style={styles.progressBarContainer}>
            {/* Assuming 'progress' is a field on your book object */}
            <View style={[styles.progressBarFill, { width: `${book?.readPercentage || 0}%` }]} />
          </View>
          <Text style={styles.progressText}>{book?.readPercentage || 0}% Complete</Text>
        </View>
      </TouchableOpacity>
    </>
  );
};

// RecommendedSection now takes a books array as a prop
const RecommendedSection = ({ selectedCategory, books,dispatch }) => {
  if (!books || books.length === 0) return null;
  const filteredBooks = selectedCategory === "All" ? books : books.filter(b => b.categories.toLowerCase() === selectedCategory.toLowerCase());
  
  return (
    <>
      <Text style={styles.sectionTitle}>Recommended For You</Text>
      <FlatList
        data={filteredBooks}
        horizontal
        keyExtractor={(i) => i?._id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.recommendedCard} onPress={()=>{
        dispatch(SetRoute(item.BookName))
            
            router.push(`(ReaderDetails)/${item?._id}`)}} >
            <Image source={{ uri: `${uri}/img/${item?.CoverImg}` }} style={styles.recommendedCover} />
            <Text style={styles.recommendedTitle}>{item?.title}</Text>
            <Text style={styles.recommendedAuthor}>{item?.Author}</Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
      />
    </>
  );
};

// AllBooksSection now takes a books array as a prop
const AllBooksSection = ({ selectedCategory, books }) => {
  if (!books || books.length === 0) return null;
  const filteredBooks = selectedCategory === "All" ? books : books.filter(b => b.genre === selectedCategory);
  const router = useRouter()

  return (
    <>
      <Text style={styles.sectionTitle}>All Books ({filteredBooks.length}+)</Text>
      <FlatList
        data={filteredBooks}
        numColumns={2}
        scrollEnabled={false}
        keyExtractor={(item) => item?._id}
        columnWrapperStyle={styles.gridWrapper}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`(ReaderDetails)/${item?._id}`)} style={styles.gridCard}>
            <Image source={{ uri: `${uri}/img/${item?.CoverImg}` }} style={styles.gridCover} />
            <Text style={styles.gridTitle} numberOfLines={2}>{item?.title}</Text>
            <Text style={styles.gridAuthor}>{item?.Author}</Text>
          </TouchableOpacity>
        )}
      />
    </>
  );
};

/* -----------------------------
    4. RTK QUERY DATA FETCHING COMPONENT
----------------------------- */

// This component uses useGetBooksQuery and renders the sections with the real data
const RTKBooksList = ({ selectedCategory,allBooksData, isLoading, isError,dispatch }) => {
  // Replace all mock resource reads with the actual RTK Query hook
  // const { data: allBooksData, isLoading, isError } = useGetBooksQuery('',{
  //   pollingInterval:1000,
  //   refetchOnFocus:true, 
  //   refetchOnReconnect:true
  // });

  if (isLoading) {
    // Return the full-page skeleton while data is fetching
    return <FullPageSkeleton  />;
  }
    
  if (isError || !allBooksData) {
    // Handle error state (e.g., show a retry button or an error message)
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING }}>
        <Text style={{ color: 'red', fontSize: 16 }}>Failed to load books. Please check your connection.</Text>
      </View>
    );
  }

  // Assuming allBooksData is an array of all books from the backend.
  // You'll need to separate them for the different sections here.
  // NOTE: This logic assumes all books are fetched at once and then categorized on the client side.
  const continueReadingBook = allBooksData[0]; // Example: First book is 'continue reading'
  const recommendedBooks = allBooksData.slice(0, 6); // Example: Next 5 are 'recommended'
  const allOtherBooks = allBooksData.slice(6); // The rest are 'all books'

  return (
    <ScrollView style={styles.container}>
      {/* Pass the real data to the respective sections */}
      <ContinueReadingSection book={continueReadingBook} {...{dispatch}} />
      <RecommendedSection selectedCategory={selectedCategory} {...{dispatch}} books={recommendedBooks} />
      <AllBooksSection selectedCategory={selectedCategory} books={allOtherBooks} {...{dispatch}} />
      <View style={{ height: 70 }} />
    </ScrollView>
  );
};

/* -----------------------------
    5. MAIN SCREEN COMPONENT (Updated to use RTKBooksList)
----------------------------- */

export default function BookListScreen() {
  
  const user=useSelector(getuserfound)
  const {ids}=Useauth()
  let id=''
  useEffect(()=>{
  
    console.log(21, user.id)

  },[user])

  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].name);

  const { data: allBooksData, isLoading, isError } = useGetBooksQuery(user?.id,{
    pollingInterval:1000,
    refetchOnFocus:true, 
    refetchOnReconnect:true
  }); 
  const { data: Cate,} = useGetCategoriesQuery('',{
    pollingInterval:1000,
    refetchOnFocus:true, 
    refetchOnReconnect:true
  });

  // useEffect(()=>{
  //   console.log(userData)
  // },[userData])
  const dispatch=useDispatch()
  const [cateData,setCateData]=useState([{
    name:""
  }])

  useEffect(()=>{
    if(!Cate)return;

    setCateData(Cate)
  },[Cate])

  return (
    <View style={styles.safeArea}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput placeholder="Search books..." placeholderTextColor="#9ca3af" style={styles.searchInput} />
      </View>

      {/* Categories */}
      <FlatList
        data={[...CATEGORIES,...cateData]}
        horizontal
        keyExtractor={((item,_) => _)}
        showsHorizontalScrollIndicator={false}
        style={{ height: 50 }}
        contentContainerStyle={{ paddingBottom: 16, paddingHorizontal: SPACING, }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedCategory(item?.name)}
            style={[
              styles.categoryButton,
              selectedCategory === item?.name && styles.categoryButtonActive,
            ]}
          >
            <Text style={selectedCategory === item?.name ? styles.categoryTextActive : styles.categoryText}>
              {item?.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Use the new RTKBooksList component */}
      <RTKBooksList {...{allBooksData, isLoading, isError,selectedCategory,dispatch}} />
    </View>
  );
}

/* -----------------------------
    6. STYLESHEET (Unchanged)
----------------------------- */

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff", },
  container: { paddingHorizontal: SPACING, backgroundColor: "#fff" },

  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#f1f1f1", paddingVertical: 10, paddingHorizontal: 15, borderRadius: 12, marginTop: 10, marginBottom: 10, marginHorizontal: SPACING },
  searchIcon: { color: "#9ca3af", fontSize: 18, marginRight: 10 },
  searchInput: { flex: 1, color: "#000", fontSize: 16 },

  // CATEGORY BUTTONS
  categoryButton: {alignItems:"center",justifyContent:'center', paddingVertical: 0, paddingHorizontal: 15, borderRadius: 20, backgroundColor: "#eee", marginRight: 10, height: 35 },
  categoryButtonActive: { backgroundColor: "#338fe5ff" },
  categoryText: { color: "#6d6565ff", fontSize: 14 },
  categoryTextActive: { color: "#ffffffff", fontSize: 14, fontWeight: "700" },

  sectionTitle: { color: "#000", fontSize: 20, fontWeight: "bold", marginTop: 10, marginBottom: 15 },

  // CONTINUE READING
  continueReadingCard: { flexDirection: "row", backgroundColor: "#f9f9f9", padding: 15, borderRadius: 12, marginBottom: 25 },
  continueReadingCover: { width: 80, height: 120, borderRadius: 8, marginRight: 15 },
  readingDetails: { flex: 1, justifyContent: "center" },
  continueTitle: { color: "#000", fontSize: 18, fontWeight: "700" },
  continueAuthor: { color: "#555", marginBottom: 10 },
  progressBarContainer: { height: 6, backgroundColor: "#ddd", borderRadius: 3 },
  progressBarFill: { height: "100%", backgroundColor: "#338fe5ff", borderRadius: 3 },
  progressText: { color: "#338fe5ff", marginTop: 4 },

  // RECOMMENDED
  recommendedCard: { width: 100, marginRight: 16, backgroundColor: "#f9f9f9", borderRadius: 8, padding: 5 },
  recommendedCover: { width: "100%", height: 150, borderRadius: 8, marginBottom: 8 },
  recommendedTitle: { color: "#000", fontSize: 13, textAlign: "center" },
  recommendedAuthor: { color: "#555", fontSize: 11, textAlign: "center" },

  // ALL BOOKS GRID
  gridWrapper: { justifyContent: "space-between", marginBottom: 20, flexDirection: "row" },
  gridCard: { width: CARD_WIDTH, backgroundColor: "#f9f9f9", borderRadius: 8, padding: 5 },
  gridCover: { width: "100%", height: CARD_WIDTH * 1.5, borderRadius: 8, marginBottom: 6 },
  gridTitle: { color: "#000", fontSize: 15, fontWeight: "600" },
  gridAuthor: { color: "#555", fontSize: 12 },

  // SKELETON STYLES (New)
  skeletonBase: {
    backgroundColor: '#e0e0e0', // Light grey placeholder color (kept for potential non-shimmer fallback)
    borderRadius: 4,
  },
});