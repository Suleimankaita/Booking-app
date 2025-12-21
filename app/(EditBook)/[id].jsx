import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, FlatList, Image, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
// Assuming you have an Update mutation in your slice
import { useGetBooksQuery, useUpdateBooksMutation } from '@/components/api/Getslice';
import { uri } from '@/components/api/uri';
import { useSelector } from 'react-redux';
import { getuserfound } from '@/components/Funcslice';

const { width } = Dimensions.get('window');
const SPACING = 16;
const INPUT_HEIGHT = 50;

// --- Mock Data ---
const MOCK_CATEGORIES = ["Fiction", "Fantasy", "Self-Help", "Finance", "Science", "History", "Biography"];

// =======================================================
// === HELPER COMPONENTS (Reused) ===
// =======================================================

const CategoryPickerModal = ({ categories, selectedValue, onSelect, onClose }) => (
    <Modal
        animationType="slide"
        transparent={true}
        visible={true}
        onRequestClose={onClose}
    >
        <View style={pickerStyles.centeredView}>
            <View style={pickerStyles.modalView}>
                <Text style={pickerStyles.modalTitle}>Select Category</Text>
                <FlatList
                    data={categories}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={pickerStyles.categoryItem}
                            onPress={() => { onSelect(item); onClose(); }}
                        >
                            <Text style={[pickerStyles.categoryText, selectedValue === item && pickerStyles.categoryTextSelected]}>
                                {item}
                            </Text>
                            {selectedValue === item && <Feather name="check-circle" size={20} color="#5C6BC0" />}
                        </TouchableOpacity>
                    )}
                />
                <TouchableOpacity style={pickerStyles.closeButton} onPress={onClose}>
                    <Text style={pickerStyles.closeButtonText}>Close</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
);

