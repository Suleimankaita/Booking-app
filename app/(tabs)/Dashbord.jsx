// import React from 'react';
// import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Dimensions } from 'react-native';
// // Note: You must have @expo/vector-icons installed for this code to run.
// import { AntDesign, Feather, Ionicons } from '@expo/vector-icons'; 

// const { width } = Dimensions.get('window');
// const SPACING = 16;
// // Calculate the width for the two-column metric grid
// const CARD_WIDTH = (width - 3 * SPACING) / 2;

// // --- MOCK DATA ---
// const ADMIN_METRICS = [
//     { id: 'm1', title: 'Total Books', value: '105', icon: 'book', color: '#5C6BC0' },
//     { id: 'm2', title: 'Active Users', value: '874', icon: 'users', color: '#4CAF50' },
//     { id: 'm3', title: 'New Signups (7d)', value: '45', icon: 'user-plus', color: '#FFB300' },
//     { id: 'm4', title: 'Pending Reviews', value: '12', icon: 'message-square', color: '#E53935' },
// ];

// const RECENT_BOOKS = [
//     { id: "1", title: "Rich Dad Poor Dad (1)", author: "R. Kiyosaki", genre: "Finance", status: 'Published' },
//     { id: "2", title: "Atomic Habits (2)", author: "J. Clear", genre: "Self-help", status: 'Reviewing' },
//     { id: "3", title: "The Alchemist (3)", author: "P. Coelho", genre: "Fiction", status: 'Published' },
//     { id: "4", title: "Harry Potter & The Philosopher's Stone (4)", author: "J. Rowling", genre: "Fantasy", status: 'Draft' },
// ];


// // =======================================================
// // === MAIN ADMIN DASHBOARD COMPONENT ======================
// // =======================================================

// export default function AdminDashboard() {

//     /**
//      * Component for displaying key metrics in small cards (Rendered inline for single component).
//      */
//     const MetricCard = ({ title, value, icon, color }) => (
//         <View style={styles.metricCard}>
//             <View style={[styles.metricIconContainer, { backgroundColor: color + '20' }]}>
//                 <Feather name={icon} size={24} color={color} />
//             </View>
//             <Text style={styles.metricTitle}>{title}</Text>
//             <Text style={[styles.metricValue, { color }]}>{value}</Text>
//         </View>
//     );

//     /**
//      * Component for managing individual books in a list (Rendered inline for single component).
//      */
//     const BookManagementItem = ({ item }) => (
//         <View style={styles.bookItemContainer}>
//             <View style={styles.bookDetails}>
//                 <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>
//                 <Text style={styles.bookAuthor}>by {item.author}</Text>
//             </View>
//             <View style={[
//                 styles.bookStatus,
//                 { backgroundColor: item.status === 'Published' ? '#4CAF50' : item.status === 'Reviewing' ? '#FFB300' : '#E0E0E0' }
//             ]}>
//                 <Text style={styles.bookStatusText}>{item.status}</Text>
//             </View>
//             <TouchableOpacity style={styles.actionButton}>
//                 <Feather name="edit" size={18} color="#5C6BC0" />
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.actionButton}>
//                 <Feather name="trash-2" size={18} color="#E53935" />
//             </TouchableOpacity>
//         </View>
//     );

//     return (
//         <View style={styles.safeArea}>
//             {/* Header (Simulated for Navigation/Branding) */}
//             {/* <View style={styles.header}>
//                 <Ionicons name="menu-outline" size={30} color="#333" />
//                 <Text style={styles.headerTitle}>Admin Panel</Text>
//                 <AntDesign name="setting" size={24} color="#5C6BC0" />
//             </View> */}

//             <ScrollView contentContainerStyle={styles.scrollContainer}>

//                 {/* 1. Key Metrics Section */}
//                 {/* <Text style={styles.sectionTitle}>Overview</Text> */}
//                 <View style={styles.metricsGrid}>
//                     {ADMIN_METRICS.map(metric => (
//                         <MetricCard key={metric.id} {...metric} />
//                     ))}
//                 </View>
                
//                 {/* --- Section Separator --- */}
//                 <View style={styles.mainSeparator} />


//                 {/* 2. Book Management Section */}
//                 <View style={styles.sectionHeader}>
//                     <Text style={styles.sectionTitle}>Book Management</Text>
//                     <TouchableOpacity style={styles.addButton}>
//                         <Feather name="plus-circle" size={18} color="#fff" />
//                         <Text style={styles.addButtonText}>Add New Book</Text>
//                     </TouchableOpacity>
//                 </View>

