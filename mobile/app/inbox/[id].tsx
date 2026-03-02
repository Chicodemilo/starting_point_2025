import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text, View } from '@/components/Themed';
import useMessagingStore from '../../src/store/messagingStore';
import useAuthStore from '../../src/store/authStore';

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { currentMessages, fetchMessages, sendMessage, loading } = useMessagingStore();
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (id) fetchMessages(parseInt(id as string));
  }, [id]);

  const handleSend = async () => {
    if (!input.trim() || !id) return;
    await sendMessage(parseInt(id as string), input);
    setInput('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={currentMessages}
        keyExtractor={(item) => String(item.id)}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        renderItem={({ item }) => {
          const isOwn = item.sender_id === user?.id;
          return (
            <View style={[styles.msgRow, isOwn ? styles.ownRow : styles.otherRow]}>
              <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
                {!isOwn && <Text style={styles.senderName}>{item.sender_username}</Text>}
                <Text style={[styles.msgText, isOwn && styles.ownText]}>{item.content}</Text>
                <Text style={[styles.msgTime, isOwn && styles.ownTime]}>
                  {new Date(item.created_at).toLocaleTimeString()}
                </Text>
              </View>
            </View>
          );
        }}
        contentContainerStyle={styles.messagesList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>{loading ? 'Loading...' : 'No messages yet'}</Text>
        }
      />

      <View style={styles.compose}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  messagesList: { padding: 16, flexGrow: 1 },
  msgRow: { marginBottom: 12 },
  ownRow: { alignItems: 'flex-end' },
  otherRow: { alignItems: 'flex-start' },
  bubble: { maxWidth: '75%', padding: 12, borderRadius: 16 },
  ownBubble: { backgroundColor: '#3498db' },
  otherBubble: { backgroundColor: '#f0f0f0' },
  senderName: { fontSize: 12, fontWeight: '600', marginBottom: 2, color: '#2c3e50' },
  msgText: { fontSize: 15, color: '#2c3e50' },
  ownText: { color: '#fff' },
  msgTime: { fontSize: 11, marginTop: 4, opacity: 0.7, color: '#2c3e50' },
  ownTime: { color: '#fff' },
  emptyText: { color: '#7f8c8d', textAlign: 'center', paddingVertical: 40 },
  compose: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#dee2e6', alignItems: 'flex-end' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, maxHeight: 100 },
  sendBtn: { marginLeft: 8, backgroundColor: '#3498db', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20 },
  sendText: { color: '#fff', fontWeight: '600' },
});
