import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
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
};

// Calcul obs — forcer Number()
function getObs(sal) {
  const s = Number(sal);
  if (s > 5000)  return 'grand';
  if (s >= 1000) return 'moyen';
  return 'mediocre';
}

const OBS_COLORS = {
  grand:    { text: '#2E7D32', bg: '#E8F5E9', border: '#A5D6A7' },
  moyen:    { text: '#E65100', bg: '#FFF3E0', border: '#FFCC80' },
  mediocre: { text: '#C62828', bg: '#FFEBEE', border: '#EF9A9A' },
};

const FILTRE_LABELS = {
  tous: 'Tous',
  grand: 'Grand',
  moyen: 'Moyen',
  mediocre: 'Médiocre',
};

export default function ListeScreen({ navigation }) {
  const [employes,  setEmployes]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [filtre,    setFiltre]    = useState('tous');

  useEffect(() => {
    const unsub = navigation.addListener('focus', charger);
    return unsub;
  }, [navigation]);

  async function charger() {
    setLoading(true);
    try {
      const res = await getEmployes();
      setEmployes(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  // Filtrage et recherche
  const liste = useMemo(() => {
    return employes.filter(e => {
      const obs   = (e.obs && OBS_COLORS[e.obs]) ? e.obs : getObs(e.salaire);
      const okF   = filtre === 'tous' || obs === filtre;
      const okS   = e.nom.toLowerCase().includes(search.toLowerCase())
                 || (e.numemp || e.numEmp || '').toLowerCase().includes(search.toLowerCase());
      return okF && okS;
    });
  }, [employes, search, filtre]);

  // Stats bas de FlatList
  const total = employes.reduce((a, e) => a + Number(e.salaire), 0);
  const max   = employes.length ? Math.max(...employes.map(e => Number(e.salaire))) : 0;
  const min   = employes.length ? Math.min(...employes.map(e => Number(e.salaire))) : 0;

  // Rendu d'une carte employé
  const renderItem = ({ item, index }) => {
    const obs = (item.obs && OBS_COLORS[item.obs]) ? item.obs : getObs(item.salaire);
    const cl  = OBS_COLORS[obs];
    const isFirst = index === 0;
    return (
      <TouchableOpacity
        style={[styles.card, isFirst && styles.cardFirst]}
        onPress={() => navigation.navigate('Detail', { employe: item })}
        activeOpacity={0.75}
      >
        <View style={[styles.avatar, { backgroundColor: cl.bg, borderColor: cl.border }]}>
          <Text style={[styles.avatarText, { color: cl.text }]}>
            {item.nom.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.row}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.nom}>{item.nom}</Text>
              {isFirst && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>NOUVEAU</Text>
                </View>
              )}
            </View>
            <Text style={styles.salaire}>{Number(item.salaire).toLocaleString()} €</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.numEmp}>{item.numemp || item.numEmp}</Text>
            <View style={[styles.badge, { backgroundColor: cl.bg, borderColor: cl.border }]}>
              <Text style={[styles.badgeText, { color: cl.text }]}>{obs.toUpperCase()}</Text>
            </View>
          </View>
        </View>
        <View style={styles.arrowWrap}>
          <Text style={styles.arrowText}>↗</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) return (
    <SafeAreaView style={styles.center}>
      <ActivityIndicator size="large" color={THEME.primary} />
      <Text style={styles.loadingText}>Chargement...</Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>Gestion</Text>
          <Text style={styles.headerTitle}>Hiring</Text>
          <Text style={styles.headerDesc}>Find the best talent for your team</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Text style={styles.iconBtnText}>⚙</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Text style={styles.iconBtnText}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchRow}>
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher nom ou numéro..."
            placeholderTextColor={THEME.textLight}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Stats rapides */}
      <View style={styles.statsRow}>
        {[
          { label: 'Total',     value: employes.length, color: THEME.primary },
          { label: 'Grands',    value: employes.filter(e => ((e.obs && OBS_COLORS[e.obs]) ? e.obs : getObs(e.salaire)) === 'grand').length,    color: '#2E7D32' },
          { label: 'Moyens',    value: employes.filter(e => ((e.obs && OBS_COLORS[e.obs]) ? e.obs : getObs(e.salaire)) === 'moyen').length,    color: '#E65100' },
          { label: 'Médiocres', value: employes.filter(e => ((e.obs && OBS_COLORS[e.obs]) ? e.obs : getObs(e.salaire)) === 'mediocre').length, color: '#C62828' },
        ].map(s => (
          <View key={s.label} style={styles.statPill}>
            <Text style={[styles.statPillValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statPillLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Filtres */}
      <View style={styles.filtres}>
        {['tous','grand','moyen','mediocre'].map(f => (
          <TouchableOpacity key={f}
            style={[styles.filtreBtn, filtre === f && styles.filtreBtnActive]}
            onPress={() => setFiltre(f)}
            activeOpacity={0.75}
          >
            <Text style={[styles.filtreText, filtre === f && styles.filtreTextActive]}>
              {FILTRE_LABELS[f]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Liste FlatList */}
      <FlatList
        data={liste}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.empty}>Aucun employé trouvé</Text>
          </View>
        }
        ListFooterComponent={
          employes.length > 0 ? (
            <View style={styles.footer}>
              <View style={styles.footerItem}>
                <Text style={[styles.footerValue, { color: THEME.primary }]}>
                  {total.toLocaleString()} €
                </Text>
                <Text style={styles.footerLabel}>Total</Text>
              </View>
              <View style={styles.footerDivider} />
              <View style={styles.footerItem}>
                <Text style={[styles.footerValue, { color: '#2E7D32' }]}>
                  {max.toLocaleString()} €
                </Text>
                <Text style={styles.footerLabel}>Max</Text>
              </View>
              <View style={styles.footerDivider} />
              <View style={styles.footerItem}>
                <Text style={[styles.footerValue, { color: '#C62828' }]}>
                  {min.toLocaleString()} €
                </Text>
                <Text style={styles.footerLabel}>Min</Text>
              </View>
            </View>
          ) : null
        }
      />

      {/* Bouton Ajouter FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Ajouter')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: THEME.bg },
  center:           { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: THEME.bg, gap: 10 },
  loadingText:      { color: THEME.textLight, fontSize: 14 },

  header:           {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8,
  },
  headerSub:        { fontSize: 12, color: THEME.textLight, fontWeight: '500', marginBottom: 1 },
  headerTitle:      { fontSize: 30, fontWeight: '900', color: THEME.textDark, letterSpacing: -0.5 },
  headerDesc:       { fontSize: 13, color: THEME.textLight, marginTop: 2 },
  headerRight:      { flexDirection: 'row', gap: 8, paddingTop: 4 },
  iconBtn:          {
    width: 38, height: 38, borderRadius: 12, backgroundColor: THEME.card,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07, shadowRadius: 4, elevation: 2,
  },
  iconBtnText:      { fontSize: 16 },

  searchRow:        { paddingHorizontal: 16, marginBottom: 10 },
  searchWrap:       {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: THEME.card, borderRadius: 14, paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  searchIcon:       { fontSize: 16 },
  searchInput:      { flex: 1, fontSize: 14, color: THEME.textDark, padding: 0 },

  statsRow:         {
    flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 10,
  },
  statPill:         {
    flex: 1, backgroundColor: THEME.card, borderRadius: 12,
    paddingVertical: 10, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  statPillValue:    { fontSize: 18, fontWeight: '800' },
  statPillLabel:    { fontSize: 10, color: THEME.textLight, marginTop: 2, fontWeight: '500' },

  filtres:          { flexDirection: 'row', paddingHorizontal: 16, gap: 6, marginBottom: 4 },
  filtreBtn:        {
    flex: 1, backgroundColor: THEME.card, borderRadius: 20,
    paddingVertical: 7, alignItems: 'center',
    borderWidth: 1.5, borderColor: 'transparent',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  filtreBtnActive:  { backgroundColor: THEME.primary, borderColor: THEME.primary },
  filtreText:       { color: THEME.textLight, fontSize: 11, fontWeight: '700' },
  filtreTextActive: { color: '#fff' },

  card:             {
    backgroundColor: THEME.card, borderRadius: 18, padding: 14,
    marginBottom: 10, flexDirection: 'row', alignItems: 'center',
    gap: 12, borderWidth: 1.5, borderColor: 'transparent',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardFirst:        { borderColor: THEME.primary },
  avatar:           {
    width: 46, height: 46, borderRadius: 15, borderWidth: 1.5,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText:       { fontSize: 20, fontWeight: '900' },
  row:              { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nom:              { color: THEME.textDark, fontSize: 14, fontWeight: '700' },
  salaire:          { color: THEME.textDark, fontSize: 14, fontWeight: '800' },
  numEmp:           { color: THEME.textLight, fontSize: 11, marginTop: 4 },
  badge:            {
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2,
    borderWidth: 1, marginTop: 4,
  },
  badgeText:        { fontSize: 10, fontWeight: '800' },
  newBadge:         { backgroundColor: THEME.primary, borderRadius: 99, paddingHorizontal: 6, paddingVertical: 2 },
  newBadgeText:     { color: '#fff', fontSize: 9, fontWeight: '800' },
  arrowWrap:        {
    width: 30, height: 30, borderRadius: 9,
    backgroundColor: THEME.bg, justifyContent: 'center', alignItems: 'center',
  },
  arrowText:        { fontSize: 14, color: THEME.textMid },

  emptyWrap:        { alignItems: 'center', paddingTop: 50 },
  emptyIcon:        { fontSize: 36, marginBottom: 10 },
  empty:            { color: THEME.textLight, fontSize: 14 },

  footer:           {
    backgroundColor: THEME.card, borderRadius: 18, padding: 16,
    flexDirection: 'row', justifyContent: 'space-around',
    alignItems: 'center', marginTop: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  footerItem:       { alignItems: 'center', flex: 1 },
  footerValue:      { fontSize: 13, fontWeight: '800' },
  footerLabel:      { fontSize: 10, color: THEME.textLight, marginTop: 2 },
  footerDivider:    { width: 1, height: 30, backgroundColor: THEME.border },

  fab:              {
    position: 'absolute', bottom: 24, right: 24,
    backgroundColor: THEME.primary, width: 56, height: 56,
    borderRadius: 28, justifyContent: 'center', alignItems: 'center',
    shadowColor: THEME.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  fabText:          { color: '#fff', fontSize: 28, fontWeight: '300', marginTop: -2 },
});
