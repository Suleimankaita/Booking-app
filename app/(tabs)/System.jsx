import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; 

// --- Helper Components ---

/**
 * A standard setting item with a title, description, and an arrow/action icon.
 */
const SettingsItem = ({ iconName, title, description, onPress }) => (
  <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
    <Icon name={iconName} size={24} color="#4a148c" style={styles.itemIcon} />
    <View style={styles.itemContent}>
      <Text style={styles.itemTitle}>{title}</Text>
      {description ? <Text style={styles.itemDescription}>{description}</Text> : null}
    </View>
    <Icon name="chevron-forward-outline" size={20} color="#ccc" />
  </TouchableOpacity>
);

/**
 * A setting item with a switch control (e.g., for toggles).
 */
const ToggleItem = ({ iconName, title, description, initialValue }) => {
  const [isEnabled, setIsEnabled] = useState(initialValue);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  return (
    <View style={styles.itemContainer}>
      <Icon name={iconName} size={24} color="#4a148c" style={styles.itemIcon} />
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{title}</Text>
        {description ? <Text style={styles.itemDescription}>{description}</Text> : null}
      </View>
      <Switch
        trackColor={{ false: "#767577", true: "#81b0ff" }} // Default React Native colors
        thumbColor={isEnabled ? "#4a148c" : "#f4f3f4"}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleSwitch}
        value={isEnabled}
      />
    </View>
  );
};

// --- Main Component ---

const SystemSettingsScreen = () => {
  // Mock function for navigation/actions
  const handlePress = (settingName) => {
    console.log(`Navigating to ${settingName} settings.`);
    // Here you would typically use navigation.navigate('ScreenName');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => handlePress('Back')}>
          <Icon name="arrow-back-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>System Settings</Text>
        <View style={{ width: 24 }} /> {/* Spacer */}
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        
        {/* 1. General Settings Section */}
        <Text style={styles.sectionHeader}>GENERAL</Text>
        <View style={styles.sectionCard}>
          <SettingsItem
            iconName="cloud-outline"
            title="Data Sync"
            description="Manage synchronization intervals and backup."
            onPress={() => handlePress('Data Sync')}
          />
          <SettingsItem
            iconName="language-outline"
            title="Language & Region"
            description="English (US)"
            onPress={() => handlePress('Language')}
          />
          <SettingsItem
            iconName="trash-outline"
            title="Clear Cache"
            description="Free up storage space (250 MB)."
            onPress={() => handlePress('Clear Cache')}
          />
        </View>

        {/* 2. Appearance Section */}
        <Text style={styles.sectionHeader}>APPEARANCE</Text>
        <View style={styles.sectionCard}>
          <ToggleItem
            iconName="moon-outline"
            title="Dark Mode"
            description="Switch the app theme to dark."
            initialValue={false}
          />
          <SettingsItem
            iconName="color-palette-outline"
            title="Theme Color"
            description="Change the primary accent color."
            onPress={() => handlePress('Theme Color')}
          />
        </View>
        
        {/* 3. Notifications Section */}
        <Text style={styles.sectionHeader}>NOTIFICATIONS</Text>
        <View style={styles.sectionCard}>
          <ToggleItem
            iconName="notifications-outline"
            title="Push Notifications"
            description="Receive updates on new books and users."
            initialValue={true}
          />
          <ToggleItem
            iconName="alert-circle-outline"
            title="Alerts for Low Stock"
            description="Get notified when a book's digital stock is low."
            initialValue={true}
          />
        </View>

        {/* 4. Security & Access Section */}
        <Text style={styles.sectionHeader}>SECURITY & ACCESS</Text>
        <View style={styles.sectionCard}>
          <SettingsItem
            iconName="lock-closed-outline"
            title="Permissions Manager"
            description="View and change user roles and access levels."
            onPress={() => handlePress('Permissions')}
          />
          <SettingsItem
            iconName="key-outline"
            title="API Keys & Integrations"
            description="Manage third-party connections."
            onPress={() => handlePress('API Keys')}
          />
          <SettingsItem
            iconName="document-text-outline"
            title="Legal & Privacy"
            description="Terms of Service, Privacy Policy."
            onPress={() => handlePress('Legal')}
          />
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Stylesheet ---

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Light gray background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#4a148c', // Dark purple header
    ...Platform.select({
      ios: { paddingTop: 50 }, // Adjust for notch/status bar area
    }),
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  container: {
    padding: 15,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#777',
    marginTop: 15,
    marginBottom: 8,
    marginLeft: 5,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden', // Ensures borders/separators don't spill
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  // Item Styles
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemIcon: {
    marginRight: 15,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  itemDescription: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  // Remove bottom border from the last item in a section
  // Note: For a true clean look, you'd use a function to determine the last item.
  // We apply the border to all and let the container's overflow handle the edges.
});

export default SystemSettingsScreen;