import { router, Tabs } from 'expo-router';
import React, { useEffect } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'react-native';
import { uri } from '@/components/api/uri';
import Useauth from '../hooks/Useauth';
import Img from '../img';
export default function TabLayout() {
const { username, userData } = Useauth();
const colorScheme = useColorScheme();




  const role="User"
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        headerTitleAlign:"left",
        tabBarButton: HapticTab,
        headerRight:()=><Img/>
      }}>
      <Tabs.Screen
        name="index"
        redirect={role!=="User"}
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="Dashbord"
        redirect={role==="User"}
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="book" color={color} />,
        }}
      />
      <Tabs.Screen
        name="Library"
        redirect={role!=="User"}
        options={{
          title: 'Library',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="book" color={color} />,
        }}
      />
      <Tabs.Screen
        name="Me"
        redirect={role!=="User"}

        options={{
          title: 'Me',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person" color={color} />,
        }}
      />
      {/* <Tabs.Screen
        name="Books"
        redirect={role==="User"}
        options={{
          title: 'BooksList',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="book" color={color} />,
        }}
      /> */}
        <Tabs.Screen
          name="Home"
          redirect={role==="User"}
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
      <Tabs.Screen
        name="AddBooks"
        redirect={role==="User"}
        options={{
          title: 'AddBooks',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="book" color={color} />,
        }}
      />
      <Tabs.Screen
        name="Users"
        redirect={role==="User"}
        options={{
          title: 'Users',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.2" color={color} />,
        }}
      />
      <Tabs.Screen
        name="AllBooks"
        redirect={role==="User"}
        options={{
          title: 'Books',
          tabBarIcon: ({ color }) => <MaterialIcons name="collections-bookmark" size={24} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="AdminSetting"
        redirect={role==="User"}
        options={{
          title: 'Me',
          tabBarIcon: ({ color }) => <MaterialIcons name="person" size={24} color={color} />,
        }}
      />
      
    </Tabs>
  );
}
