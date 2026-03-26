import { Ionicons } from "@expo/vector-icons";

const ICON_SIZE = {
	small: 16,
	medium: 20,
	large: 24,
	xl: 32,
};

const ICON_COLORS = {
	primary: "#5A8A3C",
	success: "#2E7D32",
	warning: "#E65100",
	danger: "#C62828",
	muted: "#888888",
	dark: "#1A1A1A",
	white: "#FFFFFF",
};

export default function Icon({
	name,
	size = "medium",
	color = "dark",
	style,
	...props
}) {
	// Si color est une couleur hex, l'utiliser directement
	const iconColor = color.startsWith("#")
		? color
		: ICON_COLORS[color] || ICON_COLORS.dark;

	return (
		<Ionicons
			name={name}
			size={ICON_SIZE[size]}
			color={iconColor}
			style={style}
			{...props}
		/>
	);
}

// Mapping des anciens emojis vers les nouvelles icônes
export const ICON_MAP = {
	// Observations
	"📈": { name: "trending-up", color: "success" },
	"➡️": { name: "arrow-forward", color: "warning" },
	"📉": { name: "trending-down", color: "danger" },

	// Actions
	"💾": { name: "save", color: "primary" },

	// Navigation
	"‹": { name: "chevron-back", color: "dark" },
	"›": { name: "chevron-forward", color: "dark" },

	// États
	"✓": { name: "checkmark", color: "success" },
	"✗": { name: "close", color: "danger" },

	// Stats
	"👥": { name: "people", color: "primary" },
	"💰": { name: "cash-outline", color: "success" },
};
