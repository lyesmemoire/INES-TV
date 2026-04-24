import { Tabs } from 'expo-router';
import { Home, Tv, Star, Search, User, LayoutList } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#09090b',
          borderTopColor: 'rgba(255,255,255,0.05)',
          elevation: 0,
          height: 60,
          paddingBottom: 8,
          position: 'absolute', // Allows list to scroll behind behind transparent tab bar
        },
        tabBarActiveTintColor: '#10B981', // Emerald 500
        tabBarInactiveTintColor: '#52525B', // Zinc 500
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => <Home size={22} color={color} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="live"
        options={{
          title: 'Live',
          tabBarIcon: ({ color, size }) => <Tv size={22} color={color} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="guide"
        options={{
          title: 'Guide TV',
          tabBarIcon: ({ color, size }) => <LayoutList size={22} color={color} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Recherche',
          tabBarIcon: ({ color, size }) => <Search size={22} color={color} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoris',
          tabBarIcon: ({ color, size }) => <Star size={22} color={color} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <User size={22} color={color} strokeWidth={2.5} />,
        }}
      />
    </Tabs>
  );
}
