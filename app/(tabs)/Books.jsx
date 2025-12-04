// import { Feather, Ionicons } from '@expo/vector-icons';
// import React, { useState } from 'react';
// import { Dimensions, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// const { width } = Dimensions.get('window');
// const SPACING = 16;
// const SCREEN_WIDTH = width - 2 * SPACING;

// // --- MOCK DATA ---
// const BOOK_STATUSES = ['All', 'Published', 'Draft', 'Pending Review'];

// // 10 Mock books with various statuses
// const MOCK_BOOKS = [
//     { id: "1", title: "Rich Dad Poor Dad", author: "R. Kiyosaki", genre: "Finance", status: 'Published', cover: 'https://covers.openlibrary.org/b/id/10521287-S.jpg' },
//     { id: "2", title: "Atomic Habits", author: "J. Clear", genre: "Self-help", status: 'Pending Review', cover: 'https://covers.openlibrary.org/b/id/9251746-S.jpg' },
//     { id: "3", title: "The Alchemist", author: "P. Coelho", genre: "Fiction", status: 'Published', cover: 'https://covers.openlibrary.org/b/id/8231994-S.jpg' },
//     { id: "4", title: "Harry Potter & The Philosopher's Stone", author: "J.K. Rowling", genre: "Fantasy", status: 'Draft', cover: 'https://covers.openlibrary.org/b/id/7984916-S.jpg' },
//     { id: "5", title: "48 Laws of Power", author: "R. Greene", genre: "Strategy", status: 'Published', cover: 'https://covers.openlibrary.org/b/id/240726-S.jpg' },
//     { id: "6", title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Fiction", status: 'Published', cover: 'https://covers.openlibrary.org/b/id/243764-S.jpg' },
//     { id: "7", title: "Moby Dick", author: "Herman Melville", genre: "Classic", status: 'Draft', cover: 'https://covers.openlibrary.org/b/id/245847-S.jpg' },
//     { id: "8", title: "Sapiens", author: "Yuval Noah Harari", genre: "History", status: 'Pending Review', cover: 'https://covers.openlibrary.org/b/id/8660993-S.jpg' },
//     { id: "9", title: "Dune", author: "Frank Herbert", genre: "Sci-Fi", status: 'Published', cover: 'https://covers.openlibrary.org/b/id/9721665-S.jpg' },
//     { id: "10", title: "The Lord of the Rings", author: "J.R.R. Tolkien", genre: "Fantasy", status: 'Published', cover: 'https://covers.openlibrary.org/b/id/10002890-S.jpg' },
// ];

// const getStatusColors = (status) => {
//     switch (status) {
//         case 'Published':
//             return { background: '#DCEBDE', text: '#4CAF50' }; // Light Green
//         case 'Pending Review':
//             return { background: '#FFF3E0', text: '#FF9800' }; // Light Orange
//         case 'Draft':
//             return { background: '#EEEEEE', text: '#9E9E9E' }; // Light Grey
//         default:
//             return { background: '#FFFFFF', text: '#333333' };
//     }
// };

// // =======================================================
// // === ADMIN BOOKS MANAGEMENT COMPONENT ====================
// // =======================================================

// export default function AdminBooksScreen() {
//     const [selectedStatus, setSelectedStatus] = useState('All');
//     const [searchText, setSearchText] = useState('');
//     const [books, setBooks] = useState(MOCK_BOOKS); // Use state to enable delete functionality

//     // --- Functionality Handlers ---

//     // Note: In a real app, these would typically navigate to a new screen or trigger an API call.
//     const handleAdd = () => {
//         console.log("FUNCTIONALITY ENABLED: Navigate to Add New Book screen or open modal.");
//         // Mock Add: Add a new dummy book to demonstrate functionality
//         const newBookId = String(books.length + 1);
//         const newBook = { id: newBookId, title: `New Book ${newBookId}`, author: "New Author", genre: "New Genre", status: 'Draft', cover: 'https://mock.url' };
//         setBooks([newBook, ...books]);
//     };

//     const handleEdit = (book) => {
//         console.log(`FUNCTIONALITY ENABLED: Navigate to Edit Book screen for: ${book.title} (ID: ${book.id})`);
//     };
    
//     const handleDelete = (bookId, bookTitle) => {
//         console.log(`FUNCTIONALITY ENABLED: Trigger confirmation modal to delete book: ${bookTitle} (ID: ${bookId})`);
//         // Mock Delete: Remove the book from the state array
//         setBooks(currentBooks => currentBooks.filter(book => book.id !== bookId));
//     };

//     // --- Filtering Logic ---
//     const filteredBooks = books.filter(book => {
//         // 1. Status Filter
//         const statusMatch = selectedStatus === 'All' || book.status === selectedStatus;
        
