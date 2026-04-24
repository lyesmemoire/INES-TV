import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Image } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { LogOut, User as UserIcon, Lock, Mail } from 'lucide-react-native';

export default function ProfileScreen() {
  const { isAuthenticated, login, logout, token } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    await login(email, password);
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.headerBox}>
          <Text style={styles.title}>Connexion</Text>
          <Text style={styles.subtitle}>Accédez à vos favoris et à votre historique</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Mail size={18} color="#71717A" style={styles.inputIcon} />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#71717A"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Lock size={18} color="#71717A" style={styles.inputIcon} />
            <TextInput
              placeholder="Mot de passe"
              placeholderTextColor="#71717A"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry
            />
          </View>

          <Pressable 
            onPress={handleLogin}
            disabled={loading}
            style={({ pressed }) => [styles.loginBtn, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.loginBtnText}>{loading ? 'Chargement...' : 'Se connecter'}</Text>
          </Pressable>
        </View>

        <Text style={styles.footerText}>Pas encore de compte ? Contactez votre administrateur.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <UserIcon size={32} color="white" />
        </View>
        <Text style={styles.profileEmail}>{email || 'Utilisateur'}</Text>
        <View style={styles.proBadge}>
          <Text style={styles.proText}>PREMIUM</Text>
        </View>
      </View>

      <View style={styles.menuBox}>
        <Pressable style={styles.menuItem} onPress={logout}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.menuItemTextLogout}>Se déconnecter</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b', padding: 24, justifyContent: 'center' },
  headerBox: { marginBottom: 40 },
  title: { color: 'white', fontSize: 32, fontWeight: '900', marginBottom: 8 },
  subtitle: { color: '#A1A1AA', fontSize: 16 },
  
  form: { gap: 16 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#18181B', borderRadius: 16, borderWidth: 1, borderColor: '#27272A', paddingHorizontal: 16 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: 56, color: 'white', fontSize: 16 },
  loginBtn: { height: 56, backgroundColor: '#10B981', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  loginBtnText: { color: 'black', fontSize: 16, fontWeight: '900' },
  
  footerText: { color: '#52525B', fontSize: 12, textAlign: 'center', marginTop: 32 },

  profileHeader: { alignItems: 'center', marginBottom: 40 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#27272A', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  profileEmail: { color: 'white', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  proBadge: { backgroundColor: '#10B98120', borderWidth: 1, borderColor: '#10B98140', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 100 },
  proText: { color: '#10B981', fontSize: 10, fontWeight: '900' },

  menuBox: { backgroundColor: '#18181B', borderRadius: 20, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 12 },
  menuItemTextLogout: { color: '#EF4444', fontSize: 16, fontWeight: '700' }
});
