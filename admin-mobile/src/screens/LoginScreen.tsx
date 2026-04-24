import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import api from '../services/api';
import { Lock, Mail, ShieldCheck, Fingerprint } from 'lucide-react-native';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/login-mobile', { email, password, code });
      
      if (res.data.token) {
        await SecureStore.setItemAsync('adminToken', res.data.token);
        navigation.replace('Dashboard');
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('Échec', err.response?.data?.error || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      Alert.alert('Non disponible', 'La biométrie n\'est pas configurée sur cet appareil.');
      return;
    }

    const { success } = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authentification Admin',
      fallbackLabel: 'Utiliser le mot de passe',
    });

    if (success) {
      const token = await SecureStore.getItemAsync('adminToken');
      if (token) {
        navigation.replace('Dashboard');
      } else {
        Alert.alert('Session expirée', 'Veuillez vous connecter normalement la première fois.');
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.logo}>
                    <Text style={styles.logoText}>S</Text>
                </View>
                <Text style={styles.title}>Admin <Text style={styles.accent}>Login</Text></Text>
                <Text style={styles.subtitle}>Stratégie & Monétisation OTT</Text>
            </View>

            <View style={styles.inputGroup}>
                <View style={styles.inputWrapper}>
                    {(Mail as any)({ size: 16, color: "#4B5563", style: styles.icon })}
                    <TextInput 
                        placeholder="Email" 
                        placeholderTextColor="#4B5563"
                        value={email}
                        onChangeText={setEmail}
                        style={styles.input}
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputWrapper}>
                    {(Lock as any)({ size: 16, color: "#4B5563", style: styles.icon })}
                    <TextInput 
                        placeholder="Mot de passe" 
                        placeholderTextColor="#4B5563"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        style={styles.input}
                    />
                </View>

                <View style={styles.inputWrapper}>
                    {(ShieldCheck as any)({ size: 16, color: "#4B5563", style: styles.icon })}
                    <TextInput 
                        placeholder="Code 2FA (Optionnel)" 
                        placeholderTextColor="#4B5563"
                        value={code}
                        onChangeText={setCode}
                        keyboardType="numeric"
                        style={styles.input}
                        maxLength={6}
                    />
                </View>
            </View>

            <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleLogin}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Connexion</Text>}
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.biometricBtn} 
                onPress={handleBiometricAuth}
            >
                {(Fingerprint as any)({ size: 28, color: "#6366F1" })}
                <Text style={styles.biometricText}>Déverrouillage Bio</Text>
            </TouchableOpacity>
            
            <View style={styles.footer}>
                {(ShieldCheck as any)({ size: 12, color: "#6366F1" })}
                <Text style={styles.footerText}>Infrastructure Sécurisée</Text>
            </View>
        </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    padding: 32,
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#111827',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 50,
    height: 50,
    backgroundColor: '#6366F1',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  logoText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: -1,
  },
  accent: {
    color: '#6366F1',
  },
  subtitle: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 4,
    fontWeight: '600',
  },
  inputGroup: {
    gap: 12,
    marginBottom: 32,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
    paddingHorizontal: 16,
    height: 56,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  biometricText: {
    color: '#6366F1',
    fontSize: 13,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    gap: 6,
  },
  footerText: {
    color: '#4B5563',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  }
});