//         // 2. Search Filter
//         const searchLower = searchText.toLowerCase();
//         const searchMatch = book.title.toLowerCase().includes(searchLower) ||
//                             book.author.toLowerCase().includes(searchLower) ||
//                             book.genre.toLowerCase().includes(searchLower);

//         return statusMatch && searchMatch;
//     });

//     /**
//      * Renders a single book item in the management list.
//      */
//     const BookItem = ({ item }) => {
//         const colors = getStatusColors(item.status);

//         return (
//             <View style={styles.bookItemContainer}>
//                 {/* Book Cover */}
//                 <View style={styles.bookCoverMock}>
//                     <Text style={{color: '#fff', fontSize: 10}}>Cover</Text>
//                 </View>

//                 {/* Details */}
//                 <View style={styles.bookDetails}>
//                     <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
//                     <Text style={styles.bookAuthor}>by {item.author}</Text>
//                     <View style={styles.bookTags}>
//                         <Text style={styles.bookGenreTag}>{item.genre}</Text>
//                     </View>
//                 </View>

//                 {/* Status and Actions */}
//                 <View style={styles.bookActions}>
//                     <View style={[styles.bookStatusBadge, { backgroundColor: colors.background }]}>
//                         <Text style={[styles.bookStatusText, { color: colors.text }]}>{item.status}</Text>
//                     </View>
                    
//                     <View style={styles.actionButtonRow}>
//                         {/* Edit Button with ENABLED functionality */}
//                         <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionButton}>
//                             <Feather name="edit" size={20} color="#5C6BC0" />
//                         </TouchableOpacity>
//                         {/* Delete Button with ENABLED functionality */}
//                         <TouchableOpacity onPress={() => handleDelete(item.id, item.title)} style={styles.actionButton}>
//                             <Feather name="trash-2" size={20} color="#E53935" />
//                         </TouchableOpacity>
//                     </View>
//                 </View>
//             </View>
//         );
//     };

//     return (
//         <View style={styles.safeArea}>
            
//             {/* --- Re-integrated Header Content --- */}
//             <View style={styles.topControlsContainer}>
//                 <View style={styles.topControlsLeft}>
//                     {/* Back Button (Functionality enabled/logged) */}
//                     <TouchableOpacity onPress={() => console.log("FUNCTIONALITY ENABLED: Handle back navigation.")}>
//                         <Ionicons name="arrow-back" size={28} color="#333" />
//                     </TouchableOpacity>
//                     <Text style={styles.listTitle}>Manage Books ({filteredBooks.length})</Text>
//                 </View>
                
//                 {/* Add Button (Functionality enabled/logged) */}
//                 <TouchableOpacity onPress={handleAdd} style={styles.addButton}>
//                     <Feather name="plus-circle" size={20} color="#fff" />
//                     <Text style={styles.addButtonText}>Add</Text>
//                 </TouchableOpacity>
//             </View>
//             {/* ------------------------------------- */}
            
//             <ScrollView style={{flex: 1}}>
//                 <View style={styles.contentContainer}>
                    
//                     {/* 1. Search Bar */}
//                     <View style={styles.searchBar}>
//                         <Feather name="search" size={20} color="#9E9E9E" style={{ marginRight: 10 }} />
//                         <TextInput
//                             style={styles.searchInput}
//                             placeholder="Search by Title, Author, or Genre..."
//                             placeholderTextColor="#9E9E9E"
//                             value={searchText}
//                             onChangeText={setSearchText}
//                         />
//                     </View>

//                     {/* 2. Status Filter Tabs */}
//                     <FlatList
//                         data={BOOK_STATUSES}
//                         horizontal
//                         keyExtractor={(item) => item}
//                         showsHorizontalScrollIndicator={false}
//                         contentContainerStyle={styles.filterTabsContainer}
//                         renderItem={({ item }) => (
//                             <TouchableOpacity
//                                 onPress={() => setSelectedStatus(item)}
//                                 style={[
//                                     styles.filterButton,
//                                     selectedStatus === item && styles.filterButtonActive,
//                                 ]}
//                             >
//                                 <Text style={selectedStatus === item ? styles.filterTextActive : styles.filterText}>
//                                     {item}
//                                 </Text>
//                             </TouchableOpacity>
//                         )}
//                     />

//                     {/* 3. Book List */}
//                     <FlatList
//                         data={filteredBooks}
//                         keyExtractor={(item) => item.id}
//                         renderItem={({ item }) => <BookItem item={item} />}
//                         scrollEnabled={false}
//                         ItemSeparatorComponent={() => <View style={styles.separator} />}
//                         ListEmptyComponent={() => (
//                             <Text style={styles.emptyText}>No books match the current filters.</Text>
//                         )}
//                     />
//                 </View>
//             </ScrollView>
//         </View>
//     );
// }