const FileConverterInput = ({ fileName, setFileName, fileUri, setFileUri, existingFileUrl }) => {
    const [isConverting, setIsConverting] = useState(false);
    const [isConverted, setIsConverted] = useState(false);

    const handleUpload = async () => {
        try {
            let result = await DocumentPicker.getDocumentAsync({
                type: [
                    'application/pdf',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/epub+zip',
                ],
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            const asset = result.assets[0];
            if (asset.name && asset.uri) {
                setFileName(asset.name);
                setFileUri(asset.uri);
                setIsConverted(asset.name.toLowerCase().endsWith('.epub'));
            } else {
                Alert.alert('Error', 'Invalid file selected.');
            }
        } catch (error) {
            console.error('Error picking document:', error);
            Alert.alert('Error', 'Failed to pick a document.');
        }
    };

    const handleConvert = () => {
        if (!fileName || isConverted) return;
        setIsConverting(true);
        setTimeout(() => {
            setIsConverting(false);
            setIsConverted(true);
            const newFileName = fileName.replace(/\.(pdf|txt|docx)$/i, '.epub');
            setFileName(newFileName);
            Alert.alert('Success', `${newFileName} successfully converted to EPUB!`);
        }, 2000);
    };

    const isEpub = fileName ? fileName.toLowerCase().endsWith('.epub') : false;
    // Check if the current fileUri is the remote one (existing) or a new local one
    const isNewFile = fileUri && fileUri !== existingFileUrl;

    return (
        <View style={{ marginBottom: SPACING }}>
            <Text style={styles.label}>Book File (.epub)</Text>
            
            {!fileName && !existingFileUrl ? (
                <TouchableOpacity style={styles.fileUploadButton} onPress={handleUpload}>
                    <Feather name="upload-cloud" size={20} color="#5C6BC0" />
                    <Text style={styles.fileUploadText}>Upload New EPUB File</Text>
                </TouchableOpacity>
            ) : (
                <View>
                    <TouchableOpacity style={styles.fileUploadButton} onPress={handleUpload}>
                        <View style={styles.fileStatusContainer}>
                            <View style={styles.fileInfo}>
                                <Feather name={isEpub ? "book-open" : "file-text"} size={20} color={isEpub ? "#4CAF50" : "#5C6BC0"} />
                                <Text style={styles.fileText} numberOfLines={1}>
                                    {fileName || "Existing File"}
                                </Text>
                            </View>
                            
                            {/* Only show convert/ready if it's a new file upload */}
                            {isNewFile && (
                                <TouchableOpacity 
                                    onPress={handleConvert} 
                                    style={[styles.convertButton, (isConverted || isConverting || isEpub) && styles.convertButtonDisabled]}
                                    disabled={isConverted || isConverting || isEpub}
                                >
                                    {fileUri?.split('.').at(-1)?.toLowerCase() === 'epub' ? (
                                        <Text style={styles.convertButtonText}>EPUB Ready</Text>
                                    ) : fileUri?.split('.').at(-1)?.toLowerCase() === 'pdf' ? (
                                        <Link href={'https://www.digitalofficepro.com/converter/document/pdf'}>
                                            <Text style={styles.convertButtonText}>Convert PDF</Text>
                                        </Link>
                                    ) : (
                                        <Link href={'https://www.digitalofficepro.com/converter/document/docx'}>
                                            <Text style={styles.convertButtonText}>Convert DOCX</Text>
                                        </Link>
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>
                    </TouchableOpacity>
                    {/* Helper text to show if we are using existing file or new file */}
                    <Text style={{ fontSize: 10, color: '#9E9E9E', marginTop: 5 }}>
                        {isNewFile ? "New file selected" : "Using current existing book file"}
                    </Text>
                </View>
            )}
        </View>
    );
};

// =======================================================
// === EDIT BOOK SCREEN COMPONENT ===
// =======================================================

export default function EditBookScreen() {
    const user=useSelector(getuserfound)
    const router = useRouter();
    const {data}=useGetBooksQuery(user?.id,{
        // pollingInterval:1000,
        // refetchOnFocus:true,
        // refetchOnMountOrArgChange:true

    })
    
    // 1. Get existing book data from navigation params
    const {id} = useLocalSearchParams();
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [BookName, setBookName] = useState('');
    const [author, setAuthor] = useState('');
    const [category, setCategory] = useState(null);
    const [description, setDescription] = useState('');
    const [publishDate, setPublishDate] = useState('2025-11-25');
    const [tags, setTags] = useState(['Fiction', 'Fantasy']); // You might need to parse this if passed from params
    const [ageRating, setAgeRating] = useState('13+');
    const [isFeatured, setIsFeatured] = useState(false);

    // Image State
    const [bookCoverUri, setBookCoverUri] = useState(''); 
    
    // File State
    const [fileName, setFileName] = useState('');
    const [fileUri, setFileUri] = useState('');

  

    const [Book,setBook]=useState({})
   // Add a state to track if the form has been initialized
const [isInitialized, setIsInitialized] = useState(false);

useEffect(() => {
    // Only run this if we have data, an ID, and we haven't initialized yet
    if (data && id && !isInitialized) {
        const bookToEdit = data.find(item => item._id === id);
        
        if (bookToEdit) {
            setTitle(bookToEdit.title || '');
            setPrice(bookToEdit.price ? String(bookToEdit.price) : '');
            setBookName(bookToEdit.BookName || '');
            setAuthor(bookToEdit.Author || '');
            setCategory(bookToEdit.categories || null);
            setDescription(bookToEdit.description || '');
            
            if (bookToEdit.CoverImg) {
                setBookCoverUri(`${uri}/img/${bookToEdit.CoverImg}`);
            }
            if (bookToEdit.EpubUri) {
                setFileName(bookToEdit.EpubUri);
                const remoteUri = `${uri}/uploads/${bookToEdit.EpubUri}`;
                setFileUri(remoteUri);
                // setExistingFileUri(remoteUri);
            }
            
            // Mark as initialized so this block never runs again for this session
            setIsInitialized(true);
        }
    }
}, [data, id, isInitialized]); // Add isInitialized to dependencies
    // Parse params if they come as strings, or use defaults
    // const bookId = params.id;
    // const existingCover = Book.CoverImg ? `${uri}/img/${Book.CoverImg}` : null;
    const existingEpub = Book.EpubUri ? `${uri}/uploads/${Book.EpubUri}` : null;

    const [UpdateBook,{isSuccess}] = useUpdateBooksMutation(); // Assuming you have this mutation

      useEffect(()=>{
        if(isSuccess){
                    router.replace('/(tabs)/AllBooks')
        
        }
    },[isSuccess])

    // 2. Initialize state with existing data
    
    const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);

    // --- Image Picker ---
    const handleImagePick = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission denied', 'Sorry, we need permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [2, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setBookCoverUri(result.assets[0].uri);
        }
    };

    // --- Form Submission ---
    const handleUpdateBook = async () => {
        if (!title || !author || !category) {
             Alert.alert("Missing Information", "Title, Author, and Category are required.");
             return;
        }

        try {
            const form = new FormData();
            
            // Append standard fields
            form.append('id', id); // Important for Update
            form.append('Author', author);
            form.append('title', title);
            form.append('BookName', BookName);
            form.append('price', price);
            form.append('description', description);
            form.append('categories', category);

            // LOGIC: Check if Cover Image is NEW (local URI) or EXISTING (http URL)
            const isNewImage = bookCoverUri && !bookCoverUri.startsWith('http');
            if (isNewImage) {
                const imgExt = bookCoverUri.split('.').pop();
                form.append('file', {
                    uri: bookCoverUri,
                    name: `cover.${imgExt}`,
                    type: `image/${imgExt}` // best guess mime type
                });
            }

            // LOGIC: Check if EPUB File is NEW (local URI) or EXISTING (http URL)
            const isNewFile = fileUri && !fileUri.startsWith('http');
            if (isNewFile) {
                const fileExt = fileUri.split('.').pop().toLowerCase();
                if (fileExt !== 'epub') {
                     Alert.alert("Invalid File", "Only EPUB files are allowed.");
                     return;
                }
                form.append('epub', {
                    uri: fileUri,
                    name: `book.${fileExt}`,
                    type: `application/epub+zip`
                });
            }

            console.log("--- SUBMITTING UPDATE ---");
            // Call your update mutation
            const response = await UpdateBook({ id: id, form }).unwrap(); 
            
            Alert.alert("Success", "Book updated successfully", [
                { text: "OK", onPress: () => router.back() }
            ]);

        } catch (err) {
            console.error(err);
            console.error(err.data?.message || err.message);
            Alert.alert("Update Failed", err?.data?.message || err?.message || "An error occurred");
        }
    };

    // --- Render Helpers ---
    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleCategorySelect = (selectedCategory) => {
        setCategory(selectedCategory);
    };

    return (
        <View style={styles.safeArea}>
       
            <ScrollView style={{flex: 1}} contentContainerStyle={styles.scrollContent}>
                <View style={styles.contentContainer}>
                    
                    {/* BookName */}
                    <Text style={styles.label}>BookName</Text>
                    <TextInput 
                        style={styles.input} 
                        value={BookName} 
                        onChangeText={setBookName} 
                        placeholder="Enter BookName"
                    />

                    {/* Title */}
                    <Text style={styles.label}>Title</Text>
                    <TextInput 
                        style={styles.input} 
                        value={title} 
                        onChangeText={setTitle} 
                        placeholder="Enter book title"
                    />

                    {/* Price */}
                    <Text style={styles.label}>Price</Text>
                    <TextInput 
                        style={styles.input} 
                        value={price} 
                        onChangeText={setPrice} 
                        placeholder="Book Price"
                        keyboardType='numeric'
                    />

                    {/* Author */}
                    <Text style={styles.label}>Author</Text>
                    <TextInput 
                        style={styles.input} 
                        value={author} 
                        onChangeText={setAuthor} 
                        placeholder="Enter author's name"
                    />

                    {/* Category */}
                    <Text style={styles.label}>Category</Text>
                    <TouchableOpacity 
                        style={styles.input} 
                        onPress={() => setIsCategoryModalVisible(true)}
                    >
                        <Text style={category ? styles.pickerTextSelected : styles.pickerTextPlaceholder}>
                            {category || 'Select a Category'}
                        </Text>
                        <Feather name="chevron-down" size={20} color="#9E9E9E" />
                    </TouchableOpacity>
                    
                    {isCategoryModalVisible && (
                         <CategoryPickerModal 
                            categories={MOCK_CATEGORIES}
                            selectedValue={category}
                            onSelect={handleCategorySelect}
                            onClose={() => setIsCategoryModalVisible(false)}
                         />
                    )}

                    {/* Book Cover */}
                    <Text style={styles.label}>Book Cover</Text>
                    <TouchableOpacity style={[styles.coverUploadArea, bookCoverUri && styles.coverUploadAreaActive]} onPress={handleImagePick}>
                        {bookCoverUri ? (
                            <Image source={{ uri: bookCoverUri }} style={styles.coverImage} resizeMode="cover" />
                        ) : (
                            <View style={styles.coverUploaded}>
                                <Feather name="camera" size={30} color="#9E9E9E" />
                                <Text style={styles.coverUploadText}>Upload Cover Image</Text>
                            </View>
                        )}
                        {/* Overlay to indicate editability */}
                        <View style={styles.editIconOverlay}>
                            <Feather name="edit-2" size={16} color="#fff" />
                        </View>
                    </TouchableOpacity>

                    {/* Description */}
                    <Text style={styles.label}>Description</Text>
                    <TextInput 
                        style={styles.textArea} 
                        value={description} 
                        onChangeText={setDescription} 
                        placeholder="Detailed book description..."
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />

                    {/* File Input */}
                    <FileConverterInput 
                        fileName={fileName} 
                        setFileName={setFileName}
                        fileUri={fileUri}
                        setFileUri={setFileUri}
                        existingFileUrl={fileUri}
                    />

                    {/* Tags (Optional UI) */}
                    {/* <Text style={styles.label}>Tags</Text>
                    <View style={styles.tagsContainer}>
                        {tags.map((tag, index) => (
                            <View key={index} style={styles.tagPill}>
                                <Text style={styles.tagText}>{tag}</Text>
                                <TouchableOpacity onPress={() => removeTag(tag)} style={styles.tagRemoveButton}>
                                    <Feather name="x" size={12} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View> */}

                    {/* Featured Toggle */}
                    {/* <View style={styles.switchRow}>
                        <Text style={styles.labelSwitch}>Featured</Text>
                        <Switch
                            value={isFeatured}
                            onValueChange={setIsFeatured}
                            trackColor={{ false: "#E0E0E0", true: "#5C6BC0" }}
                            thumbColor="#fff"
                        />
                    </View> */}
                    
                </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.createButton} onPress={handleUpdateBook}>
                    <Text style={styles.createButtonText}>Update Book</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// =======================================================
// === STYLES ===
// =======================================================

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F5F5F5' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: SPACING, paddingTop: 40, paddingBottom: 15,
        backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee',
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    scrollContent: { paddingBottom: 100 },
    contentContainer: { paddingHorizontal: SPACING, paddingTop: 15 },
    
    // --- Form Elements ---
    label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: SPACING },
    input: {
        backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 15, height: INPUT_HEIGHT,
        fontSize: 16, color: '#333', borderWidth: 1, borderColor: '#E0E0E0', flexDirection: 'row',
        justifyContent: 'space-between', alignItems: 'center',
    },
    textArea: {
        backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 15, paddingTop: 15,
        minHeight: 100, fontSize: 16, color: '#333', borderWidth: 1, borderColor: '#E0E0E0',
    },
    pickerTextSelected: { color: '#333', fontSize: 16 },
    pickerTextPlaceholder: { color: '#9E9E9E', fontSize: 16 },

    // --- Book Cover Upload ---
    coverUploadArea: {
        height: 200,
        borderWidth: 2,
        borderColor: '#ccc',
        borderStyle: 'dashed',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    coverUploadAreaActive: {
        borderStyle: 'solid',
        borderColor: '#5C6BC0',
    },
    coverUploaded: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    coverImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    coverUploadText: {
        marginTop: 8,
        color: '#9E9E9E',
        fontSize: 14,
    },
    editIconOverlay: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 8,
        borderRadius: 20,
    },

    // --- File Converter ---
    fileUploadButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#E8EAF6', borderRadius: 10, height: INPUT_HEIGHT,
    },
    fileUploadText: { color: '#5C6BC0', fontSize: 16, fontWeight: '600', marginLeft: 10 },
    fileStatusContainer: {
        height: 50, width: '100%',
        backgroundColor: '#fff', borderRadius: 10, padding: 10, borderWidth: 1,
        borderColor: '#E0E0E0', flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center',
    },
    fileInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 10 },
    fileText: { fontSize: 14, color: '#333', marginLeft: 8, flexShrink: 1 },
    convertButton: { backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12, borderRadius: 8, height: 40 },
    convertButtonDisabled: { backgroundColor: '#9E9E9E' },
    convertButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },

    // --- Tags ---
    tagsContainer: {
        flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#fff', padding: 10,
        borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0',
    },
    tagPill: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#5C6BC0',
        borderRadius: 15, paddingVertical: 5, paddingHorizontal: 10, marginRight: 8, marginBottom: 8,
    },
    tagText: { color: '#fff', fontSize: 14, marginRight: 5 },
    tagRemoveButton: { marginLeft: 2, padding: 2 },

    // --- Switches ---
    switchRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: 15, paddingHorizontal: 5, marginTop: 10, backgroundColor: '#fff',
        borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0',
    },
    labelSwitch: { fontSize: 16, fontWeight: '600', color: '#333' },

    // --- Footer ---
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff',
        paddingHorizontal: SPACING, paddingVertical: 15, borderTopWidth: 1, borderTopColor: '#eee',
    },
    createButton: {
        backgroundColor: '#5C6BC0', borderRadius: 10, height: INPUT_HEIGHT,
        justifyContent: 'center', alignItems: 'center',
    },
    createButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

// --- Modal Picker Styles ---
const pickerStyles = StyleSheet.create({
    centeredView: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: 'rgba(0,0,0,0.5)' },
    modalView: {
        margin: 20, backgroundColor: "white", borderRadius: 20, padding: 20, alignItems: "stretch",
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25,
        shadowRadius: 4, elevation: 5, width: '80%', maxHeight: '70%',
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#333' },
    categoryItem: {
        paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row',
        justifyContent: 'space-between', alignItems: 'center',
    },
    categoryText: { fontSize: 16, color: '#333' },
    categoryTextSelected: { fontWeight: 'bold', color: '#5C6BC0' },
    closeButton: { marginTop: 15, backgroundColor: '#E0E0E0', borderRadius: 10, padding: 10 },
    closeButtonText: { textAlign: 'center', color: '#333', fontWeight: '600' }
});