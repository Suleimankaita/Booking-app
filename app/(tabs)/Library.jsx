import { useGetBooksQuery } from '@/components/api/Getslice';
import { uri } from '@/components/api/uri';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    SafeAreaView,
    ScrollView // Need ScrollView for horizontal FilterTabs
    ,


    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
const WINDOW_WIDTH = Dimensions.get('window').width;

// --- STYLING CONSTANTS ---
const PRIMARY_COLOR = '#4A90E2'; // A vibrant blue
const BACKGROUND_COLOR = '#F4F7F9'; // Light gray-blue for contrast
const CARD_BACKGROUND = '#FFFFFF';
const TEXT_COLOR = '#333333';
const SUBTITLE_COLOR = '#757575';

// --- DUMMY DATA ---
const DUMMY_BOOKS = [
    { id: '1', title: 'Cosmic Dragon', author: 'Brasik', coverUrl: 'https://picsum.photos/seed/book1/150/220', progress: 5, status: 'Reading', lastRead: 'Chapter 2' },
    { id: '2', title: 'Farinedler: The Lost City', author: 'Mithrakan', coverUrl: 'https://picsum.photos/seed/book2/150/220', progress: 50, status: 'Reading', lastRead: 'Page 150' },
    { id: '3', title: 'Turfa Vanden', author: 'Moffosen', coverUrl: 'https://picsum.photos/seed/book3/150/220', progress: 95, status: 'Reading', lastRead: 'Epilogue' },
    { id: '4', title: 'Frmlled Surgon', author: 'Aetrinden', coverUrl: 'https://picsum.photos/seed/book4/150/220', progress: 100, status: 'Finished', lastRead: 'Completed' },
    { id: '5', title: 'Urban Gardens Guide', author: 'Frsalis Mled', coverUrl: 'https://picsum.photos/seed/book5/150/220', progress: 0, status: 'Unread', lastRead: 'Start' },
    { id: '6', title: 'Sham Man', author: 'Biorn kinley', coverUrl: 'https://picsum.photos/seed/book6/150/220', progress: 65, status: 'Reading', lastRead: 'Chapter 9' },
    { id: '7', title: 'Blalton', author: 'C.H. Munez', coverUrl: 'https://picsum.photos/seed/book7/150/220', progress: 100, status: 'Finished', lastRead: 'Completed' },
    { id: '8', title: 'Turfa Von Ales', author: 'Moffosen', coverUrl: 'https://picsum.photos/seed/book8/150/220', progress: 0, status: 'Unread', lastRead: 'Start' },
    { id: '9', title: 'Mor Phermaes', author: 'U.J. Stride', coverUrl: 'https://picsum.photos/seed/book9/150/220', progress: 100, status: 'Finished', lastRead: 'Completed' },
];

// --- CONSTANTS ---
const FILTERS = ['All Books', 'Trials','Reading', 'Finished', 'Unread',];
const NUM_COLUMNS = 3;
// Calculate dynamic spacing and width
const GRID_PADDING = 20;
const ITEM_MARGIN = 15;
const BOOK_CARD_WIDTH = (WINDOW_WIDTH - (GRID_PADDING * 2) - (ITEM_MARGIN * (NUM_COLUMNS - 1))) / NUM_COLUMNS;
const BOOK_CARD_HEIGHT = BOOK_CARD_WIDTH * 1.5;


