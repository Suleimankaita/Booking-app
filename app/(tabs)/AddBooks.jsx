import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, FlatList, Image, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
// 👈 NEW IMPORT: expo-image-picker
import { useAddBooksMutation ,useGetCategoriesQuery} from '@/components/api/Getslice';
import * as ImagePicker from 'expo-image-picker';

import * as DocumentPicker from 'expo-document-picker';
import { Link } from 'expo-router';

const { width } = Dimensions.get('window');
const SPACING = 16;
const INPUT_HEIGHT = 50;

// --- Mock Data/Components ---
// ... (CategoryPickerModal and other mock data/components remain unchanged)
const MOCK_CATEGORIES = ["Fiction", "Fantasy", "Self-Help", "Finance", "Science", "History", "Biography"];

/**
 * Custom Modal Component for Category Picker
 */
const CategoryPickerModal = ({ categories, selectedValue, onSelect, onClose }) =>{
    const {data}=useGetCategoriesQuery('',{
        pollingInterval:1000,
        refetchOnFocus:true,
        refetchOnReconnect:true
    })
    const [datas,setdatas]=useState([])
    
    useEffect(()=>{
        if(!data)return;
        setdatas(data)
    },[data])
    return(
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
                    data={datas}
                    keyExtractor={(item) => item?._id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                        style={pickerStyles.categoryItem}
                            onPress={() => { onSelect(item?.name); onClose(); }}
                        >
                            <Text style={[pickerStyles.categoryText, selectedValue === item && pickerStyles.categoryTextSelected]}>
                                {item?.name}
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

}
/**
 * Component to simulate the PDF/EPUB upload and conversion logic.
 */
const FileConverterInput = ({ fileName, setFileName ,fileUri, setFileUri}) => {
    // const [fileName, setFileName] = useState(null);
    // const [fileUri, setFileUri] = useState(null); // To store the actual URI/path of the selected file
    const [isConverting, setIsConverting] = useState(false);
    const [isConverted, setIsConverted] = useState(false);

    // ⭐ UPDATED FUNCTIONALITY: Handle file upload using expo-document-picker
    const handleUpload = async () => {
        try {
            // Use '*' for all file types or 'application/epub+zip' for EPUB specifically
            // Using multiple types: ['application/epub+zip', 'application/pdf']
            let result = await DocumentPicker.getDocumentAsync({
                type: [
                'application/pdf',           // PDF files
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX files
                'application/epub+zip',      // EPUB files
            ], // Target EPUB files
                copyToCacheDirectory: true,
            });

            if (result.canceled) {
                console.log("Document selection cancelled.");
                return;
            }

            const asset = result.assets[0];
            if (asset.name && asset.uri) {
                setFileName(asset.name);
                setFileUri(asset.uri);
                
                setIsConverted(asset.name.toLowerCase().endsWith('.epub')); // Check if it's already EPUB
                console.log("Document selected:", asset.name, "URI:", asset.uri);
            } else {
                Alert.alert('Error', 'Invalid file selected.');
            }

        } catch (error) {
            console.error('Error picking document:', error);
            Alert.alert('Error', 'Failed to pick a document.');
        }
    };
    // ⭐ END OF UPDATED FUNCTIONALITY
    useEffect(()=>{
        if(!fileUri)return
        if(fileUri.split('.').at(-1).toLowerCase()==='epub'){
            console.log(fileUri.split('.').at(-1))
        }else{
            alert('only epub file you can add')
        }
    },[fileUri])
    const handleConvert = () => {
        if (!fileName || isConverted) return;
        
        // Mock conversion logic (since actual file conversion is complex)
        setIsConverting(true);
        setTimeout(() => {
            setIsConverting(false);
            setIsConverted(true);
            
            // Assuming conversion updates the file name/path
            const newFileName = fileName.replace(/\.(pdf|txt|docx)$/i, '.epub');
            setFileName(newFileName);
            // In a real app, you would also update setFileUri with the URI of the new EPUB file
            
            Alert.alert('Success', `${newFileName} successfully converted to EPUB!`);
        }, 2000);
    };

    const isEpub = fileName ? fileName.toLowerCase().endsWith('.epub') : false;

    return (
        <View style={{ marginBottom: SPACING }}>
            <Text style={styles.label}>Book File (.epub)</Text>
            
            {!fileName || !fileUri ? (
                <TouchableOpacity style={styles.fileUploadButton} onPress={handleUpload}>
                    <Feather name="upload-cloud" size={20} color="#5C6BC0" />
                    <Text style={styles.fileUploadText}>Upload EPUB File</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity style={styles.fileUploadButton} onPress={handleUpload}>
                    
                <View style={styles.fileStatusContainer}>
                    <View style={styles.fileInfo}>
                        <Feather name={isEpub ? "book-open" : "file-text"} size={20} color={isEpub ? "#4CAF50" : "#5C6BC0"} />
                        <Text style={styles.fileText} numberOfLines={1}>
                            {fileName}
                        </Text>
                    </View>
                    
                    {/* The convert button is now more of a mock check, assuming we want EPUB */}
                <TouchableOpacity 
                        onPress={handleConvert} 
                        style={[styles.convertButton, (isConverted || isConverting || isEpub) && styles.convertButtonDisabled]}
                        disabled={isConverted || isConverting || isEpub}
                    >

                        {/* https://www.digitalofficepro.com/converter/document/pdf */}
                        {fileUri.split('.').at(-1).toLowerCase()==='epub' ? (
                            
                            <Text style={styles.convertButtonText}>EPUB Ready</Text>
                        ) :fileUri.split('.').at(-1).toLowerCase()==='pdf'  ? (
                            <Link href={'https://www.digitalofficepro.com/converter/document/pdf'}>
                            <Text style={styles.convertButtonText}>Convert pdf to epub</Text>
                            </Link>
                        ) : (
                             // This path might not be hit if we only select EPUB, but kept for legacy PDF conversion logic.
                            <Link href={'https://www.digitalofficepro.com/converter/document/docx'}>
                            <Text style={styles.convertButtonText}>Convert docx to epub</Text>
                            </Link>
                        )}
                    </TouchableOpacity>
                </View>
                             </TouchableOpacity>
            )}
            {/* Displaying the internal URI for debugging/context */}
            {fileUri && <Text style={{ fontSize: 10, color: '#9E9E9E', marginTop: 5 }} numberOfLines={1}>URI: {fileUri}</Text>}
        </View>
    );
};

// =======================================================
// === ADD BOOK SCREEN COMPONENT (Main Component Unchanged) ===
// =======================================================

export default function AddBookScreen() {
// ... (Rest of the component remains the same, as the changes were isolated to FileConverterInput)
    const [isConverting, setIsConverting] = useState(false);
    const [isConverted, setIsConverted] = useState(false);
      const [fileName, setFileName] = useState(null);
    const [fileUri, setFileUri] = useState(null); // To store the actual URI/path of the selected file
 
    const [AddBook]=useAddBooksMutation()

    const [title, setTitle] = useState('');
    const [price, setprice] = useState('');
    const [BookName, setBookName] = useState('');
    const [author, setAuthor] = useState('');
    const [category, setCategory] = useState(null);
    const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
    const [bookCoverUri, setBookCoverUri] = useState(null); // Actual state for image URI
    const [description, setDescription] = useState('');
    const [publishDate, setPublishDate] = useState('2025-11-25');
    const [tags, setTags] = useState(['Fiction', 'Fantasy']);
    const [ageRating, setAgeRating] = useState('13+');
    const [isFeatured, setIsFeatured] = useState(false);
    

    // --- FUNCTIONALITY: Book Cover Upload with expo-image-picker ---
    const handleImagePick = async () => {
        // Request permissions
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission denied', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [2, 3], // Standard book cover ratio
            quality: 1,
        });

        if (!result.canceled) {
            setBookCoverUri(result.assets[0].uri);
            console.log("Image selected:", result.assets[0].uri);
        } else {
            console.log("Image selection cancelled.");
        }
    };
    // -------------------------------------------------------------

    // --- FUNCTIONALITY: Category Picker ---
    const handleCategorySelect = (selectedCategory) => {
        setCategory(selectedCategory);
    };

    useEffect(()=>{
        if(bookCoverUri){

            const img=bookCoverUri.split('.').at(-1)
            console.log(img)
        }
    },[bookCoverUri])

    // --- FUNCTIONALITY: Publish Date Picker ---
    const handleDatePick = () => {
        // Mocking a date change (you'd use a DatePicker library here)
        Alert.alert("Date Picker", "Simulating opening date picker...", [
            { text: "Cancel", style: 'cancel' },
            { text: "Set 2026-01-01", onPress: () => setPublishDate('2026-01-01') }
        ]);
    };

    // --- Form Submission ---
    const handleCreateBook = async() => {
        if (!title || !author || !category || !bookCoverUri) {
             Alert.alert("Missing Information", "Please fill in Title, Author, Category, and upload a Book Cover.");
             return;
        }
        try{
            if(fileUri?.split('.')?.at(-1).toLowerCase()==='epub'){

                const form=new FormData()
                const img=bookCoverUri.split('.').at(-1)
            form.append('file',{
                uri:bookCoverUri,
                name:'file.'+img,
                type:'file.'+img
            })
            form.append('epub',{
                uri:fileUri,
                name:'epub.'+fileUri.split('.').at(-1),
                type:'epub.'+fileUri.split('.').at(-1)
            })
            
            form.append('Author',author)
            form.append('title',title)
            form.append('BookName',BookName)
            form.append('price',price)
            form.append('description',description)
            form.append('categories',category)
        const add=await AddBook({form})             
            console.log("--- FINAL FORM DATA SUBMITTED ---");
            console.log({ title, author, category, bookCoverUri, publishDate, isFeatured });
            Alert.alert("Book Created", `The book '${title}' has been submitted.`);
        }else return alert("Only epub file can allow  ")
        }catch(err){
            alert(err?.message)
        }
    };
    
    // Placeholder function for handling tag removal
    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <View style={styles.safeArea}>
            
            {/* Header */}
            {/* <View style={styles.header}>
                <TouchableOpacity onPress={() => console.log("Navigating Back")}>
                    <Ionicons name="arrow-back" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add New Book</Text>
                <View style={{ width: 28 }} />
            </View> */}
            
            <ScrollView style={{flex: 1}} contentContainerStyle={styles.scrollContent}>
                <View style={styles.contentContainer}>
                    
                    {/* 1. Title Input */}
                    <Text style={styles.label}>BookName</Text>
                    <TextInput 
                        style={styles.input} 
                        value={BookName} 
                        onChangeText={setBookName} 
                        returnKeyType='next'
                        placeholder="Enter BookName"
                    />
                    <Text style={styles.label}>Title</Text>
                    <TextInput 
                        style={styles.input} 
                        value={title} 
                        onChangeText={setTitle} 
                        placeholder="Enter book title"
                        returnKeyType='next'

                    />
                    <Text style={styles.label}>Book Price</Text>

                    <TextInput 
                        style={styles.input} 
                        value={price} 
                        onChangeText={setprice} 
                        placeholder="BookPrice"
                        keyboardType='numeric'
                        returnKeyType='next'
                    />

                    {/* 2. Author Input */}
                    <Text style={styles.label}>Author</Text>
                    <TextInput 
                        style={styles.input} 
                        value={author} 
                        onChangeText={setAuthor} 
                        placeholder="Enter author's name"
                    />

                    {/* 3. Category Picker */}
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

                    {/* 4. Book Cover Upload (FUNCTIONALIZED with ImagePicker) */}
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
                    </TouchableOpacity>

                    {/* 5. Description Input */}
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

                    {/* 6. Publish Date Input */}
                    <Text style={styles.label}>Publish Date</Text>
                    <TouchableOpacity style={styles.input} onPress={handleDatePick}>
                        <Text style={styles.pickerTextSelected}>{publishDate}</Text>
                        <Feather name="calendar" size={20} color="#5C6BC0" />
                    </TouchableOpacity>
                    
                    {/* 7. Book File with Converter (NOW USES DOCUMENT PICKER) */}
                    <FileConverterInput {...{ fileName, setFileName ,fileUri, setFileUri}} />

                    {/* 8. Tags Input/Display */}
                    <Text style={styles.label}>Tags</Text>
                    <View style={styles.tagsContainer}>
                        {tags.map((tag, index) => (
                            <View key={index} style={styles.tagPill}>
                                <Text style={styles.tagText}>{tag}</Text>
                                <TouchableOpacity onPress={() => removeTag(tag)} style={styles.tagRemoveButton}>
                                    <Feather name="x" size={12} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        <TextInput 
                            placeholder="Add tag..."
                            style={styles.tagInput}
                            onEndEditing={(e) => {
                                if (e.nativeEvent.text.trim() && !tags.includes(e.nativeEvent.text.trim())) {
                                    setTags([...tags, e.nativeEvent.text.trim()]);
                                }
                                e.nativeEvent.text = '';
                            }}
                        />
                    </View>

                    {/* 9. Age Rating Toggle/Input */}
                    <View style={styles.switchRow}>
                        <Text style={styles.labelSwitch}>Age Rating ({ageRating})</Text>
                        <Switch
                            value={ageRating === '18+'}
                            onValueChange={(val) => setAgeRating(val ? '18+' : '13+')}
                            trackColor={{ false: "#E0E0E0", true: "#5C6BC0" }}
                            thumbColor="#fff"
                        />
                    </View>
                    
                    {/* 10. Featured Toggle */}
                    <View style={styles.switchRow}>
                        <Text style={styles.labelSwitch}>Featured (yes/no)</Text>
                        <Switch
                            value={isFeatured}
                            onValueChange={setIsFeatured}
                            trackColor={{ false: "#E0E0E0", true: "#5C6BC0" }}
                            thumbColor="#fff"
                        />
                    </View>
                    
                </View>
            </ScrollView>

            {/* Submit Button */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.createButton} onPress={handleCreateBook}>
                    <Text style={styles.createButtonText}>Create Book</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// =======================================================
// === STYLESHEET (No changes needed here for functionality) ===
// =======================================================
// ... (The rest of the styles are the same)

// =======================================================
// === STYLESHEET (Only Cover Upload Section Modified) ===
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

    // --- Book Cover Upload (UPDATED STYLES) ---
    coverUploadArea: {
        height: 200, // Increased height for better display of the cover
        borderWidth: 2,
        borderColor: '#ccc',
        borderStyle: 'dashed',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        overflow: 'hidden', // Important for Image component
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

    // --- File Converter (No change) ---
    fileUploadButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#E8EAF6', borderRadius: 10, height: INPUT_HEIGHT,
    },
    fileUploadText: { color: '#5C6BC0', fontSize: 16, fontWeight: '600', marginLeft: 10 },
    fileStatusContainer: {
        height:50,
        width:'100%',
        backgroundColor: '#fff', borderRadius: 10,padding: 10, borderWidth: 1,
        borderColor: '#E0E0E0', flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center',
    },
    fileInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 10 },
    fileText: { fontSize: 14, color: '#333', marginLeft: 8, flexShrink: 1 },
    convertButton: { backgroundColor: '#4CAF50',justifyContent:'center',alignItems:'center', paddingHorizontal: 12, borderRadius: 8,height:40 },
    convertButtonDisabled: { backgroundColor: '#9E9E9E' },
    convertButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },

    // --- Tags (No change) ---
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
    tagInput: { fontSize: 14, height: 30, minWidth: 80 },

    // --- Switches (No change) ---
    switchRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: 15, paddingHorizontal: 5, marginTop: 10, backgroundColor: '#fff',
        borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0',
    },
    labelSwitch: { fontSize: 16, fontWeight: '600', color: '#333' },

    // --- Footer/Submit (No change) ---
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

// --- Modal Picker Styles (No change) ---
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