import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';
import useMessagingStore from '../../src/store/messagingStore';

export default function ConversationsScreen() {
  const { conversations, fetchConversations, loading } = useMessagingStore();
  const router = useRouter();

  useEffect(() => { fetchConversations(); }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push({ pathname: '/inbox/[id]', params: { id: item.id } })}
          >
            <View style={styles.info}>
              <View style={styles.header}>
                <Text style={styles.name}>{item.name || 'Direct Message'}</Text>
                {item.unread_count > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unread_count}</Text>
                  </View>
                )}
              </View>
              {item.last_message && (
                <Text style={styles.lastMsg} numberOfLines={1}>
                  {item.last_message.sender_username}: {item.last_message.content}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>{loading ? 'Loading...' : 'No conversations'}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  row: { padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#dee2e6', marginBottom: 8 },
  info: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontWeight: '600', fontSize: 15 },
  unreadBadge: { backgroundColor: '#e74c3c', borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  unreadText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  lastMsg: { color: '#7f8c8d', fontSize: 13, marginTop: 4 },
  empty: { color: '#7f8c8d', textAlign: 'center', paddingVertical: 40 },
});
