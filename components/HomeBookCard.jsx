// components/HomeBookCard.js

import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.4; // Card takes up about 40% of the screen width

const HomeBookCard = ({ book, onPress }) => {
  const { title, author, coverUri, status } = book;

  // Logic to style the status badge (e.g., Free Trial vs. Read Now)
  const getStatusStyle = (bookStatus) => {
    switch (bookStatus) {
      case 'Free Trial':
        return { backgroundColor: '#2ecc71', text: bookStatus };
      case 'Read Now':
        return { backgroundColor: '#3498db', text: bookStatus };
      case 'Purchase':
        return { backgroundColor: '#e74c3c', text: bookStatus };
      default:
        return { backgroundColor: '#95a5a6', text: 'View' };
    }
  };

  const statusInfo = getStatusStyle(status);

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={() => onPress(book)}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: coverUri }} style={styles.coverImage} resizeMode="cover" />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.author} numberOfLines={1}>{author}</Text>
        
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.backgroundColor }]}>
          <Text style={styles.statusText}>
            {statusInfo.text}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: ITEM_WIDTH,
    marginHorizontal: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  imageWrapper: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.5, // Standard book cover ratio
    overflow: 'hidden',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 8,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    minHeight: 40, // Ensure title area is consistent
  },
  author: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
    marginBottom: 8,
  },
  statusBadge: {
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
});

export default HomeBookCard;