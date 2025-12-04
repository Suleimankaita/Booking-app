// import React from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   FlatList,
//   StyleSheet,
//   Image,
//   Dimensions,
//   TouchableOpacity,
// } from 'react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';

// const { width } = Dimensions.get('window');
// // Card dimensions adjusted for a modern, larger look (approx 2.5 cards per row)
// const CARD_WIDTH = (width - 16 * 2 - 16) / 2.5; 
// const CARD_HEIGHT = CARD_WIDTH * 1.65;
// // Continue Reading Card dimensions
// const LIST_CARD_WIDTH = (width - 16 * 3) / 2;

// // --- 1. Mock Data Structures and Placeholder Logic ---

// // Function to generate a visually distinct, dark-themed placeholder cover
// const getPlaceholderUri = (text, bgColor = '1c1c1c') => {
//   const encodedText = text.replace(/ /g, '_');
//   // Using placehold.co to simulate dark, graphic covers
//   return `https://placehold.co/150x250/${bgColor}/f7f7f7?font=sans&text=${encodedText}`;
// };

// const mockContinueReading = [
//   { id: 'c1', title: 'Two Weeks to Fall in Love', part: 'Part 2', coverText: 'Two Weeks', coverColor: '2ecc71' },
//   { id: 'c2', title: 'Devil & The Last', part: '1 new part', coverText: 'Devil & The Last', coverColor: '9b59b6' },
// ];

// const mockReadingLists = [
//   { id: 'rl1', title: 'Satire & Parody', category: 'Humor', coverColor: '990000', ambassador: true, coverText: 'Bite Me' },
//   { id: 'rl2', title: 'WomanxWoman (NA)', category: 'LGBTQIAP+', coverColor: 'ff69b4', ambassador: true, coverText: 'Lily & Rose' },
//   { id: 'rl3', title: 'Rise of the Were Chipmunks', category: 'Face Claim', coverColor: '006400', ambassador: false, coverText: 'Were Chipmunks' },
//   { id: 'rl4', title: 'Ellie & Quinn', category: 'Fairy Tale', coverColor: '8b008b', ambassador: false, coverText: 'Ellie & Quinn' },
// ];

// const mockStories = [
//   { id: 's1', title: "The Mafia's Sweetheart", coverText: "The\nMafia's\nSweetheart", tags: ['italian', 'mafia'], views: '3.1M', isOriginal: false, coverColor: '2c2c2c' },
//   { id: 's2', title: "The Mafia's Princess", coverText: "The\nMafia's\nPrincess", tags: ['mafiaprincess', 'wattpad'], views: '1.2M', isOriginal: false, coverColor: '4a4a4a' },
//   { id: 's3', title: "Shattered Ties", coverText: "Shattered\nTies", tags: ['wattpad', 'billionaire'], views: '5.6M', isOriginal: false, coverColor: '6b0000' },
//   { id: 's4', title: "Seven Shots to the Heart", coverText: "Seven\nShots\nTo The\nHeart", tags: ['standalone', 'new'], views: '2.4M', isOriginal: true, coverColor: '333333' },
//   { id: 's5', title: "Sidelined 2 Intercepted", coverText: "Sidelined\n2\nIntercepted", tags: ['football', 'Free'], views: '40.3K', isOriginal: true, coverColor: '000080' },
//   { id: 's6', title: "The Summer of '98", coverText: "The\nSummer\nof '98", tags: ['college', 'Free'], views: '1.5M', isOriginal: true, coverColor: '2ecc71' },
// ];

// const mockSections = [
//   { id: 'originals', title: 'W originals', description: 'Your instant escape', stories: mockStories.slice(3, 6).concat(mockStories.slice(0, 1)), hasOriginalIcon: true },
//   { id: 'top_picks', title: 'Top picks for you', stories: mockStories.slice(0, 4), hasOriginalIcon: false },
//   { id: 'stars', title: 'Written in the stars ✨', stories: mockStories.slice(0, 4), hasOriginalIcon: false },
//   { id: 'from_fame', title: 'From page to fame', stories: mockStories.slice(2, 6), hasOriginalIcon: true },
// ];