// // =======================================================
// // === STYLESHEET ========================================
// // =======================================================

// const styles = StyleSheet.create({
//     safeArea: {
//         flex: 1,
//         backgroundColor: '#F5F5F5',
//         // Adjusted padding top since the original header was removed
//         paddingTop: 0, 
//     },
//     // NEW style for the re-integrated header content
//     topControlsContainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         paddingHorizontal: SPACING,
//         paddingTop: 20, // Reduced padding for aesthetic reasons after removing the large header
//         paddingBottom: 15,
//         backgroundColor: '#fff',
//         borderBottomWidth: 1,
//         borderBottomColor: '#eee',
//     },
//     topControlsLeft: {
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     listTitle: {
//         fontSize: 20,
//         fontWeight: 'bold',
//         color: '#333',
//         marginLeft: 10,
//     },
//     // The original 'header' style is no longer used but kept for comparison:
//     // header: { ... }, 
//     // headerTitle: { ... },

//     addButton: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: '#5C6BC0',
//         paddingVertical: 8,
//         paddingHorizontal: 10,
//         borderRadius: 8,
//     },
//     addButtonText: {
//         color: '#fff',
//         fontSize: 14,
//         fontWeight: '600',
//         marginLeft: 5,
//     },
//     contentContainer: {
//         paddingHorizontal: SPACING,
//         paddingBottom: 40,
//         backgroundColor: '#F5F5F5',
//     },

//     // --- Search Bar Styles ---
//     searchBar: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: '#fff',
//         paddingVertical: 10,
//         paddingHorizontal: 15,
//         borderRadius: 12,
//         marginTop: 15,
//         marginBottom: 10,
//         borderWidth: 1,
//         borderColor: '#E0E0E0',
//     },
//     searchInput: {
//         flex: 1,
//         color: '#333',
//         fontSize: 16,
//     },

//     // --- Filter Tabs Styles ---
//     filterTabsContainer: {
//         paddingVertical: 10,
//         marginBottom: 15,
//     },
//     filterButton: {
//         paddingVertical: 8,
//         paddingHorizontal: 15,
//         borderRadius: 20,
//         backgroundColor: '#E0E0E0',
//         marginRight: 10,
//     },
//     filterButtonActive: {
//         backgroundColor: '#5C6BC0',
//     },
//     filterText: {
//         color: '#333',
//         fontSize: 14,
//         fontWeight: '500',
//     },
//     filterTextActive: {
//         color: '#fff',
//         fontSize: 14,
//         fontWeight: '700',
//     },

//     // --- Book List Styles ---
//     bookItemContainer: {
//         flexDirection: 'row',
//         alignItems: 'flex-start',
//         backgroundColor: '#fff',
//         paddingVertical: 15,
//         paddingHorizontal: 10,
//     },
//     bookCoverMock: {
//         width: 50,
//         height: 70,
//         borderRadius: 6,
//         marginRight: 10,
//         backgroundColor: '#333',
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     bookDetails: {
//         flex: 1,
//         marginRight: 10,
//     },
//     bookTitle: {
//         fontSize: 15,
//         fontWeight: '700',
//         color: '#333',
//         marginBottom: 3,
//     },
//     bookAuthor: {
//         fontSize: 13,
//         color: '#666',
//         marginBottom: 5,
//     },
//     bookTags: {
//         flexDirection: 'row',
//     },
//     bookGenreTag: {
//         fontSize: 12,
//         color: '#5C6BC0',
//         backgroundColor: '#E8EAF6',
//         paddingHorizontal: 6,
//         paddingVertical: 2,
//         borderRadius: 4,
//         fontWeight: '500',
//     },
//     bookActions: {
//         alignItems: 'flex-end',
//         justifyContent: 'space-between',
//         height: 70,
//     },
//     bookStatusBadge: {
//         paddingVertical: 4,
//         paddingHorizontal: 8,
//         borderRadius: 15,
//         marginBottom: 5,
//     },
//     bookStatusText: {
//         fontSize: 11,
//         fontWeight: '700',
//     },
//     actionButtonRow: {
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     actionButton: {
//         padding: 5,
//         marginLeft: 5,
//     },
//     separator: {
//         height: 1,
//         backgroundColor: '#f0f0f0',
//         marginHorizontal: 10,
//     },
//     emptyText: {
//         textAlign: 'center',
//         color: '#888',
//         marginTop: 40,
//         fontSize: 16,
//     }
// });