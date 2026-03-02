import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Text, View } from '@/components/Themed';
import useAlertStore from '../../src/store/alertStore';

export default function AlertsScreen() {
  const { alerts, fetchAlerts, markRead, removeAlert } = useAlertStore();

  useEffect(() => { fetchAlerts(); }, []);

  const typeColors: Record<string, string> = { info: '#3498db', warning: '#e67e22', urgent: '#e74c3c', system: '#9b59b6' };

  return (
    <View style={styles.container}>
      <FlatList
        data={alerts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={[styles.row, !item.viewed && styles.unread]}>
            <View style={[styles.badge, { backgroundColor: typeColors[item.type] || '#95a5a6' }]}>
              <Text style={styles.badgeText}>{item.type}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            {item.content ? <Text style={styles.content}>{item.content}</Text> : null}
            <View style={styles.actions}>
              {!item.viewed && (
                <TouchableOpacity onPress={() => markRead(item.id)} style={styles.actionBtn}>
                  <Text style={styles.actionText}>Mark Read</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => removeAlert(item.id)} style={[styles.actionBtn, { backgroundColor: '#e74c3c' }]}>
                <Text style={styles.actionText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No alerts</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  row: { padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#dee2e6', marginBottom: 8, backgroundColor: '#fff' },
  unread: { backgroundColor: '#f0f7ff', borderColor: '#3498db' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginBottom: 6 },
  badgeText: { color: '#fff', fontSize: 11 },
  title: { fontWeight: '600', fontSize: 15, marginBottom: 4 },
  content: { color: '#7f8c8d', fontSize: 13 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  actionBtn: { backgroundColor: '#3498db', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
  actionText: { color: '#fff', fontSize: 12 },
  empty: { color: '#7f8c8d', textAlign: 'center', paddingVertical: 40 },
});