// // --- 2. Reusable Sub-Components ---

// const OriginalBadge = () => (
//   <View style={styles.originalBadge}>
//     <Text style={styles.originalText}>W</Text>
//   </View>
// );

// // Renders a single story card
// const StoryCard = ({ story, hasOriginalIcon }) => (
//   <TouchableOpacity style={styles.storyCard}>
//     <View>
//       <Image
//         source={{ uri: getPlaceholderUri(story.coverText, story.coverColor) }}
//         style={styles.coverImage}
//       />
//       {hasOriginalIcon && story.isOriginal && <OriginalBadge />}
//     </View>
//     <View style={styles.tagContainer}>
//       <Text style={styles.storyTitleText}>{story.title}</Text>
//       {story.tags.map((tag, index) => (
//         <Text key={index} style={styles.tagText}>
//           {tag}
//         </Text>
//       ))}
//       {story.views && <Text style={styles.viewsText}>👁️ {story.views}</Text>}
//     </View>
//   </TouchableOpacity>
// );

// // Renders a Reading List Card
// const ReadingListCard = ({ list }) => (
//   <TouchableOpacity style={styles.readingListCard}>
//     <Image
//       source={{ uri: getPlaceholderUri(list.coverText, list.coverColor) }}
//       style={styles.readingListCover}
//     />
//     <View style={styles.readingListInfo}>
//       <Text style={styles.readingListTitle}>{list.title}</Text>
//       <View style={styles.readingListTags}>
//         <Text style={styles.readingListCategory}>{list.category}</Text>
//         {list.ambassador && <Text style={styles.readingListAmbassador}>Ambassadors</Text>}
//       </View>
//     </View>
//   </TouchableOpacity>
// );

// // Renders the Continue Reading item
// const ContinueReadingCard = ({ item }) => (
//   <TouchableOpacity style={styles.continueCard}>
//     <Image
//       source={{ uri: getPlaceholderUri(item.coverText, item.coverColor) }}
//       style={styles.continueCover}
//     />
//     <Text style={styles.continueTitle}>{item.title}</Text>
//     <Text style={styles.continuePart}>{item.part}</Text>
//   </TouchableOpacity>
// );

// // Renders a Horizontal Carousel Section
// const StorySection = ({ section }) => {
//   const renderStory = ({ item }) => (
//     <StoryCard story={item} hasOriginalIcon={section.hasOriginalIcon} />
//   );

//   return (
//     <View style={styles.sectionContainer}>
//       <View style={styles.sectionHeader}>
//         <View style={styles.sectionTitleGroup}>
//           <Text style={styles.sectionTitle}>
//             {section.id === 'originals' ? 'W originals' : section.title}
//           </Text>
//           {section.description && <Text style={styles.sectionDescription}>{section.description}</Text>}
//         </View>
//         <TouchableOpacity>
//           <Text style={styles.seeAllArrow}>&gt;</Text>
//         </TouchableOpacity>
//       </View>
//       <FlatList
//         data={section.stories}
//         renderItem={renderStory}
//         keyExtractor={(item) => item.id}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={styles.storyList}
//       />
//     </View>
//   );
// };

// // --- 3. Main Screen Component ---

// const WattpadScreen = () => {
//   const insets = useSafeAreaInsets();

//   return (
//     <View style={{ flex: 1, backgroundColor: '#fff' }}>
//       {/* ScrollView starts right from the top edge */}
//       <ScrollView showsVerticalScrollIndicator={false} style={[styles.scrollViewStyle, { paddingTop: insets.top }]}>

//         {/* 1. Because You Like Romance - Horizontal Carousel */}
//         <View style={styles.romanceSection}>
//           <Text style={styles.romanceHeaderTitle}>Because you like **romance**</Text>
//           <FlatList
//             data={mockStories.slice(0, 6)}
//             renderItem={({ item }) => <StoryCard story={item} hasOriginalIcon={true} />}
//             keyExtractor={item => item.id + 'romance'}
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.storyList}
//           />
//         </View>
//         <View style={styles.dividerThin} />
        
