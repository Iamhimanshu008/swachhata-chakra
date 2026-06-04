import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/client';
import Constants from 'expo-constants';

export default function RecyclersScreen() {
    const [recyclers, setRecyclers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecyclers = async () => {
            try {
                // V3: correct endpoint (was /recyclers → 404)
                const response = await api.get('/recycler/list');
                setRecyclers(response.data);
            } catch (err) {
                console.error('Failed to load recyclers:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecyclers();
    }, []);

    const handleCall = (phone) => {
        if (!phone) return;
        Linking.openURL(`tel:${phone}`);
    };

    const handleDirections = (lat, lng, name) => {
        if (!lat || !lng) return;
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${lat},${lng}`;
        const label = name;
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`
        });
        Linking.openURL(url);
    };

    // V3: price_per_kg is now a dict {"plastic": 12.5, "paper": 8.0}
    const getPriceDisplay = (price_per_kg) => {
        if (!price_per_kg || typeof price_per_kg !== 'object') return null;
        const entries = Object.entries(price_per_kg).filter(([, v]) => v > 0);
        if (entries.length === 0) return null;
        return entries.map(([type, price]) => `${type}: ₹${price}/kg`).join('  •  ');
    };

    // V3: waste_types_accepted is an array ["plastic", "paper"]
    const getWasteTypes = (item) => {
        // Support both V3 (waste_types_accepted) and V1 (accepted_types) fields
        return item.waste_types_accepted || item.accepted_types || [];
    };

    const WASTE_TYPE_COLOR = {
        plastic: '#3b82f6',
        organic: '#16a34a',
        paper:   '#f59e0b',
        other:   '#6b7280',
    };

    const renderItem = ({ item }) => {
        const types = getWasteTypes(item);
        const priceDisplay = getPriceDisplay(item.price_per_kg);

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.name}>{item.name}</Text>
                        {item.contact_person ? (
                            <Text style={styles.contactPerson}>{item.contact_person}</Text>
                        ) : null}
                    </View>
                    {/* Active badge */}
                    <View style={[styles.activeBadge, !item.is_active && styles.inactiveBadge]}>
                        <Text style={[styles.activeBadgeText, !item.is_active && styles.inactiveBadgeText]}>
                            {item.is_active ? 'Active' : 'Inactive'}
                        </Text>
                    </View>
                </View>

                {/* Waste type chips */}
                {types.length > 0 && (
                    <View style={styles.chipsRow}>
                        {types.map((t) => (
                            <View
                                key={t}
                                style={[styles.chip, { backgroundColor: (WASTE_TYPE_COLOR[t] || '#6b7280') + '20', borderColor: WASTE_TYPE_COLOR[t] || '#6b7280' }]}
                            >
                                <Text style={[styles.chipText, { color: WASTE_TYPE_COLOR[t] || '#6b7280' }]}>
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                <View style={styles.detailsContainer}>
                    {/* Prices */}
                    {priceDisplay ? (
                        <View style={styles.detailRow}>
                            <Ionicons name="pricetag-outline" size={16} color="#6B7280" />
                            <Text style={styles.detailText}>{priceDisplay}</Text>
                        </View>
                    ) : null}

                    {/* Address */}
                    {item.address ? (
                        <View style={styles.detailRow}>
                            <Ionicons name="location-outline" size={16} color="#6B7280" />
                            <Text style={styles.detailText}>{item.address}</Text>
                        </View>
                    ) : null}

                    {/* Min qty — legacy field kept if present */}
                    {item.min_quantity_kg ? (
                        <View style={styles.detailRow}>
                            <Ionicons name="scale-outline" size={16} color="#6B7280" />
                            <Text style={styles.detailText}>Min Qty: {item.min_quantity_kg}kg</Text>
                        </View>
                    ) : null}
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.callBtn, !item.phone && styles.disabledBtn]}
                        onPress={() => handleCall(item.phone)}
                        disabled={!item.phone}
                    >
                        <Ionicons name="call" size={18} color={item.phone ? '#059669' : '#9ca3af'} />
                        <Text style={[styles.callBtnText, !item.phone && styles.disabledBtnText]}>
                            {item.phone || 'No phone'}
                        </Text>
                    </TouchableOpacity>

                    {(item.latitude && item.longitude) ? (
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.dirBtn]}
                            onPress={() => handleDirections(item.latitude, item.longitude, item.name)}
                        >
                            <Ionicons name="navigate" size={18} color="#FFF" />
                            <Text style={styles.dirBtnText}>Directions</Text>
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#059669" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Find Recyclers</Text>
                <Text style={styles.subtitle}>Sell your collected waste to verified partners.</Text>
            </View>

            <FlatList
                data={recyclers}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={() => (
                    <Text style={styles.emptyText}>No registered recyclers found.</Text>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        paddingTop: Constants.statusBarHeight,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 24,
        paddingBottom: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    list: {
        padding: 16,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
    },
    contactPerson: {
        fontSize: 14,
        color: '#6B7280',
    },
    activeBadge: {
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginLeft: 8,
    },
    inactiveBadge: {
        backgroundColor: '#FEF2F2',
    },
    activeBadgeText: {
        color: '#059669',
        fontWeight: '700',
        fontSize: 12,
    },
    inactiveBadgeText: {
        color: '#DC2626',
    },
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 12,
    },
    chip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
    },
    chipText: {
        fontSize: 12,
        fontWeight: '600',
    },
    detailsContainer: {
        marginBottom: 16,
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: 14,
        color: '#4B5563',
        flex: 1,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    callBtn: {
        backgroundColor: '#ECFDF5',
    },
    callBtnText: {
        color: '#059669',
        fontWeight: '600',
        fontSize: 14,
    },
    dirBtn: {
        backgroundColor: '#059669',
    },
    dirBtnText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 14,
    },
    disabledBtn: {
        backgroundColor: '#F3F4F6',
    },
    disabledBtnText: {
        color: '#9ca3af',
    },
    emptyText: {
        textAlign: 'center',
        color: '#6B7280',
        marginTop: 40,
        fontSize: 16,
    },
});
