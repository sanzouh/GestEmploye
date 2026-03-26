import { useState } from "react";
import {
	Alert,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { deleteEmploye, updateEmploye } from "../api/api";
import Icon from "../components/Icon";

const THEME = {
	bg: "#EEF4E8",
	card: "#FFFFFF",
	primary: "#5A8A3C",
	yellow: "#F5C842",
	textDark: "#1A1A1A",
	textMid: "#555555",
	textLight: "#888888",
	border: "#E2ECD8",
	inputBg: "#F7FAF4",
	danger: "#C62828",
	dangerBg: "#FFEBEE",
	dangerBorder: "#EF9A9A",
};

function calcObs(sal) {
	const s = parseFloat(sal);
	if (s > 5000) return "grand";
	if (s >= 1000) return "moyen";
	return "mediocre";
}

const OBS_COLORS = {
	grand: {
		text: "#2E7D32",
		bg: "#E8F5E9",
		border: "#A5D6A7",
		heroTop: "#2E7D32",
		heroBtm: "#4A7C59",
	},
	moyen: {
		text: "#E65100",
		bg: "#FFF3E0",
		border: "#FFCC80",
		heroTop: "#BF360C",
		heroBtm: "#E65100",
	},
	mediocre: {
		text: "#C62828",
		bg: "#FFEBEE",
		border: "#EF9A9A",
		heroTop: "#7F0000",
		heroBtm: "#C62828",
	},
};

export default function DetailScreen({ route, navigation }) {
	const emp = route.params.employe;

	const [editing, setEditing] = useState(false);
	const [nom, setNom] = useState(emp.nom);
	const [salaire, setSalaire] = useState(String(emp.salaire));
	const [saving, setSaving] = useState(false);

	const obs = emp.obs && OBS_COLORS[emp.obs] ? emp.obs : calcObs(emp.salaire);
	const cl = OBS_COLORS[obs];

	const handleUpdate = async () => {
		if (!nom.trim() || !salaire.trim()) {
			Alert.alert("Erreur", "Remplissez tous les champs");
			return;
		}
		setSaving(true);
		try {
			await updateEmploye(emp.id, { nom, salaire });
			Alert.alert("Succès", "Employé mis à jour !", [
				{
					text: "OK",
					onPress: () => {
						setEditing(false);
						navigation.goBack();
					},
				},
			]);
		} catch (e) {
			Alert.alert("Erreur", e.response?.data?.error || "Erreur serveur");
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = () => {
		Alert.alert("Confirmer suppression", `Supprimer ${emp.nom} ?`, [
			{ text: "Annuler", style: "cancel" },
			{
				text: "Supprimer",
				style: "destructive",
				onPress: async () => {
					try {
						await deleteEmploye(emp.id);
						navigation.goBack();
					} catch (e) {
						Alert.alert("Erreur", "Suppression échouée");
					}
				},
			},
		]);
	};

	return (
		<SafeAreaView
			style={[styles.container, { backgroundColor: cl.heroTop }]}
			edges={["bottom"]}
		>
			<StatusBar barStyle="light-content" backgroundColor={cl.heroTop} />

			{/* Header avec avatar et actions */}
			<View style={[styles.header, { backgroundColor: cl.heroTop }]}>
				<View style={styles.headerTop}>
					{/* <TouchableOpacity
						style={styles.backBtn}
						onPress={() => navigation.goBack()}
					>
						<Icon name="chevron-back" size="large" color="white" />
					</TouchableOpacity> */}
					<View style={styles.headerActions}>
						<TouchableOpacity
							style={[styles.actionBtn, editing && styles.actionBtnActive]}
							onPress={() => setEditing(!editing)}
						>
							<Icon
								name={editing ? "close" : "pencil"}
								size="large"
								color="white"
							/>
						</TouchableOpacity>
						<TouchableOpacity style={styles.actionBtn} onPress={handleDelete}>
							<Icon name="trash" size="large" color="white" />
						</TouchableOpacity>
					</View>
				</View>

				<View style={styles.avatarSection}>
					<View style={[styles.avatar, { backgroundColor: cl.heroBtm }]}>
						<Text style={styles.avatarText}>
							{emp.nom.charAt(0).toUpperCase()}
						</Text>
					</View>
					<Text style={styles.name}>{emp.nom}</Text>
					<Text style={styles.num}>{emp.numemp || emp.numEmp}</Text>
				</View>
			</View>

			{/* Contenu scrollable */}
			<ScrollView
				style={[styles.scroll, { backgroundColor: cl.heroTop, marginTop: -12 }]}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.content}>
					{/* Badge observation */}
					<View
						style={[
							styles.obsBadge,
							{ backgroundColor: cl.bg, borderColor: cl.border },
						]}
					>
						<Text style={[styles.obsText, { color: cl.text }]}>
							{obs.toUpperCase()}
						</Text>
					</View>

					{/* Section salaire */}
					<View
						style={[
							styles.salarySection,
							{ backgroundColor: cl.bg, borderColor: cl.border },
						]}
					>
						<Text style={styles.salaryLabel}>Salaire mensuel</Text>
						<View style={styles.salaryRow}>
							<Text style={[styles.salaryValue, { color: cl.text }]}>
								{parseFloat(emp.salaire).toLocaleString()} €
							</Text>
							<Icon name="cash-outline" size="xl" color={cl.text} />
						</View>
					</View>

					{/* Formulaire de modification */}
					{editing && (
						<View style={styles.editSection}>
							<View style={styles.editHeader}>
								<Icon name="pencil" size="large" color={THEME.primary} />
								<Text style={styles.editTitle}>Modifier l'employé</Text>
							</View>

							<View style={styles.inputGroup}>
								<Text style={styles.label}>NOM COMPLET</Text>
								<TextInput
									style={styles.input}
									value={nom}
									onChangeText={setNom}
									placeholder="Nom complet"
									placeholderTextColor={THEME.textLight}
								/>
							</View>

							<View style={styles.inputGroup}>
								<Text style={styles.label}>SALAIRE (€)</Text>
								<TextInput
									style={styles.input}
									value={salaire}
									onChangeText={setSalaire}
									keyboardType="numeric"
									placeholder="Salaire"
									placeholderTextColor={THEME.textLight}
								/>
							</View>

							<TouchableOpacity
								style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
								onPress={handleUpdate}
								disabled={saving}
							>
								{saving ? (
									<Text style={styles.saveBtnText}>Sauvegarde...</Text>
								) : (
									<View style={styles.saveBtnContent}>
										<Icon name="save" size="medium" color="white" />
										<Text style={styles.saveBtnText}>Sauvegarder</Text>
									</View>
								)}
							</TouchableOpacity>
						</View>
					)}

					{/* Zone danger */}
					<View style={styles.dangerSection}>
						<View style={styles.dangerHeader}>
							<Icon name="warning" size="large" color={THEME.danger} />
							<View>
								<Text style={styles.dangerTitle}>Zone dangereuse</Text>
								<Text style={styles.dangerSub}>
									Cette action est irréversible
								</Text>
							</View>
						</View>
						<TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
							<View style={styles.deleteBtnContent}>
								<Icon name="trash" size="medium" color={THEME.danger} />
								<Text style={styles.deleteBtnText}>Supprimer cet employé</Text>
							</View>
						</TouchableOpacity>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: THEME.bg,
	},

	// Header
	header: {
		paddingTop: 0,
		paddingBottom: 20,
	},
	headerTop: {
		flexDirection: "row",
		justifyContent: "flex-end",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingTop: 20,
		marginBottom: 20,
	},
	backBtn: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: "rgba(255,255,255,0.2)",
		justifyContent: "center",
		alignItems: "center",
	},
	headerActions: {
		flexDirection: "row",
		gap: 12,
	},
	actionBtn: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: "rgba(255,255,255,0.2)",
		justifyContent: "center",
		alignItems: "center",
	},
	actionBtnActive: {
		backgroundColor: "rgba(255,255,255,0.4)",
	},

	// Avatar section
	avatarSection: {
		alignItems: "center",
	},
	avatar: {
		width: 90,
		height: 90,
		borderRadius: 45,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 4,
		borderColor: "rgba(255,255,255,0.3)",
		marginBottom: 12,
	},
	avatarText: {
		fontSize: 36,
		fontWeight: "900",
		color: "#fff",
	},
	name: {
		fontSize: 22,
		fontWeight: "800",
		color: "#fff",
		marginBottom: 4,
		textAlign: "center",
	},
	num: {
		fontSize: 16,
		color: "rgba(255,255,255,0.8)",
		textAlign: "center",
	},

	// Scroll content
	scroll: {
		flex: 1,
	},
	content: {
		backgroundColor: THEME.card,
		borderTopLeftRadius: 32,
		borderTopRightRadius: 32,
		marginTop: 0,
		padding: 16,
		paddingBottom: 32,
		minHeight: "100%",
	},

	// Observation badge
	obsBadge: {
		alignSelf: "center",
		borderRadius: 24,
		paddingHorizontal: 20,
		paddingVertical: 6,
		borderWidth: 2,
		marginBottom: 16,
	},
	obsText: {
		fontSize: 14,
		fontWeight: "800",
		letterSpacing: 1,
	},

	// Salary section
	salarySection: {
		borderRadius: 20,
		padding: 16,
		borderWidth: 2,
		marginBottom: 16,
	},
	salaryLabel: {
		fontSize: 14,
		color: THEME.textLight,
		marginBottom: 8,
		fontWeight: "600",
	},
	salaryRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	salaryValue: {
		fontSize: 28,
		fontWeight: "900",
	},

	// Edit section
	editSection: {
		backgroundColor: THEME.bg,
		borderRadius: 20,
		padding: 12,
		borderWidth: 2,
		borderColor: THEME.border,
		marginBottom: 16,
	},
	editHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		marginBottom: 16,
	},
	editTitle: {
		fontSize: 14,
		fontWeight: "700",
		color: THEME.textDark,
	},
	inputGroup: {
		marginBottom: 12,
	},
	label: {
		fontSize: 12,
		fontWeight: "700",
		color: THEME.textMid,
		marginBottom: 8,
		textTransform: "uppercase",
		letterSpacing: 0.8,
	},
	input: {
		backgroundColor: THEME.card,
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 12,
		fontSize: 16,
		color: THEME.textDark,
		borderWidth: 2,
		borderColor: THEME.border,
	},
	saveBtn: {
		backgroundColor: THEME.primary,
		borderRadius: 16,
		padding: 12,
		alignItems: "center",
		marginTop: 8,
		shadowColor: THEME.primary,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 4,
	},
	saveBtnDisabled: {
		opacity: 0.6,
	},
	saveBtnContent: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	saveBtnText: {
		color: "#fff",
		fontWeight: "700",
		fontSize: 16,
	},

	// Danger section
	dangerSection: {
		backgroundColor: THEME.dangerBg,
		borderRadius: 20,
		padding: 12,
		borderWidth: 2,
		borderColor: THEME.dangerBorder,
	},
	dangerHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		marginBottom: 16,
	},
	dangerTitle: {
		fontSize: 14,
		fontWeight: "800",
		color: THEME.danger,
	},
	dangerSub: {
		fontSize: 12,
		color: THEME.danger,
		opacity: 0.8,
		marginTop: 2,
	},
	deleteBtn: {
		backgroundColor: THEME.dangerBg,
		borderWidth: 2,
		borderColor: THEME.dangerBorder,
		borderRadius: 16,
		padding: 12,
		alignItems: "center",
	},
	deleteBtnContent: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	deleteBtnText: {
		color: THEME.danger,
		fontWeight: "700",
		fontSize: 14,
	},
});