//         {/* 2. Continue Reading Section */}
//         <View style={styles.continueReadingSection}>
//           <Text style={styles.continueReadingHeader}>Continue reading</Text>
//           <View style={styles.continueReadingContent}>
//             <ContinueReadingCard item={mockContinueReading[0]} />
//             <ContinueReadingCard item={mockContinueReading[1]} />
            
//             {/* The "Stories you're reading will appear here" placeholder */}
//             <View style={styles.continueReadingPlaceholder}>
//               <View style={styles.browseButton}>
//                 <Text style={styles.browseIcon}>🔍</Text>
//                 <Text style={styles.browseText}>Browse stories</Text>
//               </View>
//               <Text style={styles.placeholderText}>Stories you're reading will appear here</Text>
//             </View>
//           </View>
//         </View>
//         <View style={styles.dividerThin} />

//         {/* 3. Central Promotional Banner */}
//         <View style={styles.promoBannerContainer}>
//           <View style={styles.promoBannerTextContent}>
//             <Text style={styles.promoBannerMainText}>
//               You wanted messy, real love that hits where it hurts? Welcome to **Soft**.
//             </Text>
//             <TouchableOpacity style={styles.readNowButton}>
//               <Text style={styles.readNowText}>READ NOW</Text>
//             </TouchableOpacity>
//           </View>
//           <Image
//             source={{ uri: getPlaceholderUri('SOFT', 'c0392b') }}
//             style={styles.promoBannerImage}
//           />
//         </View>
//         <View style={styles.divider} />

//         {/* 4. Reading Lists from the community (Horizontal Scroll) */}
//         <View style={styles.readingListSection}>
//           <Text style={styles.readingListHeaderTitle}>Reading lists from the community</Text>
//           <FlatList
//             data={mockReadingLists}
//             renderItem={({ item }) => <ReadingListCard list={item} />}
//             keyExtractor={item => item.id}
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.storyList}
//           />
//         </View>
//         <View style={styles.divider} />

//         {/* 5. Dynamic Story Sections */}
//         {mockSections.map((section) => (
//           <React.Fragment key={section.id}>
//             <StorySection section={section} />
//             <View style={styles.divider} />
//           </React.Fragment>
//         ))}

//         {/* Footer Padding */}
//         <View style={{ height: insets.bottom + 50 }} />
//       </ScrollView>
//     </View>
//   );
// };

// // --- 4. Stylesheet ---

// const styles = StyleSheet.create({
//   // --- Global Styles ---
//   scrollViewStyle: {
//     flex: 1,
//   },
//   divider: {
//     height: 10,
//     backgroundColor: '#f5f5f5', 
//   },
//   dividerThin: {
//     height: 1,
//     backgroundColor: '#eee', 
//   },
//   sectionContainer: {
//     paddingVertical: 15,
//   },
//   storyList: {
//     paddingHorizontal: 16,
//   },

//   // --- Section Headers ---
//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     marginBottom: 10,
//   },
//   sectionTitleGroup: {
//     flexShrink: 1,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: '800',
//     color: '#333',
//   },
//   sectionDescription: {
//     fontSize: 14,
//     color: '#777',
//   },
//   seeAllArrow: {
//     fontSize: 24,
//     color: '#333',
//     fontWeight: '300',
//   },
  
//   // --- Romance Section (Top Carousel) ---
//   romanceSection: {
//     paddingTop: 20, // Add padding to separate from top edge
//     paddingBottom: 5,
//   },
//   romanceHeaderTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     paddingHorizontal: 16,
//     marginBottom: 10,
//   },

