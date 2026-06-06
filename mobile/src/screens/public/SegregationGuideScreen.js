import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../config';

const categories = [
  {
    id: 1,
    color: "#3B82F6",
    bgColor: "#EFF6FF",
    icon: <MaterialCommunityIcons name="recycle" size={40} color="#3B82F6" />,
    title: "DRY WASTE",
    examples: [
      "Plastic bottles (PET, HDPE)",
      "Paper, cardboard, newspaper",
      "Glass bottles and jars",
      "Metal cans and tins",
      "Plastic bags (clean, dry)"
    ],
    doText: "Clean and dry before giving",
    dontText: "Do not mix with wet waste"
  },
  {
    id: 2,
    color: "#16A34A",
    bgColor: "#F0FDF4",
    icon: <MaterialCommunityIcons name="leaf" size={40} color="#16A34A" />,
    title: "WET WASTE",
    examples: [
      "Vegetable and fruit peels",
      "Leftover food, cooked or raw",
      "Tea leaves, coffee grounds",
      "Flowers, leaves, garden waste",
      "Egg shells"
    ],
    doText: "Use for composting at home",
    dontText: "Do not put in plastic bags"
  },
  {
    id: 3,
    color: "#DC2626",
    bgColor: "#FEF2F2",
    icon: <MaterialCommunityIcons name="alert-circle-outline" size={40} color="#DC2626" />,
    title: "HAZARDOUS WASTE",
    examples: [
      "Batteries (mobile, torch, remote)",
      "Medicine strips and bottles",
      "Paint cans and chemicals",
      "Pesticide containers",
      "CFL bulbs and tubelights"
    ],
    doText: "Give directly to PWMU center",
    dontText: "NEVER mix with regular waste"
  },
  {
    id: 4,
    color: "#EA580C",
    bgColor: "#FFF7ED",
    icon: <MaterialCommunityIcons name="monitor-cellphone" size={40} color="#EA580C" />,
    title: "E-WASTE",
    examples: [
      "Old mobile phones and chargers",
      "Broken headphones and cables",
      "Old laptops and computers",
      "Remote controls, switches",
      "Circuit boards"
    ],
    doText: "Give to authorized e-waste collector",
    dontText: "Never throw in regular bin"
  }
];

