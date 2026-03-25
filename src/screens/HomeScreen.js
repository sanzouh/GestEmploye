import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text, TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getEmployes } from '../api/api';

const THEME = {
  bg:        '#EEF4E8',
  card:      '#FFFFFF',
  primary:   '#5A8A3C',
  yellow:    '#F5C842',
  textDark:  '#1A1A1A',
  textMid:   '#555555',
  textLight: '#888888',
  border:    '#E2ECD8',
  shadow:    '#C8DEB8',
};

export default function HomeScreen({ navigation }) {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', chargerStats);
    return unsubscribe;
  }, [navigation]);

  async function chargerStats() {
    try {
      const res  = await getEmployes();
      const data = res.data;
      const sal  = data.map(e => Number(e.salaire));
      setStats({
        total: data.length,
        masse: sal.reduce((a, b) => a + b, 0),
        max:   Math.max(...sal),
        min:   Math.min(...sal),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <SafeAreaView style={styles.center}>
      <ActivityIndicator size="large" color={THEME.primary} />
      <Text style={styles.loadingText}>Chargement...</Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.bg} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* En-tête */}
        <View style={styles.header}>
          <View>
            <Text style={styles.subtitle}>Tableau de bord</Text>
            <Text style={styles.title}>
              Gest<Text style={styles.accent}>Employé</Text>
            </Text>
          </View>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>GE</Text>
          </View>
        </View>

        {/* Statistiques */}
        {stats && (
          <View style={styles.grid}>
            <StatCard
              icon="👥"
              label="Employés"
              value={stats.total}
              color={THEME.primary}
              bgColor="#E8F3E0"
            />
            <StatCard
              icon="💰"
              label="Masse sal."
              value={`${stats.masse.toLocaleString('fr-FR')} €`}
              color="#2E7D32"
              bgColor="#E8F5E9"
            />
            <StatCard
              icon="📈"
              label="Max"
              value={`${stats.max.toLocaleString('fr-FR')} €`}
              color="#E65100"
              bgColor="#FFF3E0"
            />
            <StatCard
              icon="📉"
              label="Min"
              value={`${stats.min.toLocaleString('fr-FR')} €`}
              color="#C62828"
              bgColor="#FFEBEE"
            />
          </View>
        )}

        {/* Boutons de navigation */}
        <Text style={styles.sectionLabel}>NAVIGATION RAPIDE</Text>
        <View style={styles.menu}>
          <MenuBtn
            icon="📋"
            title="Liste des Employés"
            sub="Voir et gérer tous les employés"
            accent={THEME.primary}
            onPress={() => navigation.navigate('Liste')}
          />
          <MenuBtn
            icon="➕"
            title="Ajouter un Employé"
            sub="Enregistrer un nouvel employé"
            accent={THEME.yellow}
            onPress={() => navigation.navigate('Ajouter')}
          />
          <MenuBtn
            icon="📊"
            title="Statistiques"
            sub="Histogramme et camembert"
            accent="#5B8AF5"
            onPress={() => navigation.navigate('Stats')}
          />
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, label, value, color, bgColor }) {
  return (
    <View style={[styles.statCard, { backgroundColor: bgColor }]}>
      <View style={[styles.statIconWrap, { backgroundColor: color + '22' }]}>
        <Text style={styles.statIcon}>{icon}</Text>
      </View>
      <Text style={[styles.statValue, { color }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MenuBtn({ icon, title, sub, onPress, accent }) {
  return (
    <TouchableOpacity style={styles.menuBtn} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.menuIconWrap, { backgroundColor: accent + '18' }]}>
        <Text style={styles.menuIcon}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSub}>{sub}</Text>
      </View>
      <View style={[styles.arrowWrap, { backgroundColor: accent + '18' }]}>
        <Text style={[styles.arrow, { color: accent }]}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: THEME.bg },
  container:    { flex: 1, backgroundColor: THEME.bg },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: THEME.bg, gap: 12 },
  loadingText:  { color: THEME.textLight, fontSize: 14 },

  header:       {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 22, paddingTop: 20, paddingBottom: 18,
  },
  subtitle:     { color: THEME.textLight, fontSize: 13, marginBottom: 3, fontWeight: '500' },
  title:        { color: THEME.textDark, fontSize: 30, fontWeight: '900', letterSpacing: -0.5 },
  accent:       { color: THEME.primary },
  avatarCircle: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: THEME.primary, justifyContent: 'center', alignItems: 'center',
    shadowColor: THEME.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  avatarText:   { color: '#fff', fontWeight: '800', fontSize: 14 },

  sectionLabel: {
    color: THEME.textLight, fontSize: 11, fontWeight: '700',
    letterSpacing: 1.2, textTransform: 'uppercase',
    paddingHorizontal: 22, marginBottom: 10, marginTop: 4,
  },

  grid:         {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, gap: 10, marginBottom: 20,
  },
  statCard:     {
    width: '47%', borderRadius: 18, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  statIconWrap: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statIcon:     { fontSize: 20 },
  statValue:    { fontSize: 15, fontWeight: '800', marginBottom: 3 },
  statLabel:    { color: THEME.textLight, fontSize: 11, fontWeight: '500' },

  menu:         { paddingHorizontal: 16, gap: 10 },
  menuBtn:      {
    backgroundColor: THEME.card, borderRadius: 18, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  menuIconWrap: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  menuIcon:     { fontSize: 22 },
  menuTitle:    { color: THEME.textDark, fontSize: 15, fontWeight: '700' },
  menuSub:      { color: THEME.textLight, fontSize: 12, marginTop: 2 },
  arrowWrap:    { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  arrow:        { fontSize: 20, fontWeight: '700', marginTop: -1 },
});