//   // --- Story Card (Carousel) Styles ---
//   storyCard: {
//     width: CARD_WIDTH,
//     marginRight: 12,
//   },
//   coverImage: {
//     width: '100%',
//     height: CARD_HEIGHT, 
//     borderRadius: 4,
//     backgroundColor: '#ddd',
//   },
//   originalBadge: {
//     position: 'absolute',
//     top: 5,
//     left: 5,
//     backgroundColor: '#ff4081',
//     borderRadius: 3,
//     paddingHorizontal: 4,
//     paddingVertical: 1,
//   },
//   originalText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 10,
//   },
//   tagContainer: {
//     marginTop: 5,
//   },
//   storyTitleText: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#333',
//     lineHeight: 16,
//   },
//   tagText: {
//     fontSize: 12,
//     color: '#666',
//   },
//   viewsText: {
//     fontSize: 12,
//     color: '#888',
//     marginTop: 2,
//   },

//   // --- Continue Reading Section Styles ---
//   continueReadingSection: {
//     paddingVertical: 15,
//     paddingHorizontal: 16,
//   },
//   continueReadingHeader: {
//     fontSize: 18,
//     fontWeight: '700',
//     marginBottom: 10,
//   },
//   continueReadingContent: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   continueCard: {
//     width: LIST_CARD_WIDTH,
//     marginBottom: 10,
//   },
//   continueCover: {
//     width: LIST_CARD_WIDTH,
//     height: LIST_CARD_WIDTH * 1.5,
//     borderRadius: 4,
//     marginBottom: 5,
//   },
//   continueTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#333',
//   },
//   continuePart: {
//     fontSize: 12,
//     color: '#ff4081',
//     fontWeight: '500',
//   },
//   continueReadingPlaceholder: {
//     width: LIST_CARD_WIDTH,
//     height: LIST_CARD_WIDTH * 1.5 + 40,
//     backgroundColor: '#f5f5f5',
//     borderRadius: 8,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 10,
//     marginBottom: 10,
//   },
//   browseButton: {
//     backgroundColor: 'white',
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 8,
//     paddingHorizontal: 15,
//     borderRadius: 20,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: '#ddd',
//   },
//   browseIcon: {
//     fontSize: 16,
//     marginRight: 5,
//     color: '#333',
//   },
//   browseText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#333',
//   },
//   placeholderText: {
//     fontSize: 13,
//     color: '#777',
//     textAlign: 'center',
//   },

//   // --- Central Promotional Banner Styles ---
//   promoBannerContainer: {
//     flexDirection: 'row',
//     backgroundColor: '#c0392b',
//     padding: 16,
//     marginVertical: 10,
//     marginHorizontal: 16,
//     borderRadius: 8,
//     overflow: 'hidden',
//     justifyContent: 'space-between',
//   },
//   promoBannerTextContent: {
//     flex: 2,
//     marginRight: 10,
//   },
//   promoBannerMainText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: 'white',
//     marginBottom: 10,
//   },
//   promoBannerImage: {
//     width: 60,
//     height: 100,
//     borderRadius: 4,
//     flex: 1,
//     alignSelf: 'flex-start',
//   },
//   readNowButton: {
//     backgroundColor: 'white',
//     paddingVertical: 6,
//     paddingHorizontal: 15,
//     borderRadius: 20,
//     alignSelf: 'flex-start',
//   },
//   readNowText: {
//     color: '#c0392b',
//     fontWeight: 'bold',
//     fontSize: 14,
//   },

//   // --- Reading List Card Styles (Horizontal Scroll) ---
//   readingListSection: {
//     paddingVertical: 15,
//   },
//   readingListHeaderTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     paddingHorizontal: 16,
//     marginBottom: 10,
//   },
//   readingListCard: {
//     width: CARD_WIDTH,
//     marginRight: 12,
//   },
//   readingListCover: {
//     width: CARD_WIDTH,
//     height: CARD_WIDTH * 1.5, 
//     borderRadius: 4,
//     marginBottom: 5,
//   },
//   readingListInfo: {
//     paddingHorizontal: 2,
//   },
//   readingListTitle: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#333',
//     lineHeight: 18,
//   },
//   readingListTags: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginTop: 2,
//   },
//   readingListCategory: {
//     fontSize: 12,
//     color: '#888',
//     marginRight: 5,
//   },
//   readingListAmbassador: {
//     fontSize: 12,
//     color: '#007bff',
//     fontWeight: '500',
//   },
// });

// export default WattpadScreen;