//                 <FlatList
//                     data={RECENT_BOOKS}
//                     keyExtractor={(item) => item.id}
//                     renderItem={({ item }) => <BookManagementItem item={item} />}
//                     scrollEnabled={false}
//                     ItemSeparatorComponent={() => <View style={styles.separator} />}
//                     ListEmptyComponent={() => <Text style={{textAlign: 'center', color: '#888'}}>No recent books to display.</Text>}
//                 />
                
//                 <TouchableOpacity style={styles.viewAllButton}>
//                     <Text style={styles.viewAllText}>View All Books (105) </Text>
//                 </TouchableOpacity>

//                 {/* --- Section Separator --- */}
//                 <View style={styles.mainSeparator} />

                
//                 {/* 3. User Management Section */}
//                 <View style={styles.sectionHeader}>
//                     <Text style={styles.sectionTitle}>User Management</Text>
//                     <TouchableOpacity style={styles.addButton}>
//                         <Feather name="search" size={18} color="#fff" />
//                         <Text style={styles.addButtonText}>Search Users</Text>
//                     </TouchableOpacity>
//                 </View>
                
//                 <View style={styles.userCard}>
//                     <Text style={styles.userStat}>Total Verified Users: 874</Text>
//                     <Text style={styles.userStat}>Users with High Activity: 154</Text>
//                     <TouchableOpacity style={[styles.viewAllButton, {alignItems: 'flex-start', marginTop: 15}]}>
//                         <Text style={styles.viewAllText}>Manage Users </Text>
//                     </TouchableOpacity>
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
//         backgroundColor: '#F5F5F5', // Light background for the dashboard
//     },
//     header: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         paddingHorizontal: SPACING,
//         paddingTop: 50, // For safe area/notch
//         paddingBottom: 15,
//         backgroundColor: '#fff',
//         borderBottomWidth: 1,
//         borderBottomColor: '#eee',
//     },
//     headerTitle: {
//         fontSize: 22,
//         fontWeight: 'bold',
//         color: '#333',
//     },
//     scrollContainer: {
//         padding: SPACING,
//         paddingBottom: 100, 
//     },
//     sectionTitle: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: '#333',
//         marginBottom: 10,
//     },
//     mainSeparator: {
//         height: 1,
//         backgroundColor: '#eee',
//         marginVertical: 25,
//     },
    
//     // --- Metrics Grid Styles ---
//     metricsGrid: {
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//         justifyContent: 'space-between',
//     },
//     metricCard: {
//         width: CARD_WIDTH,
//         backgroundColor: '#fff',
//         padding: 15,
//         borderRadius: 12,
//         marginBottom: SPACING,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//         elevation: 3,
//     },
//     metricIconContainer: {
//         width: 40,
//         height: 40,
//         borderRadius: 20,
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginBottom: 8,
//     },
//     metricTitle: {
//         fontSize: 14,
//         color: '#777',
//         marginTop: 5,
//     },
//     metricValue: {
//         fontSize: 24,
//         fontWeight: '900',
//         marginTop: 4,
//     },
    
//     // --- Management List Styles ---
//     sectionHeader: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: 15,
//         marginTop: 10,
//     },
//     addButton: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: '#5C6BC0',
//         paddingVertical: 6,
//         paddingHorizontal: 12,
//         borderRadius: 8,
//     },
//     addButtonText: {
//         color: '#fff',
//         fontSize: 13,
//         fontWeight: '600',
//         marginLeft: 5,
//     },
    
//     bookItemContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: '#fff',
//         paddingVertical: 15,
//         paddingHorizontal: 10,
//     },
//     bookDetails: {
//         flex: 1,
//     },
//     bookTitle: {
//         fontSize: 15,
//         fontWeight: '600',
//         color: '#333',
//     },
//     bookAuthor: {
//         fontSize: 13,
//         color: '#888',
//     },
//     bookStatus: {
//         paddingVertical: 4,
//         paddingHorizontal: 8,
//         borderRadius: 15,
//         marginHorizontal: 10,
//     },
//     bookStatusText: {
//         fontSize: 12,
//         fontWeight: '600',
//         color: '#fff',
//     },
//     actionButton: {
//         padding: 8,
//         marginLeft: 5,
//     },
//     separator: {
//         height: 1,
//         backgroundColor: '#f0f0f0',
//         marginHorizontal: 10,
//     },
//     viewAllButton: {
//         alignItems: 'flex-end',
//         marginTop: 10,
//         paddingRight: 10,
//     },
//     viewAllText: {
//         color: '#5C6BC0',
//         fontWeight: '600',
//     },

//     // --- User Card Styles ---
//     userCard: {
//         backgroundColor: '#fff',
//         padding: 20,
//         borderRadius: 12,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//         elevation: 3,
//     },
//     userStat: {
//         fontSize: 15,
//         color: '#333',
//         marginBottom: 8,
//     }
// });