import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deleteEmploye, updateEmploye } from '../api/api';

const THEME = {
  bg:        '#EEF4E8',
  card:      '#FFFFFF',
  primary:   '#5A8A3C',
  yellow:    '#F5C842',
  textDark:  '#1A1A1A',
  textMid:   '#555555',
  textLight: '#888888',
  border:    '#E2ECD8',
  inputBg:   '#F7FAF4',
};

function calcObs(sal) {
  const s = parseFloat(sal);
  if (s > 5000) return 'grand';
  if (s >= 1000) return 'moyen';
  return 'mediocre';
}

const OBS_COLORS = {
  grand:    { text: '#2E7D32', bg: '#E8F5E9', border: '#A5D6A7', heroTop: '#2E7D32', heroBtm: '#4A7C59' },
  moyen:    { text: '#E65100', bg: '#FFF3E0', border: '#FFCC80', heroTop: '#BF360C', heroBtm: '#E65100' },
  mediocre: { text: '#C62828', bg: '#FFEBEE', border: '#EF9A9A', heroTop: '#7F0000', heroBtm: '#C62828' },
};

export default function DetailScreen({ route, navigation }) {
  const emp = route.params.employe;

  const [editing,  setEditing]  = useState(false);
  const [nom,      setNom]      = useState(emp.nom);
  const [salaire,  setSalaire]  = useState(String(emp.salaire));
  const [saving,   setSaving]   = useState(false);

  const obs = (emp.obs && OBS_COLORS[emp.obs]) ? emp.obs : calcObs(emp.salaire);
  const cl  = OBS_COLORS[obs];

  // ── Modifier ────────────────────────────────────────
  async function handleUpdate() {
    if (!nom.trim() || !salaire.trim()) {
      Alert.alert('Erreur', 'Remplissez tous les champs');
      return;
    }
    setSaving(true);
    try {
      await updateEmploye(emp.id, { nom, salaire });
      Alert.alert('Succès', 'Employé mis à jour !', [
        { text: 'OK', onPress: () => { setEditing(false); navigation.goBack(); } }
      ]);
    } catch (e) {
      Alert.alert('Erreur', e.response?.data?.error || 'Erreur serveur');
    } finally { setSaving(false); }
  }

  // ── Supprimer ───────────────────────────────────────
  function handleDelete() {
    Alert.alert(
      'Confirmer suppression',
      `Supprimer ${emp.nom} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer', style: 'destructive',
          onPress: async () => {
            try {
              await deleteEmploye(emp.id);
              navigation.goBack();
            } catch (e) {
              Alert.alert('Erreur', 'Suppression échouée');
            }
          }
        }
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={cl.heroTop} />

      {/* Hero Section */}
      <View style={[styles.hero, { backgroundColor: cl.heroTop }]}>
        {/* Header buttons */}
        <View style={styles.heroHeader}>
          <TouchableOpacity style={styles.heroBtn} onPress={() => navigation?.goBack()}>
            <Text style={styles.heroBtnText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.heroActions}>
            <TouchableOpacity
              style={[styles.heroBtn, editing && styles.heroBtnActive]}
              onPress={() => setEditing(!editing)}
            >
              <Text style={styles.heroBtnText}>{editing ? '✕' : '✏️'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.heroBtn} onPress={handleDelete}>
              <Text style={styles.heroBtnText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Avatar large */}
        <View style={styles.heroAvatarWrap}>
          <View style={[styles.heroAvatar, { backgroundColor: cl.heroBtm }]}>
            <Text style={styles.heroAvatarText}>
              {emp.nom.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Profile Card */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.profileCard}>
          {/* Nom & numéro */}
          <Text style={styles.profileName}>{emp.nom}</Text>
          <Text style={styles.profileNum}>{emp.numemp || emp.numEmp}</Text>

          {/* Badge observation */}
          <View style={[styles.obsBadge, { backgroundColor: cl.bg, borderColor: cl.border }]}>
            <Text style={[styles.obsBadgeText, { color: cl.text }]}>
              {obs.toUpperCase()}
            </Text>
          </View>

          {/* Salaire card */}
          <View style={[styles.salaireCard, { backgroundColor: cl.bg, borderColor: cl.border }]}>
            <View>
              <Text style={styles.salaireLabel}>Salaire mensuel</Text>
              <Text style={[styles.salaireValue, { color: cl.text }]}>
                {parseFloat(emp.salaire).toLocaleString()}
                <Text style={styles.salaireUnit}> €</Text>
              </Text>
            </View>
            <Text style={{ fontSize: 38 }}>💵</Text>
          </View>

          {/* Formulaire de modification */}
          {editing && (
            <View style={styles.editCard}>
              <Text style={styles.editCardTitle}>✏️ Modifier l'employé</Text>

              <Text style={styles.fieldLabel}>NOM COMPLET</Text>
              <TextInput
                style={styles.input}
                value={nom}
                onChangeText={setNom}
                placeholderTextColor={THEME.textLight}
              />
              <Text style={styles.fieldLabel}>SALAIRE (Ar)</Text>
              <TextInput
                style={styles.input}
                value={salaire}
                onChangeText={setSalaire}
                keyboardType="numeric"
                placeholderTextColor={THEME.textLight}
              />
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleUpdate}
                disabled={saving}
              >
                <Text style={styles.saveBtnText}>
                  {saving ? 'Sauvegarde...' : '💾  Sauvegarder les modifications'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Zone suppression */}
          <View style={styles.dangerCard}>
            <View style={styles.dangerHeader}>
              <Text style={styles.dangerIcon}>⚠️</Text>
              <View>
                <Text style={styles.dangerTitle}>Zone dangereuse</Text>
                <Text style={styles.dangerSub}>Cette action est irréversible</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Text style={styles.deleteBtnText}>🗑️  Supprimer cet employé</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: THEME.bg },

  hero:             { height: 240, justifyContent: 'space-between', paddingBottom: 0 },
  heroHeader:       {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16,
  },
  heroActions:      { flexDirection: 'row', gap: 10 },
  heroBtn:          {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center', alignItems: 'center',
  },
  heroBtnActive:    { backgroundColor: 'rgba(255,255,255,0.35)' },
  heroBtnText:      { color: '#fff', fontSize: 20 },
  heroAvatarWrap:   { alignItems: 'center', paddingBottom: 0, marginTop: 14 },
  heroAvatar:       {
    width: 100, height: 100, borderRadius: 50,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 4, borderColor: 'rgba(255,255,255,0.3)',
  },
  heroAvatarText:   { fontSize: 38, fontWeight: '900', color: '#fff' },

  scroll:           { flex: 1 },
  profileCard:      {
    backgroundColor: THEME.card,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    marginTop: -24, padding: 24, paddingBottom: 40,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 6,
    minHeight: '100%',
  },
  profileName:      {
    fontSize: 26, fontWeight: '800', color: THEME.textDark,
    letterSpacing: -0.3, textAlign: 'center', marginBottom: 4,
  },
  profileNum:       {
    fontSize: 14, color: THEME.textLight,
    textAlign: 'center', marginBottom: 14, fontWeight: '500',
  },
  obsBadge:         {
    alignSelf: 'center', borderRadius: 20,
    paddingHorizontal: 20, paddingVertical: 6,
    borderWidth: 1.5, marginBottom: 20,
  },
  obsBadgeText:     { fontWeight: '800', fontSize: 13, letterSpacing: 0.5 },

  salaireCard:      {
    borderRadius: 18, padding: 18,
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', borderWidth: 1.5, marginBottom: 16,
  },
  salaireLabel:     { color: THEME.textLight, fontSize: 12, marginBottom: 5, fontWeight: '500' },
  salaireValue:     { fontSize: 28, fontWeight: '900' },
  salaireUnit:      { fontSize: 14, fontWeight: '400', color: THEME.textLight },

  editCard:         {
    backgroundColor: THEME.bg, borderRadius: 18, padding: 18,
    marginBottom: 16, borderWidth: 1.5, borderColor: THEME.border,
  },
  editCardTitle:    { fontSize: 15, fontWeight: '700', color: THEME.textDark, marginBottom: 16 },
  fieldLabel:       {
    fontSize: 11, fontWeight: '700', color: THEME.textMid,
    marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.8,
  },
  input:            {
    backgroundColor: THEME.card, borderRadius: 13,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 14, color: THEME.textDark,
    borderWidth: 1.5, borderColor: THEME.border, marginBottom: 14,
  },
  saveBtn:          {
    backgroundColor: THEME.primary, borderRadius: 14,
    padding: 15, alignItems: 'center',
    shadowColor: THEME.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  saveBtnDisabled:  { opacity: 0.6 },
  saveBtnText:      { color: '#fff', fontWeight: '700', fontSize: 14 },

  dangerCard:       {
    backgroundColor: '#FFF5F5', borderRadius: 18, padding: 18,
    borderWidth: 1.5, borderColor: '#FFCDD2', marginBottom: 10,
  },
  dangerHeader:     { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  dangerIcon:       { fontSize: 24 },
  dangerTitle:      { color: '#C62828', fontSize: 14, fontWeight: '800' },
  dangerSub:        { color: '#EF9A9A', fontSize: 12, marginTop: 1 },
  deleteBtn:        {
    backgroundColor: '#FFEBEE', borderWidth: 1.5, borderColor: '#EF9A9A',
    borderRadius: 13, padding: 14, alignItems: 'center',
  },
  deleteBtnText:    { color: '#C62828', fontWeight: '700', fontSize: 14 },
});
