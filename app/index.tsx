import { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../src/lib/supabase'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/dashboard')
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace('/dashboard')
    })
  }, [])

  async function handleLogin() {
    if (!email) return
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: 'datashield://dashboard' }
    })
    setLoading(false)
    if (error) Alert.alert('Error', error.message)
    else setSent(true)
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.inner}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>DS</Text>
        </View>
        <Text style={styles.title}>DataShield</Text>
        <Text style={styles.subtitle}>Your personal data removal service</Text>

        {sent ? (
          <View style={styles.sentBox}>
            <Text style={styles.sentIcon}>✓</Text>
            <Text style={styles.sentTitle}>Check your email</Text>
            <Text style={styles.sentDesc}>We sent a magic link to {email}. Tap it to sign in.</Text>
          </View>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Sign in →'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/pricing')}>
              <Text style={styles.pricingLink}>Don't have an account? See plans →</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f3' },
  inner: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  logoBox: { width: 64, height: 64, backgroundColor: '#0f1117', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  logoText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  title: { fontSize: 28, fontWeight: '700', color: '#0f1117', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#888', marginBottom: 40, textAlign: 'center' },
  input: { width: '100%', backgroundColor: '#fff', borderRadius: 12, padding: 16, fontSize: 16, color: '#0f1117', borderWidth: 1, borderColor: '#e0e0e0', marginBottom: 12 },
  button: { width: '100%', backgroundColor: '#0f1117', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  pricingLink: { color: '#666', fontSize: 14 },
  sentBox: { alignItems: 'center', padding: 24 },
  sentIcon: { fontSize: 40, marginBottom: 12 },
  sentTitle: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  sentDesc: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22 },
})
