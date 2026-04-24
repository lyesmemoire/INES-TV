import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TextInput 
          style={styles.input}
          placeholder="Rechercher une chaîne ou un match..."
          placeholderTextColor="#71717A"
          autoFocus
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  header: { padding: 16 },
  input: { backgroundColor: '#18181B', color: 'white', padding: 16, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: '#27272A' }
});