// --- COMPONENT: BookCard ---
const BookCard = React.memo(({ book, onPress }) => {

    
    const isFinished = book.progress === 100;

    return (
        <TouchableOpacity style={libraryStyles.cardContainer} onPress={() => {
            console.log(book?._id)
            router.push(`(ReaderDetails)/${book?._id}`)}}>
            <View style={libraryStyles.coverWrapper}>
                <Image 
                    source={{ uri: `${uri}/img/${book?.CoverImg}` }} 
                    style={libraryStyles.bookCover} 
                    resizeMode="cover"
                />
                
                {/* Progress Bar & Badge */}
                {book?.readPercentage > 0 && (
                    <>
                        <View style={libraryStyles.progressBarBase}>
                            <View style={[
                                libraryStyles.progressBarFill, 
                                { width: `${book?.readPercentage}%`, backgroundColor: isFinished ? '#4CAF50' : PRIMARY_COLOR }
                            ]} />
                        </View>
                        <View style={[
                            libraryStyles.progressBadge, 
                            { backgroundColor: isFinished ? '#4CAF50' : PRIMARY_COLOR }
                        ]}>
                            <Text style={libraryStyles.progressText}>
                                {isFinished ? '✓' : `${book?.readPercentage}%`}
                            </Text>
                        </View>
                    </>
                )}
            </View>
            <Text style={libraryStyles.bookTitle} numberOfLines={2}>
                {book?.BookName}
            </Text>
            <Text style={libraryStyles.bookAuthor} numberOfLines={1}>
                {book.Author}
            </Text>
        </TouchableOpacity>
    );
});


