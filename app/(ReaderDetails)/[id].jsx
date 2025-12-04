// screens/BookDetailsPage.js
import { useGetBooksQuery, useStartTrialMutation } from '@/components/api/Getslice';
import { uri } from '@/components/api/uri';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { usePaystack } from 'react-native-paystack-webview';
import Icon from 'react-native-vector-icons/Ionicons';

// Helper function to calculate remaining time in a readable format
const getRemainingTime = (endTime) => {
  if (!endTime) return null;
  const now = new Date();
  const difference = endTime.getTime() - now.getTime(); // Difference in milliseconds

  if (difference <= 0) {
    return { expired: true, text: 'Trial Expired' };
  }

  const totalSeconds = Math.floor(difference / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  // Return a readable string: e.g., "23h 45m left"
  if (hours > 0) {
    return { expired: false, text: `${hours}h ${minutes}m left` };
  } else {
    // Only display minutes if less than an hour remains
    return { expired: false, text: `${minutes}m left` };
  }
};


const BookDetailsPage = () => {
  const { id } = useLocalSearchParams();
  const [Trials, { isLoading: isStartingTrial, isSuccess }] = useStartTrialMutation();
  const router = useRouter();
  const { data, isLoading: isBooksLoading } = useGetBooksQuery('', {
    pollingInterval: 1000,
    refetchOnFocus: true,
    refetchOnReconnect: true
  });

  // Consolidated State for book data and access status
  const [book, setBook] = useState(null);
  // State for displaying remaining time (updated by an interval)
  const [timeRemaining, setTimeRemaining] = useState(null);
  const refr=Date.now();
    const { popup } = usePaystack();
    

  // 1. Load Book Data & Map MongoDB fields to state
  useEffect(() => {
    if (!data || isBooksLoading) return;

    const foundBook = data.find(res => res?._id === id);
    console.log(foundBook)
    if (foundBook) {
      // Map MongoDB fields to simplified state fields
      const trialEndsTime = foundBook.trialExpires?.$date || foundBook.trialExpires;

      setBook({
        ...foundBook,
        // Using MongoDB's field names: ispurchased, isFreeTrial, trialExpires
        isPurchased: foundBook?.isPurchased || false, 
        trialActive: foundBook.isFreeTrial || false, // Renamed to trialActive for clarity
        // Convert the MongoDB date string to a JS Date object
        trialEnds: trialEndsTime ? new Date(trialEndsTime) : null,
      });
    }
  }, [id, data, isBooksLoading]);

  // 2. Real-Time Trial Clock and Expiration Check
  useEffect(() => {
    let intervalId;

    if (book?.trialActive && book?.trialEnds) {
      // Start the interval to update the time every second
      intervalId = setInterval(() => {
        const remaining = getRemainingTime(book.trialEnds);
        setTimeRemaining(remaining);

        // If the trial has expired (time is zero or negative)
        if (remaining?.expired) {
          clearInterval(intervalId);
          // Trigger the expiration alert and state reset
          setBook(prev => ({ ...prev, trialActive: false, trialEnds: null }));
          Alert.alert(
            "Trial Ended",
            "Your free trial has expired. Please purchase the book to continue.",
            [{ text: "Buy Now", onPress: handlePurchase }]
          );
        }
      }, 1000);
    } else {
      setTimeRemaining(null); // Clear time display if trial is not active
    }

    // Cleanup function
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [book?.trialActive, book?.trialEnds]); // Depend on specific properties

  const handleStartTrial = async () => {
    if (isStartingTrial) return;

    try {
      // Note: The backend must return the updated book data (including new trialExpires)
      const res = await Trials({ userId: '6928356f57a6192347d3ee00', bookId: book?._id, BookName: book?.BookName, Username: "Suleiman" }).unwrap();
      console.log(res);

      // RTK Query polling interval will likely pick up the new trial status from the server
      // If the server doesn't return the updated book immediately, the polling will handle it.
      // We rely on the RTK refetch/polling to update the book state from the server.

    } catch (err) {
      alert(err?.message || "Failed to start trial.");
    }
  };

  // Optional: Immediate UI update after a successful trial start mutation (if server response is quick)
  useEffect(() => {
    if (isSuccess) {
      // Calculate 24 hours from the current time (this assumes your server also uses 24 hours)
      const trialEndTime = new Date();
      trialEndTime.setHours(trialEndTime.getHours() + 24); 

      setBook(prev => ({
        ...prev,
        trialActive: true,
        trialEnds: trialEndTime, 
        isPurchased: false,
      }));

      Alert.alert("Trial Started!", "You have 24 hours of reading access.");
    }
  }, [isSuccess]);

  const handlePurchase = () => {
    
        popup.checkout({
          email:'suleiman20015kaita@gmail.com',
          amount: Number(1000),
          reference:refr,
          invoice_limit: 3,
          subaccount: 'ACCT_iskhq4np3wpwy31',
        //   split_code: 'SPL_def456',
        //   split: {
        //     type: 'percentage',
        //     bearer_type: 'account',
        
        //   },
          metadata: {
            custom_fields: [
              {
                display_name: 'Order ID',
                variable_name: 'order_id',
                value: 'OID1234'
              }
            ]
          },
          onSuccess: async(res) => {
            if(res.status==="success"){
              console.log('Success:', res)

            }
            
          },
          onCancel: () => console.log('User cancelled'),
          onLoad: (res) => console.log('WebView Loaded:', res),
          onError: (err) => console.log('WebView Error:', err)
        });
      
  // payNow({amount:5665,email:"suleiman20015kaita@gmail.com"}) 
    // Alert.alert(
    //   "Initiate Payment",
    //   `Connecting to Paystack for a $${book?.price} purchase.`,
    //   [
    //     {
    //       text: "Cancel", style: "cancel"
    //     },
    //     {
    //       text: "Confirm Pay",
    //       onPress: () => {
    //         // Simulate successful purchase and reset trial status
    //         setBook(prev => ({ ...prev, isPurchased: true, trialActive: false, trialEnds: null }));
    //         Alert.alert("Success", "Book purchased! You now have full access.");
    //       }
    //     }
    //   ]
    // );
  };

  const handleReadBook = () => {
    router.push(`../Reader/${id}`);
  };

  // --- Render Logic ---

  if (!book) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={{ marginTop: 10 }}>Loading Book Details...</Text>
      </View>
    );
  }

  const handleBuy=()=>{
    
  }
  // Determine which button to show
  let actionButton;

  if (book?.isPurchased) {
    // STATE 1: Purchased
    actionButton = (
      <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#2ecc71' }]} onPress={handleReadBook}>
        <Icon name="book-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>Read Now</Text>
      </TouchableOpacity>
    );
  } else if (book.trialActive && timeRemaining && !timeRemaining.expired) {
    // STATE 2: Trial Active
    actionButton = (
      <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#f39c12' }]} onPress={handleReadBook}>
        <Icon name="timer-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>Trial Active ({timeRemaining.text})</Text>
      </TouchableOpacity>
    );
  }else if(book?.istrialend){
actionButton = (
     <TouchableOpacity style={[styles.actionButton, styles.buyButton]} onPress={handlePurchase}>
          <Icon name="cart-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Buy ${book?.price||1000}</Text>
        </TouchableOpacity>

    );
  } else {
    // STATE 3: No Access or Trial Expired
    const trialExpired = book.trialActive && timeRemaining?.expired;
    
    actionButton = (
      <View style={styles.buttonGroup}>
        <TouchableOpacity style={[styles.actionButton, styles.buyButton]} onPress={handlePurchase}>
          <Icon name="cart-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Buy ${book?.price}</Text>
        </TouchableOpacity>

        {/* Show Trial Button only if it hasn't expired (or if the state has been reset) */}
        <TouchableOpacity 
          style={[styles.actionButton, styles.trialButton]} 
          onPress={handleStartTrial} 
          disabled={isStartingTrial}
        >
          {isStartingTrial ? (
            <ActivityIndicator size="small" color="#3498db" />
          ) : (
            <>
              <Icon name="flash-outline" size={20} color="#3498db" />
              <Text style={[styles.buttonText, { color: '#3498db' }]}>24hr Trial</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Image
            source={{ uri: `${uri}/img/${book?.CoverImg}` }}
            style={styles.coverImage}
            resizeMode="contain" 
          />
          <Text style={styles.title}>{book.BookName || book.title}</Text>
          <Text style={styles.author}>By {book.author}</Text>
        </View>

        <View style={styles.descriptionBox}>
          <Text style={styles.sectionTitle}>Synopsis</Text>
          <Text style={styles.description}>{book.description}</Text>
        </View>

        <View style={styles.actionArea}>
          {actionButton}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#fff',
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#f5f5f5',
  },
  coverImage: {
    width: 200, 
    height: 300, 
    marginBottom: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    paddingHorizontal: 10,
  },
  author: {
    fontSize: 16,
    color: '#777',
    marginTop: 5,
    fontWeight: '500',
  },
  descriptionBox: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#555',
    textAlign: 'justify',
  },
  actionArea: {
    marginTop: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10, 
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal:20
  },
  buyButton: {
    backgroundColor: '#c0392b',
  },
  trialButton: {
    backgroundColor: '#eaf4ff',
    borderWidth: 1,
    borderColor: '#3498db',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
  }
});

export default BookDetailsPage;