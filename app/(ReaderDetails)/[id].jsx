import { useGetBooksQuery, useStartTrialMutation ,usePurchasedBookMutation} from '@/components/api/Getslice';
import { uri } from '@/components/api/uri';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { usePaystack } from 'react-native-paystack-webview';
import Icon from 'react-native-vector-icons/Ionicons';
import SkeletonLoader from 'expo-skeleton-loader';
import { getuserfound } from '@/components/Funcslice';
import { useSelector } from 'react-redux';
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
  const user=useSelector(getuserfound)
  const { id } = useLocalSearchParams();
  const [Trials, { isLoading: isStartingTrial, isSuccess ,error,isError}] = useStartTrialMutation();
  const router = useRouter();
  const { data, isLoading: isBooksLoading } = useGetBooksQuery(user?.id, {
    pollingInterval: 1000,
    refetchOnFocus: true,
    refetchOnReconnect: true
  });

  useEffect(()=>{
    if(isError){
      alert(error.data?.message)
    }
  },[isError,error])

  const [Purchased,{isLoading:AddLoadingBook}]=usePurchasedBookMutation()
  const [book, setBook] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const refr=Date.now();
    const { popup } = usePaystack();
    const [loader,setloader]=useState(false)
    

    useEffect(()=>{
      setloader(true)
      setTimeout(() => {
      setloader(false)
        
      }, 2000);
      return()=> setloader(false)
    },[])

    const [price,setprice]=useState(0)

  useEffect(() => {
    if (!data || isBooksLoading) return;

    const foundBook = data.find(res => res?._id === id);
    console.log(foundBook)
    if (foundBook) {
      const trialEndsTime = foundBook.trialExpires?.$date || foundBook.trialExpires;
      setprice(foundBook?.price)
      setBook({
        ...foundBook,
        isPurchased: foundBook?.isPurchased || false, 
        trialActive: foundBook.isFreeTrial || false, 
        trialEnds: trialEndsTime ? new Date(trialEndsTime) : null,
      });
    }
  }, [id, data, isBooksLoading]);

  useEffect(() => {
    let intervalId;

    if (book?.trialActive && book?.trialEnds) {
      intervalId = setInterval(() => {
        const remaining = getRemainingTime(book.trialEnds);
        setTimeRemaining(remaining);

        if (remaining?.expired) {
          clearInterval(intervalId);
          setBook(prev => ({ ...prev, trialActive: false, trialEnds: null }));
          Alert.alert(
            "Trial Ended",
            "Your free trial has expired. Please purchase the book to continue.",
            [{ text: "Buy Now", onPress: handlePurchase }]
          );
        }
      }, 1000);
    } else {
      setTimeRemaining(null);     }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [book?.trialActive, book?.trialEnds]); // Depend on specific properties

  const handleStartTrial = async () => {
    if (isStartingTrial) return;

    try {
      const res = await Trials({ userId: user?.id, bookId: book?._id, BookName: book?.BookName, Username: user?.username}).unwrap();
      console.log(res);


    } catch (err) {
      
      alert(err?.message || "Failed to start trial.");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      const trialEndTime = new Date();
      trialEndTime.setHours(trialEndTime.getHours() + 24); 

      setBook(prev => ({
        ...prev,
        trialActive: true,
        trialEnds: trialEndTime, 
        isPurchased: false,
      }));

      // Alert.alert("Trial Started!", "You have 24 hours of reading access.");
    }
  }, [isSuccess]);

  const handlePurchase = async() => {
    await Purchased({ description:book?.description,Author:book?.Author,id: user?.id,BookName: book?.BookName, Username: user?.username,price:book?.price,CoverImg:book?.CoverImg,EpubUri:book?.EpubUri}).unwrap();
    
                
        popup.checkout({
          email:'suleiman20015kaita@gmail.com',
          amount: Number(price),
          reference:refr,
          invoice_limit: 3,
          subaccount: 'ACCT_iskhq4np3wpwy31',
          metadata: {
        
          },
          onSuccess: async(res) => {
            try{

              if(res.status==="success"){
                console.log('Success:', res)
    await Purchased({ description:book?.description,Author:book?.Author,id: user?.id,BookName: book?.BookName, Username: user?.username,price:book?.price,CoverImg:book?.CoverImg,EpubUri:book?.EpubUri}).unwrap();
                
              }
            }catch(err){
              alert(err?.message)
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
  }
   else if (book.trialActive && timeRemaining && !timeRemaining.expired) {
   
    actionButton = (
      <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#2ecc71' }]} onPress={handleReadBook}>
        <Icon name="book-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>Read Now</Text>
      </TouchableOpacity>
    );
    // STATE 2: Trial Active
    // actionButton = (
    //   <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#f39c12' }]} onPress={handleReadBook}>
    //     <Icon name="timer-outline" size={20} color="#fff" />
    //     <Text style={styles.buttonText}>Trial Active ({timeRemaining.text})</Text>
    //   </TouchableOpacity>
    // );
  }else if(book?.istrialend){
actionButton = (
     <TouchableOpacity style={[styles.actionButton, styles.buyButton]} onPress={handlePurchase}>
          <Icon name="cart-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Buy ₦{book?.price}</Text>
        </TouchableOpacity>

    );
  } else {
    // STATE 3: No Access or Trial Expired
    const trialExpired = book.trialActive && timeRemaining?.expired;
     actionButton = (
      <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#2ecc71' }]} onPress={handleStartTrial}>
        <Icon name="book-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>Read Now</Text>
      </TouchableOpacity>
    );
    // actionButton = (
    //   <View style={styles.buttonGroup}>
    //     <TouchableOpacity style={[styles.actionButton, styles.buyButton]} onPress={handlePurchase}>
    //       <Icon name="cart-outline" size={20} color="#fff" />
    //       <Text style={styles.buttonText}>Buy ₦{book?.price}</Text>
    //     </TouchableOpacity>

    //     <TouchableOpacity 
    //       style={[styles.actionButton, styles.trialButton]} 
    //       onPress={handleStartTrial} 
    //       disabled={isStartingTrial}
    //     >
    //       {isStartingTrial ? (
    //         <ActivityIndicator size="small" color="#3498db" />
    //       ) : (
    //         <>
    //           <Icon name="flash-outline" size={20} color="#3498db" />
    //           <Text style={[styles.buttonText, { color: '#3498db' }]}>24hr Trial</Text>
    //         </>
    //       )}
    //     </TouchableOpacity>
    //   </View>
    // );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Image
            source={{ uri: `${uri}/img/${book?.CoverImg}` }}
            style={styles.coverImage}
            resizeMode="cover" 
          />
          <Text style={styles.title}>{book.BookName || book.title}</Text>
          <Text style={styles.author}>By {book.author}</Text>
        </View>

        <View style={styles.descriptionBox}>
          <Text style={styles.sectionTitle}>Synopsis</Text>
          <Text style={styles.description}>{book.description}</Text>
        </View>

        <View style={styles.actionArea}>
          {!loader?(actionButton):(
            <SkeletonLoader boneColor="#e6e6e6" highlightColor="#f2f2f2">
              <SkeletonLoader.Item style={{width:150,height:50,borderRadius:10}}>

              </SkeletonLoader.Item>
            </SkeletonLoader>
          )}
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
    paddingBottom: 20,
    backgroundColor: '#f5f5f5',
  },
  coverImage: {
    width: "100%", 
    height: 300, 
    marginBottom: 15,
    // borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    // top:'-5%',
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