// --- COMPONENT: FilterTabs ---
const FilterTabs = ({ selectedFilter, onSelect }) => (
    <View style={libraryStyles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={libraryStyles.filterScrollContent}>
            {FILTERS.map(filter => (
                <TouchableOpacity
                    key={filter}
                    style={[
                        libraryStyles.filterButton,
                        selectedFilter === filter && libraryStyles.activeFilterButton,
                    ]}
                    onPress={() => onSelect(filter)}
                >
                    <Text style={[
                        libraryStyles.filterText,
                        selectedFilter === filter ? libraryStyles.activeFilterText : libraryStyles.inactiveFilterText,
                    ]}>
                        {filter}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    </View>
);

// --- COMPONENT: Header ---
const Header = () => (
    <View style={libraryStyles.header}>
        <Text style={libraryStyles.headerTitle}>My Library</Text>
        <View style={libraryStyles.headerIcons}>
            <TouchableOpacity style={libraryStyles.iconButton}>
                <Ionicons name="search" size={24} color={TEXT_COLOR} />
            </TouchableOpacity>
            <TouchableOpacity style={libraryStyles.iconButton}>
                <MaterialCommunityIcons name="sort-alphabetical-ascending" size={24} color={TEXT_COLOR} />
            </TouchableOpacity>
        </View>
    </View>
);


// --- MAIN COMPONENT: MyBooksScreen ---
const MyBooksScreen = ({ navigation }) => {
    
    const {data:datas}=useGetBooksQuery('',{
        pollingInterval:1000,
        refetchOnFocus:true,
        refetchOnReconnect:true
    })
    
    const [Books,setBooks]=useState([])
    const [Trials,setTrials]=useState([])
   
    useEffect(()=>{
        if(!datas)return;
        const filter=datas.filter(res=>res?.isPurchased==true)
        console.log(filter)
        setBooks(filter)
    },[datas])
    
    useEffect(()=>{
        if(!datas)return;
        const filter=datas.filter(res=>res.isFreeTrial===true)
        setTrials(filter)
    },[datas])
    
    useEffect(()=>{
        console.log([...Trials,...Books])
    },[Trials,Books])
    


    const [selectedFilter, setSelectedFilter] = useState('Reading');

    let filteredBooks =selectedFilter==="Trials"?Trials:selectedFilter === 'All Books'?[...Trials,...Books]:selectedFilter==="Reading"?[...Trials,...Books].filter(res=>res.readPercentage>0):selectedFilter==="Finished"?[...Trials,...Books].filter(res=>res.readPercentage>=100):[]
    //  Books.filter(book => {
    //     if (selectedFilter === 'All Books') return true;
    //     return book.status === selectedFilter;
    // });

    const handleBookPress = (book) => {
        console.log(`Navigating to EpubReader for: ${book.title}`);
        // navigation.navigate('EpubReader', { bookId: book.id, cfi: book.lastReadCfi });
    };

    return (
        <SafeAreaView style={libraryStyles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={CARD_BACKGROUND} />
            
            {/* --- Header --- */}
            <Header />
            
            {/* --- Filter Tabs --- */}
            <FilterTabs selectedFilter={selectedFilter} onSelect={setSelectedFilter} />
            
            {/* --- Book Grid --- */}
            {filteredBooks.length === 0 ? (
                <View style={libraryStyles.emptyState}>
                    <Text style={libraryStyles.emptyStateText}>No books in the "{selectedFilter}" shelf.</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredBooks}
                    keyExtractor={item => item?._id}
                    numColumns={NUM_COLUMNS}
                    renderItem={({ item }) => <BookCard book={item} onPress={handleBookPress} />}
                    contentContainerStyle={libraryStyles.bookGrid}
                    showsVerticalScrollIndicator={false}
                />
            )}
            
            {/* // 🚫 FOOTER REMOVED: 
            // <View style={libraryStyles.tabBar}>
            //     <TabItem iconName="library" label="Library" isActive={true} />
            //     <TabItem iconName="book" label="Reading Now" isActive={false} />
            //     <TabItem iconName="settings" label="Settings" isActive={false} />
            // </View> 
            */}
            
        </SafeAreaView>
    );
};


// --- STYLES ---

const libraryStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BACKGROUND_COLOR, // Modern light background
    },
    
    // ## Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: CARD_BACKGROUND,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#EBEBEB',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '900', // Extra bold title
        color: TEXT_COLOR,
    },
    headerIcons: {
        flexDirection: 'row',
    },
    iconButton: {
        marginLeft: 15,
        padding: 5,
    },
    
    // ## Filter Tabs
    filterContainer: {
        backgroundColor: CARD_BACKGROUND,
        paddingVertical: 10,
        paddingHorizontal: 10,
        marginBottom: 10, // Separator space from grid
    },
    filterScrollContent: {
        paddingHorizontal: 10,
    },
    filterButton: {
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 20,
        marginHorizontal: 5,
        backgroundColor: '#EBEBEB', // Subtle inactive background
    },
    activeFilterButton: {
        backgroundColor: PRIMARY_COLOR, 
        shadowColor: PRIMARY_COLOR,
        shadowOffset: { height: 2, width: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 3,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '700',
    },
    activeFilterText: {
        color: CARD_BACKGROUND, // White text on primary background
    },
    inactiveFilterText: {
        color: SUBTITLE_COLOR,
    },
    
    // ## Book Grid
    bookGrid: {
        paddingHorizontal: GRID_PADDING - (ITEM_MARGIN / 2),
        paddingBottom: 20, // Add padding at the bottom of the grid 
    },
    cardContainer: {
        width: BOOK_CARD_WIDTH,
        marginHorizontal: ITEM_MARGIN / 2,
        marginBottom: 25,
        alignItems: 'center',
    },
    coverWrapper: {
        width: '100%',
        height: BOOK_CARD_HEIGHT,
        borderRadius: 8,
        marginBottom: 8,
        overflow: 'visible', // Allow progress bar to overlap
        backgroundColor: '#E0E0E0',
        
        // Soft, modern shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 8,
    },
    bookCover: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    
    // Book Progress Styles
    progressBarBase: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 5,
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
    },
    progressBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        borderRadius: 15,
        paddingHorizontal: 8,
        paddingVertical: 3,
        minWidth: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressText: {
        color: CARD_BACKGROUND,
        fontSize: 10,
        fontWeight: 'bold',
    },

    bookTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: TEXT_COLOR,
        textAlign: 'center',
        width: '100%',
        marginTop: 5,
    },
    bookAuthor: {
        fontSize: 12,
        color: SUBTITLE_COLOR,
        textAlign: 'center',
    },
    
    // Empty State
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    emptyStateText: {
        fontSize: 16,
        color: SUBTITLE_COLOR,
    },
});

export default MyBooksScreen;