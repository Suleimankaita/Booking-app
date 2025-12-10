import { useGetBooksQuery,useUpdateBookPageMutation,useRemoveBookmarkMutation } from '@/components/api/Getslice';
import { uri } from '@/components/api/uri';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 🆕 Import AsyncStorage
import { router, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, FlatList, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import WebView from 'react-native-webview';
import { getuserfound, setUserfound } from '@/components/Funcslice';
import { useSelector } from 'react-redux';
// --- CONFIGURATION ---
// const EPUB_FILE_URL = 'https://s3.amazonaws.com/moby-dick/moby-dick.epub'; 
const BOOKMARKS_STORAGE_KEY = '@EpubReader:Bookmarks'; // 🆕 Key for AsyncStorage
const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;

// --- THEME DEFINITIONS ---
// --- FONT SIZE CONFIGURATION (Used for Epub.js styling) ---
const FONT_SIZES = [80, 100, 120, 140, 160]; // Percentage values
const DEFAULT_FONT_SIZE_INDEX = 2; // 120%
const lightStyles = { 
    background: '#FDF8F0',
    text: '#333333',
    primary: '#5C6BC0', 
    border: '#E0E0E0',
    tocBackground: '#F7F3E6',
    shadow: '#AAAAAA',
}; 
const darkStyles = { 
    background: '#1A1A1A', 
    text: '#F0F0F0', 
    primary: '#7986CB',
    border: '#333333',
    tocBackground: '#2A2A2A',
    shadow: '#000000',
};


const EpubReader = () => {
    const user=useSelector(getuserfound)
    const {data,isLoading,isError,error}=useGetBooksQuery(user?.id,{
        refetchOnReconnect:true,
        pollingInterval:1000
    })
    const [Save]=useUpdateBookPageMutation()
    const [Del]=useUpdateBookPageMutation()
    const {id}=useLocalSearchParams()
    const [EPUB_FILE_URL,setEPUB_FILE_URL]=useState(null)
    const webviewRef = useRef(null);
    const scrollRef = useRef(null); 
    const isScrolling = useRef(false);

    const [currentCfi, setCurrentCfi] = useState(''); 
    const [theme, setTheme] = useState('light');
    const [title, setTitle] = useState('Loading Book...');
    const [author, setAuthor] = useState('');
    const [toc, setToc] = useState([]);
    const [isControlsVisible, setIsControlsVisible] = useState(true); 
    const [isTocVisible, setIsTocVisible] = useState(false);
    const [isBookmarkModalVisible, setIsBookmarkModalVisible] = useState(false);
    // --- STATE FOR FONT, BOOKMARK, AND PROGRESS (Global) ---
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentChapterTitle, setCurrentChapterTitle] = useState('...');
    const [fontSizeIndex, setFontSizeIndex] = useState(DEFAULT_FONT_SIZE_INDEX);
    
    // Bookmarks are now objects containing the cfi, chapter title, and page info for display
    const [bookmarks, setBookmarks] = useState([]); 
    
    const [lastReadCfi, setLastReadCfi] = useState(null); 

    const [globalProgress, setGlobalProgress] = useState(0); 
    
    // 🆕 State for Text-to-Speech
    const [isSpeaking, setIsSpeaking] = useState(false); 

    const controlsAnim = useRef(new Animated.Value(1)).current; 
    
    const[bookss,setBookss]=useState({})
    
    useEffect(()=>{
        if(!data)return 
        const find=data.find(res=>res._id===id)
        if(find){
            setBookss(find)
            // console.log(find?.cfi)
            // const loadedBookmarks = JSON.parse(datas);
            console.log(bookss?.mt)
                setBookmarks(find?.BookMarks);
                setLastReadCfi(find?.cfi);
                
            setEPUB_FILE_URL(`${uri}/uploads/${find?.EpubUri}`)
        }
    },[data,id])

    // 🆕 Function to stop speech whenever the component unmounts or state changes
    useEffect(() => {
        return () => {
            if (Speech.isSpeakingAsync()) {
                Speech.stop();
            }
        };
    }, []);

    // --- 🆕 AsyncStorage Functions ---
    const loadBookmarks = useCallback(async () => {
        try {

            
            const datas = await AsyncStorage.getItem(BOOKMARKS_STORAGE_KEY);
            if (datas !== null) {

                const loadedBookmarks = JSON.parse(datas);
                // setBookmarks(loadedBookmarks);
                // Set the last read position to the latest bookmark for resuming
                if (loadedBookmarks.length > 0) {
                    const latestBookmark = loadedBookmarks[loadedBookmarks.length - 1];
                    // setLastReadCfi(latestBookmark.cfi);
                }
            }
        } catch (e) {
            console.error('Failed to load bookmarks from AsyncStorage:', e);
        }
    }, []);

    const saveBookmarks = useCallback(async (newBookmarks) => {
        try {
            if(!newBookmarks&&!bookss)return

            console.log(21)
            await Save({cfi:currentCfi,progress:globalProgress,BookName:bookss?.BookName,id})

            // await Save({cfi:newBookmarks[0]?.cfi,progress:globalProgress,BookName:bookss?.BookName})
            // await AsyncStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(newBookmarks));
        } catch (e) {
            console.error('Failed to save bookmarks to AsyncStorage:', e);
        }
    }, []);
    
    // --- Initial Load Effect (Load Bookmarks and ScrollView) ---
    useEffect(() => {
        // 1. Load bookmarks on startup
        loadBookmarks();

        // 2. Scroll to the middle page (Page 2 out of 3) on load
        const timer = setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTo({ x: WINDOW_WIDTH, animated: false });
            }
        }, 50); 
        return () => clearTimeout(timer);
    }, [loadBookmarks]); // loadBookmarks is now a dependency

    // --- Save Bookmarks on State Change Effect ---
    // useEffect(() => {
    //     // Save bookmarks whenever the state changes
    //     if(!bookss)return
        
    //     // saveBookmarks(bookmarks);
            
    //     console.log(232,bookmarks)
    //     // const ms=async()=>{
    //     //     // await Save({cfi:currentCfi,progress:globalProgress,BookName:bookss?.BookName})

    //     // }
    //     // ms()
    // }, [saveBookmarks]);

    // 🆕 Effect to display the last read position when the WebView loads
    useEffect(() => {
        if (lastReadCfi && title !== 'Loading Book...') {
            // Only navigate if the book has actually loaded (title changed from default)
            goToCfi(lastReadCfi);
            setLastReadCfi(null); 
        }
    }, [lastReadCfi, title]);


    const injectJS = useCallback((script) => {
        webviewRef.current?.injectJavaScript(script);
    }, []);
    
    // 🆕 Function to retrieve text and speak it
    const toggleSpeech = useCallback(() => {
        if (isSpeaking) {
            Speech.stop();
            setIsSpeaking(false);
            // 🆕 Clear highlights when stopping
            injectJS(`window.clearHighlights(); true;`); 
            return;
        }

        // 1. Inject JavaScript to get the text content and structure for highlighting
        injectJS(`
            try {
                // Get the text content from the iframe's body (where epubjs renders the chapter)
                const iframe = document.querySelector('iframe');
                if (iframe) {
                    // This is a placeholder for actual sentence extraction/CFI generation.
                    // For now, we only extract the innerText for speech. 
                    // To implement real highlighting, this would need to return an array of {text: string, cfi: string}
                    const chapterText = iframe.contentDocument.body.innerText;
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'chapterText',
                        text: chapterText
                    }));
                }
            } catch (e) {
                console.error("Error getting chapter text:", e);
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: 'Failed to extract text.' }));
            }
            true;
        `);
        // The rest of the logic is handled in onMessage once the text is received
    }, [isSpeaking, injectJS]);

    const toggleControls = useCallback((forceShow = false) => {
        setIsControlsVisible(prev => {
            const nextState = forceShow ? true : !prev;
            Animated.timing(controlsAnim, {
                toValue: nextState ? 1 : 0,
                duration: 300,
                easing: Easing.ease,
                useNativeDriver: true,
            }).start();
            return nextState;
        });
    }, [controlsAnim]);

    // **Horizontal Paging Logic**
    const handleNextChapter = useCallback(() => {
        if (isScrolling.current) return;
        isScrolling.current = true;
        injectJS(`rendition.next(); true;`);
        setTimeout(() => {
            scrollRef.current?.scrollTo({ x: WINDOW_WIDTH, animated: false });
            isScrolling.current = false;
        }, 100); 
        // 🆕 Stop speech and clear highlights on chapter change
        if (isSpeaking) Speech.stop();
        setIsSpeaking(false);
        injectJS(`window.clearHighlights(); true;`);
    }, [injectJS, isSpeaking]);

    const handlePrevChapter = useCallback(() => {
        if (isScrolling.current) return;
        isScrolling.current = true;
        injectJS(`rendition.prev(); true;`);
        setTimeout(() => {
            scrollRef.current?.scrollTo({ x: WINDOW_WIDTH, animated: false });
            isScrolling.current = false;
        }, 100);
        // 🆕 Stop speech and clear highlights on chapter change
        if (isSpeaking) Speech.stop();
        setIsSpeaking(false);
        injectJS(`window.clearHighlights(); true;`);
    }, [injectJS, isSpeaking]);

    const goToCfi = useCallback((cfi) => {
        injectJS(`rendition.display('${cfi}'); true;`);
        setIsTocVisible(false);
        setIsBookmarkModalVisible(false);
        toggleControls(true); 
        // 🆕 Stop speech and clear highlights on manual navigation
        if (isSpeaking) Speech.stop();
        setIsSpeaking(false);
        injectJS(`window.clearHighlights(); true;`);
    }, [injectJS, toggleControls, isSpeaking]); 

    // Function to add/remove a dynamic bookmark
    const toggleBookmark = useCallback(async() => {
        if (!currentCfi || !currentChapterTitle) return;
        //  saveBookmarks(bookmarks);

        // console.log("Curent",currentCfi)
        setBookmarks(prevBookmarks => {
            // Check if a bookmark at the EXACT CFI already exists
            const existingIndex = prevBookmarks.findIndex(b => b.cfi === currentCfi);
            
            
            if (existingIndex !== -1) {
                // Remove bookmark
                const newBookmarks = [...prevBookmarks];
                newBookmarks.splice(existingIndex, 1);
                return newBookmarks;
            } else {
                // Add new bookmark
                const newBookmark = {
                    id: Date.now().toString(),
                    cfi: currentCfi,
                    chapter: currentChapterTitle,
                    pageInfo: `Page ${currentPage} of ${totalPages}`,
                    progress: Math.round(globalProgress),
                    date: new Date().toLocaleTimeString(),
                };
                // 🆕 Always add the new bookmark as the last element for 'Resume Reading' logic
                return [...prevBookmarks.filter(b => b.cfi !== currentCfi), newBookmark];
            }
        });
            await Save({cfi:currentCfi,progress:globalProgress,BookName:bookss?.BookName,id,mt:bookss?.mt})

    }, [currentCfi, currentChapterTitle, currentPage, totalPages, globalProgress]);

    const deleteBookmark = useCallback(async(id) => {
        await Del({id,BookName:bookss?.BoolName})
        setBookmarks(prevBookmarks => prevBookmarks.filter(b => b.id !== id));

    }, []);
    
    // Helper function to handle font size change
    const handleFontSizeChange = (direction) => {
        setFontSizeIndex(prevIndex => {
            let newIndex = prevIndex;
            if (direction === 'increase' && prevIndex < FONT_SIZES.length - 1) {
                newIndex = prevIndex + 1;
            } else if (direction === 'decrease' && prevIndex > 0) {
                newIndex = prevIndex - 1;
            }
            injectJS(`window.setFontSize('${FONT_SIZES[newIndex]}%'); true;`);
            return newIndex;
        });
    };

    // Helper function to toggle theme
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        injectJS(`window.setTheme('${newTheme}'); true;`);
    };


    // --- Horizontal Scroll Handler for Pagination ---
    const handleScrollEnd = useCallback((event) => {
        const offsetX = event.nativeEvent.contentOffset.x;

        if (isScrolling.current) return;
        
        // If scrolled fully left (or past halfway of the first page), go to previous chapter/page
        if (offsetX < WINDOW_WIDTH * 0.5) {
            handlePrevChapter(); 
        // If scrolled fully right (or past halfway of the third page), go to next chapter/page
        } else if (offsetX > WINDOW_WIDTH * 1.5) {
            handleNextChapter();
        } else if (offsetX !== WINDOW_WIDTH) {
            // Reset scroll position to center if swipe failed or was incomplete
            scrollRef.current?.scrollTo({ x: WINDOW_WIDTH, animated: true });
        }
        
        // Ensure controls flash when interaction stops
        toggleControls(true); 
    }, [handlePrevChapter, handleNextChapter, toggleControls]);
    
    // --- WebView to RN (Receiving Data) ---

    const onMessage = useCallback(async (event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            
            switch (data.type) {
                case 'pageInfo':
                    setCurrentPage(data.page || 0);
                    setTotalPages(data.total || 0);
                    setCurrentCfi(data.cfi || '');
                    
                    if (data.progress !== undefined) {
                        setGlobalProgress(data.progress); // 🔑 Update global progress
                    }
                    break;
                case 'chapterTitle':
                    setCurrentChapterTitle(data.title || 'Chapter');
                    break;
                case 'loaded':
                    setTitle(data.title);
                    setAuthor(data.author || 'Unknown Author');
                    setToc(data.toc);
                    // Set initial theme/styles/font
                    injectJS(`window.setTheme('${theme}'); window.setFontSize('${FONT_SIZES[fontSizeIndex]}%'); true;`); 
                    break;
                case 'toggleControls':
                    if (!isTocVisible && !isBookmarkModalVisible) {
                        toggleControls();
                    }
                    break;
                // 🆕 New case to handle chapter text received from WebView
                case 'chapterText':
                    if (data.text) {
                        const chapterText = data.text.trim();
                        
                        if (chapterText.length > 0) {
                            setIsSpeaking(true);
                            // ⚠️ NOTE: Since expo-speech does not expose sentence/word boundary events,
                            // real-time highlighting is not possible without splitting the text 
                            // manually and setting timeouts, which breaks sync.
                            // However, we set the speaking state and call the speak function.
                            
                            const options = {
                                language: 'en-US', // Assuming Moby Dick is English
                                pitch: 1.0,
                                rate: 1.0,
                                onDone: () => {
                                    setIsSpeaking(false);
                                    // Clear highlights when finished
                                    injectJS(`window.clearHighlights(); true;`); 
                                }, 
                                onError: () => {
                                    setIsSpeaking(false); 
                                    injectJS(`window.clearHighlights(); true;`);
                                },
                                // 🛑 The following onBoundary/onMark is available only in web implementation, not RN.
                                // onBoundary: (event) => {
                                //     if (event.name === 'sentence') {
                                //         const sentence = event.text; 
                                //         // 💡 IN A REAL APP, you would look up the CFI for this sentence
                                //         // and call: injectJS(`window.highlightCfi('the_cfi_here');`);
                                //         // Since we don't have the CFI here, highlighting is structural only.
                                //     }
                                // }
                            };
                            Speech.speak(chapterText, options);
                        } else {
                            setIsSpeaking(false);
                            injectJS(`window.clearHighlights(); true;`);
                        }
                    } else {
                        setIsSpeaking(false);
                        injectJS(`window.clearHighlights(); true;`);
                    }
                    break;
                default:
                    break;
            }
        } catch (e) {
            console.error('Error processing WebView message:', e);
        }
    }, [injectJS, theme, isTocVisible, isBookmarkModalVisible, toggleControls, fontSizeIndex]);
    
    const currentStyles = theme === 'light' ? lightStyles : darkStyles;
    
    // Check if the current CFI is bookmarked (using the full CFI for exact match)
    const isCurrentChapterBookmarked = bookmarks.some(b => b.cfi === currentCfi);


    // --- Progress Calculation for UI ---
    // 🔑 globalProgress is a number from 0 to 100. Convert it to a ratio (0 to 1) for the bar width.
    const progress = globalProgress / 100;
    
    // Updated text to show global percentage and current chapter page/total
    const progressText = (currentPage > 0 && totalPages > 0)
        ? `Page ${currentPage} of ${totalPages} (Total: ${Math.round(globalProgress)}%)`
        : `Total: ${Math.round(globalProgress)}%`;

    // --- RENDER ---
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: currentStyles.background }]}>
            
            {/* 🔝 HEADER CONTROLS OVERLAY */}
            <Animated.View style={[
                styles.controlsOverlay,
                {}, 
                { opacity: controlsAnim, pointerEvents: isControlsVisible ? 'auto' : 'none' } 
            ]}>
                
                <View style={[styles.header, { 
                    backgroundColor: currentStyles.background + 'e0', 
                    borderBottomColor: currentStyles.border,
                    shadowColor: currentStyles.shadow,
                }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerIcon}>
                        <Text style={[styles.iconText, { color: currentStyles.primary, fontSize: 16 }]}>{'< Back'}</Text>
                    </TouchableOpacity>

                    <Text style={[styles.titleText, { color: currentStyles.text }]} numberOfLines={1}>
                        {title}
                    </Text>

                    <TouchableOpacity onPress={() => setIsTocVisible(true)} style={styles.headerIcon}>
                        <Text style={[styles.iconText, { color: currentStyles.primary, fontSize: 24, fontWeight: 'bold' }]}>☰</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
            
            {/* --- MAIN HORIZONTAL PAGING SCROLLVIEW --- */}
            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                onMomentumScrollEnd={handleScrollEnd}
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                contentContainerStyle={{ width: WINDOW_WIDTH * 3, zIndex: 0 }}
                style={{ flex: 1 }} 
            >
                {/* 1. Previous Page Placeholder */}
                <View style={[styles.scrollPagePlaceholder, { backgroundColor: currentStyles.background }]} />

                {/* 2. Current Page (The actual WebView content) */}
                <View style={styles.scrollPageContent}>
                    <WebView
                        ref={webviewRef}
                        source={{ html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
            <style>
                body { margin: 0; padding: 0; height: 100vh; width: 100vw; overflow: hidden; }
                #viewer { width: 100%; height: 100%; }
                iframe { pointer-events: none; } 
                iframe body { overflow-y: scroll !important; } 
                #viewer { font-size: ${FONT_SIZES[DEFAULT_FONT_SIZE_INDEX]}%; } 
                
                /* 🆕 Highlight style */
                .tts-highlight { 
                    background-color: ${currentStyles.primary + '60'} !important;
                    transition: background-color 0.3s;
                } 
            </style>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.5/jszip.min.js"></script>
            <script src="https://cdn.jsdelivr.net/npm/epubjs/dist/epub.min.js"></script>
        </head>
        <body>
            <div id="viewer"></div>
            <script>
                var book = ePub("${EPUB_FILE_URL}");
                var rendition;
                // 🆕 Global variable to hold current highlight ID
                var currentMark;

                book.ready.then(() => {
                    rendition = book.renderTo("viewer", {
                        width: "100%", 
                        height: "100%",
                        spread: "none", 
                        flow: "scrolled-doc" 
                    });
                    
                    rendition.display();

                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'loaded',
                        title: book.packaging.metadata.title,
                        author: book.packaging.metadata.creator,
                        toc: book.navigation.toc.map(item => ({ label: item.label, cfi: item.href }))
                    }));

                    rendition.on("relocated", (location) => {
                        const pageData = {
                            type: 'pageInfo',
                            cfi: location.start.cfi
                        };

                        if (location.start.location && location.start.total) {
                            pageData.page = location.start.location;
                            pageData.total = location.start.total;
                        }

                        // 🔑 The critical part for the progress bar: calculate global percentage from CFI
                        const globalPercentage = book.locations.percentageFromCfi(location.start.cfi) * 100;
                        pageData.progress = globalPercentage;

                        window.ReactNativeWebView.postMessage(JSON.stringify(pageData));

                        if (location.start.chapter) {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'chapterTitle',
                                title: location.start.chapter.label
                            }));
                        }
                    });
                    
                    window.setFontSize = (size) => { rendition.themes.fontSize(size); };

                    window.setTheme = (themeName) => {
                        const themeStyles = themeName === 'dark' 
                            ? { background: '${darkStyles.background}', foreground: '${darkStyles.text}' }
                            : { background: '${lightStyles.background}', foreground: '${lightStyles.text}' };

                        rendition.themes.override('background', themeStyles.background);
                        rendition.themes.override('color', themeStyles.foreground);
                    };
                    
                    // 🆕 Function to highlight a CFI span
                    window.highlightCfi = (cfi) => {
                        window.clearHighlights(); 
                        currentMark = rendition.annotations.mark(cfi, {}, (e) => {}, 'tts-highlight');
                    };

                    // 🆕 Function to clear the current highlight
                    window.clearHighlights = () => {
                        if (currentMark) {
                            rendition.annotations.remove(currentMark, 'mark');
                            currentMark = null;
                        }
                    };

                    document.addEventListener('click', (e) => {
                        const x = e.clientX;
                        const screenWidth = window.innerWidth;
                        
                        // Toggle controls on center click
                        if (x > screenWidth * 0.3 && x < screenWidth * 0.7) {
                            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'toggleControls' }));
                        }
                    });

                }).catch(err => {
                    console.error("EPUB Loading Error:", err);
                });
                
                // 🔑 Generate locations for accurate progress tracking
                book.ready.then(() => {
                    return book.locations.generate(600); 
                }).then(() => {
                    console.log("Locations generated for progress tracking.");
                }).catch(err => {
                    console.error("Location generation error:", err);
                });
            </script>
        </body>
        </html>
    ` }}
                        originWhitelist={['*']}
                        onMessage={onMessage}
                        javaScriptEnabled={true}
                        allowFileAccess={true}
                        style={{ flex: 1, backgroundColor: currentStyles.background }}
                        scalesPageToFit={false}
                    />
                </View>

                {/* 3. Next Page Placeholder */}
                <View style={[styles.scrollPagePlaceholder, { backgroundColor: currentStyles.background }]} />
            </ScrollView>

            {/* ⬇️ FOOTER CONTROLS OVERLAY */}
            <Animated.View style={[
                styles.footerControlsOverlay,
                { opacity: controlsAnim, pointerEvents: isControlsVisible ? 'auto' : 'none' } 
            ]}>
                <View style={[styles.footer, { 
                    backgroundColor: currentStyles.background + 'e0', 
                    borderTopColor: currentStyles.border,
                    shadowColor: currentStyles.shadow,
                }]}>
                    {/* PROGRESS BAR & PAGE NUMBERS (Enabled) */}
                    <View style={styles.progressContainer}>
                        {/* Current Chapter Title */}
                        <Text style={[styles.chapterTitleText, { color: currentStyles.text }]} numberOfLines={1}>
                            {currentChapterTitle}
                        </Text>
                        {/* Progress Bar */}
                        <View style={[styles.progressBarBase, { backgroundColor: currentStyles.border }]}>
                            {/* 🔑 This is driven by the 'progress' (globalProgress / 100) state */}
                            <View style={[styles.progressBarFill, { 
                                width: `${progress * 100}%`, 
                                backgroundColor: currentStyles.primary 
                            }]} />
                        </View>
                        {/* Page Numbers / Progress % */}
                        <Text style={[styles.progressText, { color: currentStyles.text + '90' }]}>
                           {progressText}
                        </Text>
                    </View>

                    {/* ACTION BUTTONS */}
                    <View style={styles.footerActions}>
                        {/* Font Decrease */}
                        <TouchableOpacity 
                            style={[styles.footerNavButton]} 
                            onPress={() => handleFontSizeChange('decrease')}
                            disabled={fontSizeIndex === 0}
                        >
                            <Text style={[styles.footerNavIcon, { color: currentStyles.text, opacity: fontSizeIndex === 0 ? 0.4 : 1 }]}>A-</Text>
                            <Text style={[styles.footerNavText, { color: currentStyles.text }]}>Size</Text>
                        </TouchableOpacity>
                        
                        {/* Font Increase */}
                        <TouchableOpacity 
                            style={[styles.footerNavButton]} 
                            onPress={() => handleFontSizeChange('increase')}
                            disabled={fontSizeIndex === FONT_SIZES.length - 1}
                        >
                            <Text style={[styles.footerNavIcon, { color: currentStyles.text, opacity: fontSizeIndex === FONT_SIZES.length - 1 ? 0.4 : 1 }]}>A+</Text>
                            <Text style={[styles.footerNavText, { color: currentStyles.text }]}>Size</Text>
                        </TouchableOpacity>
                        
                        {/* Bookmark Button (Toggle) */}
                        <TouchableOpacity style={[styles.footerNavButton]} onPress={toggleBookmark}>
                            <Text style={[styles.footerNavIcon, { color: isCurrentChapterBookmarked ? currentStyles.primary : currentStyles.text }]}>
                                {isCurrentChapterBookmarked ? '📌' : '🔖'}
                            </Text>
                            <Text style={[styles.footerNavText, { color: currentStyles.text }]}>
                                {isCurrentChapterBookmarked ? 'Saved' : 'Bookmark'}
                            </Text>
                        </TouchableOpacity>
                        
                        {/* Bookmark List Button (New) */}
                        {/* <TouchableOpacity style={[styles.footerNavButton]} onPress={() => setIsBookmarkModalVisible(true)}>
                            <Text style={[styles.footerNavIcon, { color: currentStyles.text }]}>
                                📚
                            </Text>
                            <Text style={[styles.footerNavText, { color: currentStyles.text }]}>Bookmarks</Text>
                        </TouchableOpacity> */}
                        
                        {/* 🆕 SPEECH BUTTON */}
                        <TouchableOpacity style={[styles.footerNavButton]} onPress={toggleSpeech}>
                            <Text style={[styles.footerNavIcon, { color: currentStyles.text }]}>
                                {isSpeaking ? '🛑' : '🔊'}
                            </Text>
                            <Text style={[styles.footerNavText, { color: currentStyles.text }]}>
                                {isSpeaking ? 'Stop' : 'Read'}
                            </Text>
                        </TouchableOpacity>
                        
                        {/* Theme Toggle */}
                        <TouchableOpacity style={[styles.footerNavButton]} onPress={() => toggleTheme()}>
                            <Text style={[styles.footerNavIcon, { color: currentStyles.text }]}>{theme === 'light' ? '🌙' : '☀️'}</Text>
                            <Text style={[styles.footerNavText, { color: currentStyles.text }]}>Theme</Text>
                        </TouchableOpacity>
                    </View> 
                </View>
            </Animated.View>

            {/* ☰ TOC Modal (Side Drawer) - Unchanged */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isTocVisible}
                onRequestClose={() => setIsTocVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.tocBackdrop} 
                    activeOpacity={1} 
                    onPress={() => setIsTocVisible(false)}
                >
                    <View style={[styles.tocDrawer, { backgroundColor: currentStyles.tocBackground }]} onStartShouldSetResponder={() => true}>
                        <View style={[styles.tocBookInfo, { borderBottomColor: currentStyles.border }]}>
                            <Text style={[styles.tocBookTitle, { color: currentStyles.text }]} numberOfLines={2}>
                                {title}
                            </Text>
                            <Text style={[styles.tocBookAuthor, { color: currentStyles.text + '80' }]}>
                                {author}
                            </Text>
                        </View>
                        <ScrollView style={styles.tocContent}>
                            {toc.map((item, index) => {
                                const tocCfi = typeof item.cfi === 'string' ? item.cfi.split(/[#!]/)[0] : '';
                                const currentChapterCfi = currentCfi.split(/[#!]/)[0];
                                const isCurrent = currentChapterCfi.startsWith(tocCfi) && tocCfi.length > 5;

                                return (
                                    <TouchableOpacity 
                                        key={index} 
                                        onPress={() => goToCfi(item.cfi)} 
                                        style={[
                                            styles.tocItem,
                                            isCurrent ? { backgroundColor: currentStyles.primary + '15' } : null
                                        ]}
                                    >
                                        <Text style={[styles.tocItemText, { color: currentStyles.text }]} numberOfLines={1}>{item.label}</Text>
                                        <Text style={[styles.tocItemIcon, { color: currentStyles.primary }]}>
                                            {isCurrent ? '●' : '›'}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
            
            {/* 🆕 BOOKMARKS MODAL */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isBookmarkModalVisible}
                onRequestClose={() => setIsBookmarkModalVisible(false)}
            >
                <SafeAreaView style={[styles.bookmarkModalView, { backgroundColor: currentStyles.background }]}>
                    <View style={[styles.bookmarkHeader, { borderBottomColor: currentStyles.border }]}>
                        <Text style={[styles.bookmarkTitle, { color: currentStyles.text }]}>Saved Bookmarks</Text>
                        <TouchableOpacity onPress={() => setIsBookmarkModalVisible(false)}>
                            <Text style={[styles.bookmarkClose, { color: currentStyles.primary }]}>Close</Text>
                        </TouchableOpacity>
                    </View>
                    
                    {bookmarks.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={{ color: currentStyles.text + '80' }}>No bookmarks saved yet. Tap the 🔖 button to save your spot.</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={bookmarks}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <View style={[styles.bookmarkItem, { borderBottomColor: currentStyles.border + '30' }]}>
                                    <TouchableOpacity style={styles.bookmarkTextContainer} onPress={() => goToCfi(item.cfi)}>
                                        <Text style={[styles.bookmarkChapterText, { color: currentStyles.text }]} numberOfLines={1}>
                                            {item.chapter}
                                        </Text>
                                        <Text style={[styles.bookmarkDetailText, { color: currentStyles.text + '80' }]}>
                                            {item.pageInfo} - {item.date} ({item.progress}%)
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.bookmarkDeleteButton} onPress={() => deleteBookmark(item.id)}>
                                        <Text style={styles.bookmarkDeleteIcon}>🗑️</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                    )}
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
};

// --- Styles (Unchanged from previous version) ---
const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollPagePlaceholder: { width: WINDOW_WIDTH, height: '100%' },
    scrollPageContent: { width: WINDOW_WIDTH, height: '100%' },
    controlsOverlay: { position: 'relative', top: 0, left: 0, right: 0,  },
    footerControlsOverlay: { position: 'relative', bottom: 0, left: 0, right: 0,  },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        paddingTop: Platform.OS === 'android' ? 30 : 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 2, 
    },
    headerIcon: { padding: 5, },
    iconText: { fontSize: 16, fontWeight: '600' },
    titleText: { fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center', marginHorizontal: 10, },
    footer: {
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 2,
        paddingTop: 10,
    },
    progressContainer: {
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    progressBarBase: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 5,
        marginTop: 5,
    },
    progressBarFill: {
        height: '100%',
    },
    progressText: {
        fontSize: 12,
        textAlign: 'center',
        fontWeight: '500',
    },
    chapterTitleText: {
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '600',
        marginBottom: 5,
    },
    footerActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 5,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    footerNavButton: {
        alignItems: 'center',
        paddingVertical: 8,
        width: WINDOW_WIDTH / 6 - 5, // Changed from / 5 to / 6 for 6 buttons
    },
    footerNavIcon: { fontSize: 24 },
    footerNavText: { fontSize: 10, marginTop: 2, fontWeight: '600' },
    tocBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', flexDirection: 'row-reverse' }, 
    tocDrawer: { 
        width: '85%', 
        height: '100%',
        paddingTop: Platform.OS === 'android' ? "5%" : "10%",
        shadowColor: "#000",
        shadowOffset: { width: -4, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 10,
    },
    tocBookInfo: {
        padding: 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    tocBookTitle: { fontSize: 18, fontWeight: '700' },
    tocBookAuthor: { fontSize: 14, marginTop: 5 },
    tocContent: { flex: 1, paddingHorizontal: 10 },
    tocItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 5,
        marginBottom: 2,
    },
    tocItemText: { fontSize: 14, flex: 1 },
    tocItemIcon: { fontSize: 12, fontWeight: '900', marginLeft: 10 },
    
    // Bookmarks Modal Styles
    bookmarkModalView: {
        flex: 1,
        marginTop: '20%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    bookmarkHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    bookmarkTitle: { fontSize: 20, fontWeight: '700' },
    bookmarkClose: { fontSize: 16, fontWeight: '600' },
    bookmarkItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    bookmarkTextContainer: { flex: 1, marginRight: 10 },
    bookmarkChapterText: { fontSize: 16, fontWeight: '600' },
    bookmarkDetailText: { fontSize: 12, marginTop: 4 },
    bookmarkDeleteButton: { padding: 5 },
    bookmarkDeleteIcon: { fontSize: 18 },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, textAlign: 'center' },
});

export default EpubReader;