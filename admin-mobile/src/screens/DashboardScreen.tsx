import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  RefreshControl,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import api from '../services/api';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { 
  TrendingUp, 
  Users, 
  Zap, 
  MousePointer2, 
  ArrowUpRight,
  ShieldCheck,
  Bell
} from 'lucide-react-native';
import { 
  VictoryLine, 
  VictoryChart, 
  VictoryTheme, 
  VictoryAxis,
  VictoryArea,
  VictoryTooltip,
  VictoryVoronoiContainer
} from 'victory-native';

const { width } = Dimensions.get('window');

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true
  }),
});

export default function DashboardScreen({ navigation }: any) {
  const [data, setData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  const registerForPushNotifications = async () => {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        return;
      }
      const token = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })).data;
      console.log('[Push] Token:', token);
    }
  };

  const sendTestNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "💰 Revenu en hausse !",
        body: "Vos revenus ont augmenté de 15% aujourd'hui. 🚀",
        data: { data: 'goes here' },
      },
      trigger: { type: 'timeInterval', seconds: 2 } as any,
    });
  };

  useEffect(() => {
    fetchData();
    registerForPushNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (!data) return (
    <View style={styles.loader}>
        <Text style={styles.loaderText}>Chargement des données PRO...</Text>
    </View>
  );

  const chartData = data.revenueGraph.map((g: any, index: number) => ({
    x: index,
    y: parseFloat(g.revenue),
    label: `${g.revenue}€`
  }));

  return (
    <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />}
    >
      <View style={styles.header}>
        <View>
            <Text style={styles.greeting}>Bonjour, Admin</Text>
            <Text style={styles.title}>Cockpit Stratégique</Text>
        </View>
        <TouchableOpacity style={styles.statusBadge} onPress={sendTestNotification}>
            {(Bell as any)({ size: 12, color: "#6366F1" })}
            <Text style={styles.statusText}>Alerte Test</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.statusBadge, { borderColor: 'rgba(16, 185, 129, 0.2)' }]}>
            {(Zap as any)({ size: 12, color: "#10B981" })}
            <Text style={styles.statusText}>Système Optimal</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
          <StatCard title="Utilisateurs" value={data.users} icon={(Users as any)({ size: 16, color: "#6366F1" })} color="#6366F1" />
          <StatCard title="Revenu (Jour)" value={`${data.today.revenue}€`} icon={(TrendingUp as any)({ size: 16, color: "#10B981" })} color="#10B981" />
          <StatCard title="CTR Ads" value={`${data.today.ctr}%`} icon={(MousePointer2 as any)({ size: 16, color: "#F59E0B" })} color="#F59E0B" />
          <StatCard title="Flux Actifs" value={data.activeStreams} icon={(Zap as any)({ size: 16, color: "#8B5CF6" })} color="#8B5CF6" />
      </View>

      <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Revenus (7 jours)</Text>
              <Text style={styles.chartSubtitle}>Analyse de rentabilité mobile</Text>
          </View>
          
          <VictoryChart 
            width={width - 48} 
            height={220}
            padding={{ top: 20, bottom: 40, left: 40, right: 20 }}
            containerComponent={<VictoryVoronoiContainer />}
          >
            <VictoryArea
              data={chartData}
              style={{
                data: { fill: 'rgba(99, 102, 241, 0.1)', stroke: '#6366F1', strokeWidth: 3 }
              }}
              interpolation="monotoneX"
            />
            <VictoryAxis 
                style={{ 
                    axis: { stroke: 'transparent' }, 
                    tickLabels: { fill: '#4B5563', fontSize: 10, fontWeight: 'bold' } 
                }}
                tickFormat={(t) => `${t}j`}
            />
            <VictoryAxis 
                dependentAxis 
                style={{ 
                    axis: { stroke: 'transparent' }, 
                    tickLabels: { fill: '#4B5563', fontSize: 10, fontWeight: 'bold' } 
                }}
                tickFormat={(t) => `${t}€`}
            />
          </VictoryChart>
      </View>

      <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Ads')}>
          <View style={styles.actionInfo}>
              <View style={styles.actionIcon}>
                  {(MousePointer2 as any)({ size: 20, color: "#6366F1" })}
              </View>
              <View>
                  <Text style={styles.actionTitle}>Gestion des Publicités</Text>
                  <Text style={styles.actionSubtitle}>Optimiser le Yield Mobile</Text>
              </View>
          </View>
          {(ArrowUpRight as any)({ size: 20, color: "#4B5563" })}
      </TouchableOpacity>

      <TouchableOpacity style={[styles.actionCard, { marginTop: -24 }]} onPress={() => navigation.navigate('UserManagement')}>
          <View style={styles.actionInfo}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' }]}>
                  {(ShieldCheck as any)({ size: 20, color: "#10B981" })}
              </View>
              <View>
                  <Text style={styles.actionTitle}>Gestion Utilisateurs</Text>
                  <Text style={styles.actionSubtitle}>Reset Session & Sécurité</Text>
              </View>
          </View>
          {(ArrowUpRight as any)({ size: 20, color: "#4B5563" })}
      </TouchableOpacity>

      <View style={styles.footer}>
          {(ShieldCheck as any)({ size: 14, color: "#4B5563" })}
          <Text style={styles.footerText}>Infrastructure INES TV v2.4</Text>
      </View>
    </ScrollView>
  );
}

function StatCard({ title, value, icon, color }: any) {
    return (
        <View style={styles.card}>
            <View style={[styles.iconBox, { backgroundColor: `${color}15`, borderColor: `${color}30` }]}>
                {icon}
            </View>
            <Text style={styles.cardLabel}>{title}</Text>
            <Text style={styles.cardValue}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
    padding: 24,
  },
  loader: {
    flex: 1,
    backgroundColor: '#0B0F19',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    color: '#4B5563',
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 40,
    marginBottom: 32,
  },
  greeting: {
    color: '#4B5563',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  statusText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  card: {
    width: (width - 60) / 2,
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 16,
  },
  cardLabel: {
    color: '#4B5563',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardValue: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  chartContainer: {
    backgroundColor: '#111827',
    borderRadius: 32,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  chartHeader: {
    marginBottom: 16,
  },
  chartTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chartSubtitle: {
    color: '#4B5563',
    fontSize: 12,
    fontWeight: '600',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111827',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1F2937',
    marginBottom: 40,
  },
  actionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionIcon: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  actionTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  actionSubtitle: {
    color: '#4B5563',
    fontSize: 11,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 40,
  },
  footerText: {
    color: '#1F2937',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  }
});