export default function SegregationGuideScreen() {
    const [expandedId, setExpandedId] = useState(null);

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Waste Segregation Guide</Text>
                <Text style={styles.headerSubtitle}>अपना कचरा अलग करें — Separate Your Waste</Text>
            </View>

            <View style={styles.cardsContainer}>
                {categories.map((cat) => {
                    const isExpanded = expandedId === cat.id;
                    return (
                        <TouchableOpacity 
                            key={cat.id} 
                            style={[styles.card, { backgroundColor: cat.bgColor, borderTopColor: cat.color }]}
                            onPress={() => toggleExpand(cat.id)}
                            activeOpacity={0.8}
                        >
                            <View style={styles.cardHeader}>
                                <View style={styles.iconContainer}>{cat.icon}</View>
                                <View style={styles.cardHeaderText}>
                                    <Text style={[styles.cardTitle, { color: cat.color }]}>{cat.title}</Text>
                                </View>
                                <MaterialCommunityIcons 
                                    name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                                    size={28} 
                                    color="#888" 
                                />
                            </View>

                            {isExpanded && (
                                <View style={styles.expandedContent}>
                                    <View style={styles.divider} />
                                    <View style={styles.examplesList}>
                                        {cat.examples.map((ex, i) => (
                                            <View key={i} style={styles.exampleItem}>
                                                <Text style={[styles.bullet, { color: cat.color }]}>•</Text>
                                                <Text style={styles.exampleText}>{ex}</Text>
                                            </View>
                                        ))}
                                    </View>
                                    
                                    <View style={styles.doDontContainer}>
                                        <View style={[styles.box, styles.doBox]}>
                                            <View style={styles.boxHeader}>
                                                <MaterialCommunityIcons name="check-circle" size={20} color="#15803d" />
                                                <Text style={styles.doTitle}>DO</Text>
                                            </View>
                                            <Text style={styles.boxText}>{cat.doText}</Text>
                                        </View>
                                        <View style={[styles.box, styles.dontBox]}>
                                            <View style={styles.boxHeader}>
                                                <MaterialCommunityIcons name="close-circle" size={20} color="#b91c1c" />
                                                <Text style={styles.dontTitle}>DON'T</Text>
                                            </View>
                                            <Text style={styles.boxText}>{cat.dontText}</Text>
                                        </View>
                                    </View>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}

                <View style={styles.quickTips}>
                    <Text style={styles.quickTipsTitle}>Quick Tips</Text>
                    <View style={styles.tipItem}>
                        <MaterialCommunityIcons name="lightbulb-on" size={24} color="#EA580C" style={styles.tipIcon} />
                        <Text style={styles.quickTipsText}>Rinse plastic bottles before giving — get Grade A!</Text>
                    </View>
                    <View style={styles.tipItem}>
                        <MaterialCommunityIcons name="lightbulb-on" size={24} color="#EA580C" style={styles.tipIcon} />
                        <Text style={styles.quickTipsText}>Wet waste = compost = free fertilizer for your farm</Text>
                    </View>
                    <View style={styles.tipItem}>
                        <MaterialCommunityIcons name="lightbulb-on" size={24} color="#EA580C" style={styles.tipIcon} />
                        <Text style={styles.quickTipsText}>More you give, more points you earn</Text>
                    </View>
                    <View style={styles.tipItem}>
                        <MaterialCommunityIcons name="lightbulb-on" size={24} color="#EA580C" style={styles.tipIcon} />
                        <Text style={styles.quickTipsText}>Grade A plastic earns 1.5x bonus points</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg || '#F0FDF4' },
    content: { paddingBottom: 40 },
    headerContainer: {
        backgroundColor: '#16A34A',
        padding: 24,
        paddingTop: 60,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    headerTitle: { fontSize: 26, fontWeight: '900', color: '#FFFFFF', marginBottom: 6 },
    headerSubtitle: { fontSize: 16, color: '#E8F5E9', fontWeight: '600' },
    cardsContainer: { paddingHorizontal: 16 },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        borderTopWidth: 6,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    iconContainer: { marginRight: 16 },
    cardHeaderText: { flex: 1 },
    cardTitle: { fontSize: 20, fontWeight: '900' },
    expandedContent: { marginTop: 16 },
    divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.08)', marginBottom: 16 },
    examplesList: { marginBottom: 16 },
    exampleItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingLeft: 4 },
    bullet: { fontSize: 24, marginRight: 12, fontWeight: '900' },
    exampleText: { fontSize: 16, color: '#1f2937', fontWeight: '600', flex: 1 },
    doDontContainer: { gap: 12 },
    box: { padding: 16, borderRadius: 12 },
    doBox: { backgroundColor: '#DCFCE7' },
    dontBox: { backgroundColor: '#FEE2E2' },
    boxHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    doTitle: { fontSize: 16, fontWeight: '900', color: '#15803d', marginLeft: 6 },
    dontTitle: { fontSize: 16, fontWeight: '900', color: '#b91c1c', marginLeft: 6 },
    boxText: { fontSize: 15, color: '#374151', fontWeight: '700', marginLeft: 26 },
    quickTips: { marginTop: 24, backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB' },
    quickTipsTitle: { fontSize: 22, fontWeight: '900', color: '#1E3A5F', marginBottom: 16 },
    tipItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
    tipIcon: { marginRight: 12, marginTop: 2 },
    quickTipsText: { fontSize: 16, color: '#374151', lineHeight: 24, fontWeight: '600', flex: 1 },
});
