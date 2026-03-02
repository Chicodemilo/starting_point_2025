import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';
import useAlertStore from '../../src/store/alertStore';
import useMessagingStore from '../../src/store/messagingStore';

export default function InboxScreen() {
  const [segment, setSegment] = useState<'alerts' | 'messages'>('alerts');
  const { alerts, fetchAlerts, markRead } = useAlertStore();
  const { conversations, fetchConversations } = useMessagingStore();
  const router = useRouter();

  useEffect(() => {
    fetchAlerts();
    fetchConversations();
  }, []);

  const messageUnread = conversations.reduce((s, c) => s + (c.unread_count || 0), 0);
  const alertUnread = alerts.filter(a => !a.viewed).length;

  return (
    <View style={styles.container}>
      {/* Segmented Control */}
      <View style={styles.segmentRow}>
        <TouchableOpacity
          style={[styles.segmentBtn, segment === 'alerts' && styles.segmentActive]}
          onPress={() => setSegment('alerts')}
        >
          <Text style={[styles.segmentText, segment === 'alerts' && styles.segmentTextActive]}>
            Alerts {alertUnread > 0 ? `(${alertUnread})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, segment === 'messages' && styles.segmentActive]}
          onPress={() => setSegment('messages')}
        >
          <Text style={[styles.segmentText, segment === 'messages' && styles.segmentTextActive]}>
            Messages {messageUnread > 0 ? `(${messageUnread})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Alerts */}
      {segment === 'alerts' && (
        <FlatList
          data={alerts}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.alertRow, !item.viewed && styles.unreadRow]}
              onPress={() => { if (!item.viewed) markRead(item.id); }}
            >
              <View style={styles.alertHeader}>
                <View style={[styles.typeBadge, { backgroundColor: typeColors[item.type] || '#95a5a6' }]}>
                  <Text style={styles.typeBadgeText}>{item.type}</Text>
                </View>
                <Text style={styles.alertTitle}>{item.title}</Text>
              </View>
              {item.content ? <Text style={styles.alertContent}>{item.content}</Text> : null}
              <Text style={styles.alertTime}>{new Date(item.created_at).toLocaleString()}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No alerts</Text>}
        />
      )}

      {/* Messages */}
      {segment === 'messages' && (
        <FlatList
          data={conversations}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.convRow}
              onPress={() => router.push({ pathname: '/inbox/[id]', params: { id: item.id } })}
            >
              <View style={styles.convInfo}>
                <View style={styles.convHeader}>
                  <Text style={styles.convName}>{item.name || 'Direct Message'}</Text>
                  {item.unread_count > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadBadgeText}>{item.unread_count}</Text>
                    </View>
                  )}
                </View>
                {item.last_message && (
                  <Text style={styles.lastMsg} numberOfLines={1}>
                    {item.last_message.sender_username}: {item.last_message.content}
                  </Text>
                )}
              </View>
              <Text style={styles.convType}>{item.type}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No conversations</Text>}
        />
      )}
    </View>
  );
}

const typeColors: Record<string, string> = { info: '#3498db', warning: '#e67e22', urgent: '#e74c3c', system: '#9b59b6' };

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  segmentRow: { flexDirection: 'row', marginBottom: 16, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#3498db' },
  segmentBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: '#fff' },
  segmentActive: { backgroundColor: '#3498db' },
  segmentText: { fontWeight: '600', color: '#3498db' },
  segmentTextActive: { color: '#fff' },
  alertRow: { padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#dee2e6', marginBottom: 8, backgroundColor: '#fff' },
  unreadRow: { backgroundColor: '#f0f7ff', borderColor: '#3498db' },
  alertHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  typeBadgeText: { color: '#fff', fontSize: 11 },
  alertTitle: { fontWeight: '600', fontSize: 15 },
  alertContent: { color: '#7f8c8d', fontSize: 13, marginTop: 2 },
  alertTime: { color: '#bdc3c7', fontSize: 11, marginTop: 6 },
  convRow: { padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#dee2e6', marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  convInfo: { flex: 1 },
  convHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  convName: { fontWeight: '600', fontSize: 15 },
  unreadBadge: { backgroundColor: '#e74c3c', borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  unreadBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  lastMsg: { color: '#7f8c8d', fontSize: 13, marginTop: 4 },
  convType: { color: '#bdc3c7', fontSize: 12 },
  emptyText: { color: '#7f8c8d', textAlign: 'center', paddingVertical: 40 },
});
