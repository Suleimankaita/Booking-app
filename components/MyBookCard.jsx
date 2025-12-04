// components/MyBookCard.js

import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;

const MyBookCard = ({ book, onPress }) => {
  const { title, author, coverUri, isDownloaded, progress } = book;
  
  // Logic for status badge
  let statusIcon = null;
  let statusColor = '#666';
  let statusText = `${progress}% Read`;

  if (isDownloaded) {
    statusIcon = <Icon name="cloud-done" size={16} color="#2ecc71" />;
    statusColor = '#2ecc71';
    statusText = 'Downloaded';
  } else if (progress > 0) {
    statusIcon = <Icon name="timer-outline" size={16} color="#f39c12" />;
    statusColor = '#f39c12';
  } else {
    statusIcon = <Icon name="cloud-download-outline" size={16} color="#3498db" />;
    statusColor = '#3498db';
    statusText = 'Ready to Download';
  }

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={() => onPress(book)}>
      <Image source={{ uri: coverUri }} style={styles.coverImage} resizeMode="cover" />
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.author}>{author}</Text>
        
        {/* Status Badge */}
        <View style={styles.statusBadge}>
          {statusIcon}
          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusText}
          </Text>
        </View>

        {/* Reading Progress Bar (if not 100%) */}
        {progress > 0 && progress < 100 && (
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${progress}%` }
              ]} 
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 10,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  coverImage: {
    width: 100,
    height: 140,
    borderRadius: 8,
    margin: 10,
  },
  infoContainer: {
    flex: 1,
    padding: 10,
    paddingLeft: 0,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  author: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusText: {
    fontSize: 12,
    marginLeft: 5,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 6,
    width: '100%',
    backgroundColor: '#eee',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#f39c12',
  },
});

export default MyBookCard;