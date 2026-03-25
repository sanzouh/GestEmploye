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
import { createEmploye } from '../api/api';

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
  if (s > 5000)  return 'grand';
  if (s >= 1000) return 'moyen';
  return 'mediocre';
}

const OBS_COLORS = {
  grand:    { text: '#2E7D32', bg: '#E8F5E9', border: '#A5D6A7', icon: '📈' },
  moyen:    { text: '#E65100', bg: '#FFF3E0', border: '#FFCC80', icon: '➡️' },
  mediocre: { text: '#C62828', bg: '#FFEBEE', border: '#EF9A9A', icon: '📉' },
};

function InputField({ label, value, onChangeText, placeholder, keyboardType }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={THEME.textLight}
        keyboardType={keyboardType || 'default'}
      />
    </View>
  );
}

export default function AjouterScreen({ navigation }) {
  const [numEmp,  setNumEmp]  = useState('');
  const [nom,     setNom]     = useState('');
  const [salaire, setSalaire] = useState('');
  const [saving,  setSaving]  = useState(false);

  const obs = salaire ? calcObs(salaire) : null;
  const cl  = obs ? OBS_COLORS[obs] : null;

  async function handleSave() {
    if (!numEmp.trim() || !nom.trim() || !salaire.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    setSaving(true);
    try {
      await createEmploye({ numEmp, nom, salaire });
      Alert.alert('Succès', 'Employé ajouté avec succès !', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Erreur', e.response?.data?.error || 'Erreur serveur');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation?.goBack()}>
          <Text style={styles.iconBtnText}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Ajouter un Employé</Text>
          <Text style={styles.headerSub}>Enregistrer un nouvel employé</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar Placeholder */}
        <TouchableOpacity style={styles.avatarPicker}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>
              {nom ? nom.charAt(0).toUpperCase() : '+'}
            </Text>
          </View>
          <Text style={styles.avatarHint}>Ajouter une photo</Text>
        </TouchableOpacity>

        {/* Formulaire principal */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Informations de l'employé</Text>

          <InputField
            label="NUMÉRO EMPLOYÉ"
            value={numEmp}
            onChangeText={setNumEmp}
            placeholder="ex: E009"
          />
          <InputField
            label="NOM COMPLET"
            value={nom}
            onChangeText={setNom}
            placeholder="ex: Ranaivo Pierre"
          />
          <InputField
            label="SALAIRE (ARIARY)"
            value={salaire}
            onChangeText={setSalaire}
            placeholder="ex: 3500"
            keyboardType="numeric"
          />
        </View>

        {/* Aperçu OBS calculée */}
        {obs && cl && (
          <View style={[styles.obsCard, { backgroundColor: cl.bg, borderColor: cl.border }]}>
            <View style={styles.obsHeader}>
              <Text style={styles.obsIcon}>{cl.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.obsBoxLabel}>Observation calculée</Text>
                <Text style={[styles.obsBoxValue, { color: cl.text }]}>
                  {obs.toUpperCase()}
                </Text>
              </View>
              <View style={[styles.obsBadge, { borderColor: cl.border }]}>
                <Text style={[styles.obsBadgeText, { color: cl.text }]}>AUTO</Text>
              </View>
            </View>
            <Text style={[styles.obsBoxRule, { color: cl.text + 'AA' }]}>
              {obs === 'grand'    ? '✓ Salaire > 5 000 €'
             : obs === 'moyen'    ? '~ 1 000 ≤ Salaire ≤ 5 000 €'
             :                     '✗ Salaire < 1 000 €'}
            </Text>
          </View>
        )}

        {/* Tableau récapitulatif des règles */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>RÈGLE D'OBSERVATION</Text>
          {[
            { rule: 'Salaire > 5 000 €',         obs: 'Grand',    color: '#2E7D32', bg: '#E8F5E9' },
            { rule: '1 000 ≤ Salaire ≤ 5 000 €', obs: 'Moyen',    color: '#E65100', bg: '#FFF3E0' },
            { rule: 'Salaire < 1 000 €',          obs: 'Médiocre', color: '#C62828', bg: '#FFEBEE' },
          ].map((r, i) => (
            <View key={i} style={styles.ruleRow}>
              <View style={[styles.ruleDot, { backgroundColor: r.color }]} />
              <Text style={styles.ruleText}>{r.rule}</Text>
              <View style={[styles.ruleChip, { backgroundColor: r.bg }]}>
                <Text style={[styles.ruleObs, { color: r.color }]}>{r.obs}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Footer avec bouton sauvegarder */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation?.goBack()}
        >
          <Text style={styles.cancelBtnText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitBtn, saving && styles.submitBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.submitBtnText}>
            {saving ? 'Enregistrement...' : '💾  Enregistrer'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:               { flex: 1, backgroundColor: THEME.bg },
  header:             {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10,
  },
  iconBtn:            {
    width: 40, height: 40, borderRadius: 13,
    backgroundColor: THEME.card, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07, shadowRadius: 4, elevation: 2,
  },
  iconBtnText:        { fontSize: 22, color: THEME.textDark, marginTop: -2 },
  headerTitle:        { fontSize: 17, fontWeight: '800', color: THEME.textDark },
  headerSub:          { fontSize: 12, color: THEME.textLight, marginTop: 1 },

  scroll:             { flex: 1, paddingHorizontal: 16 },

  avatarPicker:       { alignItems: 'center', paddingVertical: 20 },
  avatarCircle:       {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: THEME.primary + '22',
    borderWidth: 2.5, borderColor: THEME.primary,
    borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  avatarLetter:       { fontSize: 34, color: THEME.primary, fontWeight: '800' },
  avatarHint:         { fontSize: 13, color: THEME.primary, fontWeight: '600' },

  formCard:           {
    backgroundColor: THEME.card, borderRadius: 20,
    padding: 18, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  sectionTitle:       {
    fontSize: 13, fontWeight: '800', color: THEME.textDark,
    marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5,
  },

  fieldWrap:          { marginBottom: 14 },
  fieldLabel:         {
    fontSize: 11, fontWeight: '700', color: THEME.textMid,
    marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.8,
  },
  input:              {
    backgroundColor: THEME.inputBg, borderRadius: 13,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 14, color: THEME.textDark,
    borderWidth: 1.5, borderColor: THEME.border,
  },

  obsCard:            {
    borderRadius: 16, padding: 16, marginBottom: 14,
    borderWidth: 1.5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  obsHeader:          { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  obsIcon:            { fontSize: 26 },
  obsBoxLabel:        { fontSize: 11, color: THEME.textLight, fontWeight: '500', marginBottom: 2 },
  obsBoxValue:        { fontSize: 20, fontWeight: '900', letterSpacing: 0.5 },
  obsBadge:           {
    borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
  },
  obsBadgeText:       { fontSize: 10, fontWeight: '800' },
  obsBoxRule:         { fontSize: 12, fontWeight: '500' },

  ruleRow:            {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginBottom: 10,
  },
  ruleDot:            { width: 8, height: 8, borderRadius: 4 },
  ruleText:           { flex: 1, fontSize: 13, color: THEME.textMid },
  ruleChip:           { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  ruleObs:            { fontWeight: '800', fontSize: 12 },

  footer:             {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: THEME.card,
    borderTopWidth: 1, borderTopColor: THEME.border,
  },
  cancelBtn:          {
    flex: 1, height: 52, borderRadius: 26,
    borderWidth: 1.5, borderColor: THEME.border,
    justifyContent: 'center', alignItems: 'center',
  },
  cancelBtnText:      { fontSize: 15, fontWeight: '600', color: THEME.textMid },
  submitBtn:          {
    flex: 2, height: 52, borderRadius: 26,
    backgroundColor: THEME.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: THEME.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 5,
  },
  submitBtnDisabled:  { opacity: 0.6 },
  submitBtnText:      { fontSize: 15, fontWeight: '700', color: '#fff' },
});
