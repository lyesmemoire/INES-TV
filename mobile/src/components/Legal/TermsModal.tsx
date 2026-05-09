import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShieldCheck, AlertTriangle } from 'lucide-react-native';

/**
 * ⚖️ LEGAL TERMS MODAL (Store Compliance Edition)
 * Mandatory first-open disclaimer for App Store / Play Store validation.
 */
export default function TermsModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    checkConsent();
  }, []);

  const checkConsent = async () => {
    const consent = await AsyncStorage.getItem('@user_legal_consent');
    if (!consent) {
      setVisible(true);
    }
  };

  const handleAccept = async () => {
    await AsyncStorage.setItem('@user_legal_consent', 'true');
    setVisible(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <ShieldCheck size={40} color="#10B981" />
          <Text style={styles.title}>Conditions & Conformité</Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.warningBox}>
            <AlertTriangle size={20} color="#F59E0B" />
            <Text style={styles.warningText}>IMPORTANT : AVERTISSEMENT LÉGAL</Text>
          </View>

          <Text style={styles.bodyText}>
            INES TV est un <Text style={styles.bold}>lecteur multimédia universel</Text> et un outil technique d'agrégation.{"\n"}{"\n"}
            Il est impératif de comprendre les points suivants avant d'utiliser l'application :{"\n"}
          </Text>

          <View style={styles.clause}>
            <Text style={styles.clauseNumber}>1.</Text>
            <Text style={styles.clauseText}>
              L'application <Text style={styles.bold}>ne fournit aucun contenu multimédia</Text>, canal, playlist ou abonnement.
            </Text>
          </View>

          <View style={styles.clause}>
            <Text style={styles.clauseNumber}>2.</Text>
            <Text style={styles.clauseText}>
              Les utilisateurs doivent fournir leur propre contenu (via des URLs M3U ou codes Xtream) dont ils détiennent les droits légaux.
            </Text>
          </View>

          <View style={styles.clause}>
            <Text style={styles.clauseNumber}>3.</Text>
            <Text style={styles.clauseText}>
              Nous n'approuvons pas le streaming de contenu protégé par le droit d'auteur sans l'autorisation du détenteur des droits.
            </Text>
          </View>

          <View style={styles.clause}>
            <Text style={styles.clauseNumber}>4.</Text>
            <Text style={styles.clauseText}>
              L'utilisation de cette application pour visualiser du contenu illégal relève de la seule responsabilité de l'utilisateur.
            </Text>
          </View>

          <Text style={styles.bodyText}>
            En cliquant sur "Accepter et Continuer", vous confirmez avoir lu, compris et accepté ces termes, ainsi que notre politique de confidentialité.
          </Text>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.button} onPress={handleAccept}>
            <Text style={styles.buttonText}>ACCEPTER ET CONTINUER</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  header: { alignItems: 'center', padding: 30, borderBottomWidth: 1, borderBottomColor: '#1f1f23' },
  title: { color: 'white', fontSize: 24, fontWeight: '900', marginTop: 15 },
  content: { flex: 1, padding: 24 },
  warningBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(245, 158, 11, 0.1)', 
    padding: 12, 
    borderRadius: 8, 
    gap: 10,
    marginBottom: 20
  },
  warningText: { color: '#F59E0B', fontSize: 13, fontWeight: '900' },
  bodyText: { color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 24, marginBottom: 20 },
  bold: { color: 'white', fontWeight: 'bold' },
  clause: { flexDirection: 'row', marginBottom: 20, gap: 15 },
  clauseNumber: { color: '#10B981', fontWeight: '900', fontSize: 18 },
  clauseText: { flex: 1, color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 22 },
  footer: { padding: 24, borderTopWidth: 1, borderTopColor: '#1f1f23' },
  button: { backgroundColor: '#10B981', padding: 18, borderRadius: 14, alignItems: 'center' },
  buttonText: { color: 'black', fontWeight: '900', fontSize: 16 }
});
