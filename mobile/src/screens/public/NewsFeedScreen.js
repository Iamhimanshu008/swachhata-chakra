import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../config';

const newsItems = [
  {
    id: 1,
    title: "Nava Raipur mein Smart Waste System launch",
    summary: "SmartWaste AI ne Nava Raipur mein waste collection 40% efficient banaya",
    date: "24 Apr 2026",
    emoji: "🏆",
    tag: "Success Story"
  },
  {
    id: 2,
    title: "Plastic Waste: India ka target 2025 tak",
    summary: "Sarkar ne single-use plastic band karne ke liye nayi guidelines jaari ki",
    date: "20 Apr 2026",
    emoji: "🌍",
    tag: "Policy"
  },
  {
    id: 3,
    title: "SHG mahilaon ne kamaaye 50,000 rupaye",
    summary: "Chhattisgarh ki SHG groups ne waste collection se monthly income badhayi",
    date: "15 Apr 2026",
    emoji: "💪",
    tag: "Community"
  },
  {
    id: 4,
    title: "Compost se kisan khush",
    summary: "Wet waste se bana compost kisan seedha le sakte hain SmartWaste centers se",
    date: "10 Apr 2026",
    emoji: "🌱",
    tag: "Innovation"
  },
];

export default function NewsFeedScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Swachhta Samachar</Text>
            </View>

            <FlatList
                data={newsItems}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.tagBadge}>
                                <Text style={styles.tagText}>{item.tag}</Text>
                            </View>
                            <Text style={styles.date}>{item.date}</Text>
                        </View>
                        <View style={styles.cardBody}>
                            <Text style={styles.emoji}>{item.emoji}</Text>
                            <View style={styles.textContainer}>
                                <Text style={styles.cardTitle}>{item.title}</Text>
                                <Text style={styles.summary}>{item.summary}</Text>
                            </View>
                        </View>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
    backBtn: { marginRight: 15, padding: 5 },
    backIcon: { fontSize: 24, color: COLORS.dark },
    title: { fontSize: 22, fontWeight: '800', color: COLORS.dark },
    listContainer: { padding: 16 },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    tagBadge: { backgroundColor: '#e0f2fe', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    tagText: { color: '#0369a1', fontSize: 12, fontWeight: '700' },
    date: { color: '#888', fontSize: 12, fontWeight: '500' },
    cardBody: { flexDirection: 'row', alignItems: 'flex-start' },
    emoji: { fontSize: 40, marginRight: 15, marginTop: 5 },
    textContainer: { flex: 1 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 6 },
    summary: { fontSize: 14, color: '#666', lineHeight: 20 },
});
