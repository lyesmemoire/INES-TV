import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import api from '../services/api';
import { Search, RotateCcw, Key, ShieldCheck, User as UserIcon, LogOut } from 'lucide-react-native';

export default function UserManagementScreen() {
  const [email, setEmail] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const searchUser = async () => {
    if (!email) return;
    setLoading(true);
    setUser(null);
    try {
      // We'll use a global search or exact match
      const res = await api.get(`/users`); // In production, add query param ?email=...
      const found = res.data.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (found) {
        setUser(found);
      } else {
        Alert.alert('Erreur', 'Utilisateur non trouvé');
      }
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de contacter le serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSession = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      await api.patch(`/users/${user.id}/reset-session`);
      Alert.alert('Succès', 'Session réinitialisée. L\'utilisateur peut se reconnecter.');
    } catch (err) {
      Alert.alert('Erreur', 'Échec de la réinitialisation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangePassword = () => {
    Alert.prompt(
      'Nouveau Mot de Passe',
      'Entrez le nouveau mot de passe (min 6 car.)',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Changer', 
          onPress: async (pass) => {
            if (!pass || pass.length < 6) return Alert.alert('Erreur', 'Trop court');
            try {
              await api.patch(`/users/${user.id}/reset-password`, { newPassword: pass });
              Alert.alert('Succès', 'Mot de passe mis à jour');
            } catch (e) {
              Alert.alert('Erreur', 'Échec de la mise à jour');
            }
          } 
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
            <Text style={styles.title}>User <Text style={styles.accent}>Power Tools</Text></Text>
            <Text style={styles.subtitle}>Déblocage de session et sécurité</Text>
        </View>

        <View style={styles.searchBox}>
          <Search color="#4B5563" size={20} style={styles.searchIcon} />
          <TextInput 
            style={styles.input}
            placeholder="Rechercher par email..."
            placeholderTextColor="#4B5563"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TouchableOpacity style={styles.searchButton} onPress={searchUser} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.searchButtonText}>OK</Text>}
          </TouchableOpacity>
        </View>

        {user && (
          <View style={styles.userCard}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <UserIcon color="#6366F1" size={24} />
              </View>
              <View>
                <Text style={styles.userName}>{user.name || 'Sans Nom'}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <View style={styles.badgeRow}>
                  <View style={[styles.badge, user.isPremium ? styles.premiumBadge : styles.freeBadge]}>
                    <Text style={styles.badgeText}>{user.isPremium ? 'PREMIUM' : 'FREE'}</Text>
                  </View>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{user.role}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={handleResetSession}
                disabled={actionLoading}
              >
                <RotateCcw color="#FFF" size={18} />
                <Text style={styles.actionButtonText}>Reset Session</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.secondaryAction]} 
                onPress={handleChangePassword}
              >
                <Key color="#6366F1" size={18} />
                <Text style={[styles.actionButtonText, styles.secondaryText]}>Reset Password</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.securityNote}>
              <ShieldCheck color="#10B981" size={14} />
              <Text style={styles.securityText}>Session Security Lock Active</Text>
            </View>
          </View>
        )}

        {!user && !loading && (
          <View style={styles.emptyState}>
            <LogOut color="#1F2937" size={48} />
            <Text style={styles.emptyText}>Recherchez un utilisateur pour accéder aux outils de gestion.</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  scroll: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  accent: {
    color: '#6366F1',
  },
  subtitle: {
    color: '#4B5563',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 20,
    paddingLeft: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#FFF',
    height: 56,
    fontSize: 14,
    fontWeight: '600',
  },
  searchButton: {
    backgroundColor: '#6366F1',
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  userCard: {
    backgroundColor: '#111827',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    marginRight: 20,
  },
  userName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userEmail: {
    color: '#4B5563',
    fontSize: 12,
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  premiumBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  freeBadge: {
    backgroundColor: 'rgba(75, 85, 99, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.2)',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '900',
  },
  actions: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#6366F1',
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  secondaryAction: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  secondaryText: {
    color: '#6366F1',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
  },
  securityText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    opacity: 0.5,
  },
  emptyText: {
    color: '#4B5563',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 40,
    fontWeight: '600',
  }
});
