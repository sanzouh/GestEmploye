import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Dimensions,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";
import { getEmployes } from "../api/api";
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
};

const screenWidth = Dimensions.get("window").width - 40;

function calcObs(sal) {
	const s = Number(sal);
	if (s > 5000) return "grand";
	if (s >= 1000) return "moyen";
	return "mediocre";
}

const OBS_COLORS = {
	grand: {
		text: "#2E7D32",
		bg: "#E8F5E9",
		border: "#A5D6A7",
		chart: "#4CAF50",
	},
	moyen: {
		text: "#E65100",
		bg: "#FFF3E0",
		border: "#FFCC80",
		chart: "#FF9800",
	},
	mediocre: {
		text: "#C62828",
		bg: "#FFEBEE",
		border: "#EF9A9A",
		chart: "#F44336",
	},
};

export default function StatsScreen({ navigation }) {
	const [employes, setEmployes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [chartType, setChartType] = useState("histogram");

	useEffect(() => {
		const unsub = navigation.addListener("focus", charger);
		return unsub;
	}, [navigation]);

	async function charger() {
		try {
			const res = await getEmployes();
			setEmployes(res.data);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	}

	if (loading)
		return (
			<SafeAreaView style={styles.center}>
				<ActivityIndicator size="large" color={THEME.primary} />
				<Text style={styles.loadingText}>Chargement des statistiques...</Text>
			</SafeAreaView>
		);

	const salaires = employes.map((e) => Number(e.salaire));
	const total = salaires.reduce((a, b) => a + b, 0);
	const max = Math.max(...salaires);
	const min = Math.min(...salaires);
	const moyenne = Math.round(total / employes.length);

	const grandC = employes.filter(
		(e) =>
			(e.obs && OBS_COLORS[e.obs] ? e.obs : calcObs(e.salaire)) === "grand",
	).length;
	const moyenC = employes.filter(
		(e) =>
			(e.obs && OBS_COLORS[e.obs] ? e.obs : calcObs(e.salaire)) === "moyen",
	).length;
	const mediocreC = employes.filter(
		(e) =>
			(e.obs && OBS_COLORS[e.obs] ? e.obs : calcObs(e.salaire)) === "mediocre",
	).length;

	// Données pour BarChart
	const barData = {
		labels: employes.map((e) => e.nom.split(" ")[0].slice(0, 5)),
		datasets: [{ data: employes.map((e) => Number(e.salaire)) }],
	};

	// Données pour PieChart
	const pieData = [
		{
			name: "Grand",
			population: grandC,
			color: "#4CAF50",
			legendFontColor: THEME.textDark,
			legendFontSize: 12,
		},
		{
			name: "Moyen",
			population: moyenC,
			color: "#FF9800",
			legendFontColor: THEME.textDark,
			legendFontSize: 12,
		},
		{
			name: "Médiocre",
			population: mediocreC,
			color: "#F44336",
			legendFontColor: THEME.textDark,
			legendFontSize: 12,
		},
	].filter((d) => d.population > 0);

	const chartConfig = {
		backgroundGradientFrom: "#FFFFFF",
		backgroundGradientTo: "#F7FAF4",
		color: (opacity = 1) => `rgba(90, 138, 60, ${opacity})`,
		labelColor: () => THEME.textMid,
		barPercentage: 0.6,
		decimalPlaces: 0,
		style: { borderRadius: 16 },
	};

	return (
		<SafeAreaView style={styles.safe}>
			<StatusBar barStyle="dark-content" backgroundColor={THEME.bg} />
			<ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
				{/* Header */}
				<View style={styles.header}>
					<View>
						<Text style={styles.headerSub}>Analyse</Text>
						<Text style={styles.headerTitle}>Statistiques</Text>
					</View>
					<View
						style={[
							styles.headerBadge,
							{ backgroundColor: THEME.primary + "18" },
						]}
					>
						<Text style={[styles.headerBadgeText, { color: THEME.primary }]}>
							{employes.length} employés
						</Text>
					</View>
				</View>

				{/* KPIs */}
				<View style={styles.kpiGrid}>
					{[
						{
							label: "Total salarial",
							value: `${total.toLocaleString("fr-FR")} €`,
							color: THEME.primary,
							bg: "#E8F3E0",
							icon: "briefcase",
						},
						{
							label: "Salaire moyen",
							value: `${moyenne.toLocaleString("fr-FR")} €`,
							color: "#E65100",
							bg: "#FFF3E0",
							icon: "scale",
						},
						{
							label: "Salaire max",
							value: `${max.toLocaleString("fr-FR")} €`,
							color: "#2E7D32",
							bg: "#E8F5E9",
							icon: "trending-up",
						},
						{
							label: "Salaire min",
							value: `${min.toLocaleString("fr-FR")} €`,
							color: "#C62828",
							bg: "#FFEBEE",
							icon: "trending-down",
						},
					].map((k, i) => (
						<View key={i} style={[styles.kpiCard, { backgroundColor: k.bg }]}>
							<Icon name={k.icon} size="xl" color={k.color} />
							<Text
								style={[styles.kpiValue, { color: k.color }]}
								numberOfLines={1}
								adjustsFontSizeToFit
							>
								{k.value}
							</Text>
							<Text style={styles.kpiLabel}>{k.label}</Text>
						</View>
					))}
				</View>

				{/* Répartition rapide */}
				<View style={styles.repartitionCard}>
					<Text style={styles.cardSectionTitle}>
						Répartition par observation
					</Text>
					<View style={styles.repartitionRow}>
						{[
							{ label: "Grand", count: grandC, obs: "grand" },
							{ label: "Moyen", count: moyenC, obs: "moyen" },
							{ label: "Médiocre", count: mediocreC, obs: "mediocre" },
						].map((r) => {
							const cl = OBS_COLORS[r.obs];
							const pct = employes.length
								? Math.round((r.count / employes.length) * 100)
								: 0;
							return (
								<View
									key={r.obs}
									style={[
										styles.repartItem,
										{ backgroundColor: cl.bg, borderColor: cl.border },
									]}
								>
									<Text style={[styles.repartCount, { color: cl.text }]}>
										{r.count}
									</Text>
									<Text style={[styles.repartLabel, { color: cl.text }]}>
										{r.label}
									</Text>
									<Text style={[styles.repartPct, { color: cl.text + "AA" }]}>
										{pct}%
									</Text>
								</View>
							);
						})}
					</View>
				</View>

				{/* Toggle Histogramme / Camembert */}
				<View style={styles.toggle}>
					{[
						{ key: "histogram", label: "Histogramme", icon: "bar-chart" },
						{ key: "pie", label: "Camembert", icon: "pie-chart" },
					].map((t) => (
						<TouchableOpacity
							key={t.key}
							style={[
								styles.toggleBtn,
								chartType === t.key && styles.toggleBtnActive,
							]}
							onPress={() => setChartType(t.key)}
							activeOpacity={0.75}
						>
							<View
								style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
							>
								<Icon
									name={t.icon}
									size="medium"
									color={chartType === t.key ? "#f1fefa" : THEME.textMid}
								/>
								<Text
									style={[
										styles.toggleText,
										chartType === t.key && styles.toggleTextActive,
									]}
								>
									{t.label}
								</Text>
							</View>
						</TouchableOpacity>
					))}
				</View>

				{/* Graphique */}
				<View style={styles.chartCard}>
					<Text style={styles.chartTitle}>
						{chartType === "histogram"
							? "Salaires par employé"
							: "Répartition par observation"}
					</Text>
					{chartType === "histogram" ? (
						<BarChart
							data={barData}
							width={screenWidth}
							height={200}
							chartConfig={chartConfig}
							style={{ borderRadius: 12 }}
							showValuesOnTopOfBars
							fromZero
						/>
					) : (
						<PieChart
							data={pieData}
							width={screenWidth}
							height={200}
							chartConfig={chartConfig}
							accessor="population"
							backgroundColor="transparent"
							paddingLeft="15"
						/>
					)}
				</View>

				{/* Tableau récapitulatif */}
				<Text style={styles.sectionTitle}>RÉCAPITULATIF SALAIRES</Text>
				<View style={styles.tableCard}>
					{/* Header */}
					<View style={[styles.tableRow, styles.tableHeader]}>
						<Text
							style={[styles.tableCell, styles.tableHeaderText, { flex: 2 }]}
						>
							Employé
						</Text>
						<Text style={[styles.tableCell, styles.tableHeaderText]}>N°</Text>
						<Text
							style={[
								styles.tableCell,
								styles.tableHeaderText,
								{ textAlign: "right" },
							]}
						>
							Salaire
						</Text>
						<Text
							style={[
								styles.tableCell,
								styles.tableHeaderText,
								{ textAlign: "right" },
							]}
						>
							Obs.
						</Text>
					</View>
					{employes.map((emp, i) => {
						const obs =
							emp.obs && OBS_COLORS[emp.obs] ? emp.obs : calcObs(emp.salaire);
						const cl = OBS_COLORS[obs];
						return (
							<View
								key={emp.id}
								style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}
							>
								<View
									style={{
										flex: 2,
										flexDirection: "row",
										alignItems: "center",
										gap: 8,
									}}
								>
									<View
										style={[
											styles.tableAvatar,
											{ backgroundColor: cl.bg, borderColor: cl.border },
										]}
									>
										<Text style={[styles.tableAvatarText, { color: cl.text }]}>
											{emp.nom.charAt(0).toUpperCase()}
										</Text>
									</View>
									<Text style={styles.recapNom} numberOfLines={1}>
										{emp.nom}
									</Text>
								</View>
								<Text style={styles.recapNum}>{emp.numemp || emp.numEmp}</Text>
								<Text
									style={[
										styles.recapSal,
										{ color: cl.text, textAlign: "right" },
									]}
								>
									{Number(emp.salaire).toLocaleString()}
								</Text>
								<View
									style={[
										styles.recapBadge,
										{
											backgroundColor: cl.bg,
											borderColor: cl.border,
											alignSelf: "center",
										},
									]}
								>
									<Text style={[styles.recapBadgeText, { color: cl.text }]}>
										{obs.charAt(0).toUpperCase()}
									</Text>
								</View>
							</View>
						);
					})}
				</View>

				<View style={{ height: 30 }} />
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safe: { flex: 1, backgroundColor: THEME.bg },
	container: { flex: 1, backgroundColor: THEME.bg, padding: 16 },
	center: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: THEME.bg,
		gap: 10,
	},
	loadingText: { color: THEME.textLight, fontSize: 14 },

	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 18,
	},
	headerSub: { fontSize: 12, color: THEME.textLight, fontWeight: "500" },
	headerTitle: {
		fontSize: 28,
		fontWeight: "900",
		color: THEME.textDark,
		letterSpacing: -0.5,
	},
	headerBadge: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
	headerBadgeText: { fontWeight: "700", fontSize: 13 },

	kpiGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 10,
		marginBottom: 14,
	},
	kpiCard: {
		width: "47%",
		borderRadius: 18,
		padding: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 6,
		elevation: 1,
	},
	kpiIcon: { fontSize: 22, marginBottom: 8 },
	kpiValue: { fontSize: 14, fontWeight: "800", marginBottom: 4 },
	kpiLabel: { color: THEME.textLight, fontSize: 11, fontWeight: "500" },

	repartitionCard: {
		backgroundColor: THEME.card,
		borderRadius: 18,
		padding: 16,
		marginBottom: 14,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 2,
	},
	cardSectionTitle: {
		fontSize: 13,
		fontWeight: "800",
		color: THEME.textDark,
		marginBottom: 12,
	},
	repartitionRow: { flexDirection: "row", gap: 8 },
	repartItem: {
		flex: 1,
		borderRadius: 14,
		padding: 12,
		alignItems: "center",
		borderWidth: 1.5,
	},
	repartCount: { fontSize: 22, fontWeight: "900" },
	repartLabel: { fontSize: 11, fontWeight: "700", marginTop: 2 },
	repartPct: { fontSize: 11, marginTop: 2, fontWeight: "500" },

	toggle: {
		flexDirection: "row",
		backgroundColor: THEME.card,
		borderRadius: 14,
		padding: 4,
		marginBottom: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 1,
	},
	toggleBtn: {
		flex: 1,
		paddingVertical: 10,
		borderRadius: 10,
		alignItems: "center",
	},
	toggleBtnActive: { backgroundColor: THEME.primary },
	toggleText: { color: THEME.textLight, fontWeight: "700", fontSize: 13 },
	toggleTextActive: { color: "#fff" },

	chartCard: {
		backgroundColor: THEME.card,
		borderRadius: 18,
		padding: 16,
		marginBottom: 18,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 2,
	},
	chartTitle: {
		color: THEME.textMid,
		fontSize: 13,
		fontWeight: "700",
		textAlign: "center",
		marginBottom: 14,
	},

	sectionTitle: {
		color: THEME.textLight,
		fontSize: 11,
		fontWeight: "700",
		letterSpacing: 1.2,
		textTransform: "uppercase",
		marginBottom: 10,
	},
	tableCard: {
		backgroundColor: THEME.card,
		borderRadius: 18,
		overflow: "hidden",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 2,
		marginBottom: 10,
	},
	tableRow: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 14,
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: THEME.border,
		gap: 6,
	},
	tableRowAlt: { backgroundColor: "#FAFCF8" },
	tableHeader: {
		backgroundColor: THEME.bg,
		borderBottomWidth: 2,
		borderBottomColor: THEME.border,
	},
	tableCell: { flex: 1 },
	tableHeaderText: {
		fontSize: 10,
		fontWeight: "800",
		color: THEME.textLight,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	tableAvatar: {
		width: 28,
		height: 28,
		borderRadius: 9,
		borderWidth: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	tableAvatarText: { fontSize: 13, fontWeight: "800" },
	recapNom: { color: THEME.textDark, fontSize: 13, flex: 1, fontWeight: "600" },
	recapNum: { flex: 1, color: THEME.textLight, fontSize: 11 },
	recapSal: { flex: 1, fontWeight: "800", fontSize: 12 },
	recapBadge: {
		borderRadius: 6,
		borderWidth: 1,
		paddingHorizontal: 6,
		paddingVertical: 2,
	},
	recapBadgeText: { fontWeight: "900", fontSize: 11 },
});
