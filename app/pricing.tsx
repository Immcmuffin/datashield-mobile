import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native'
import { router } from 'expo-router'

const PLANS = [
  {
    id: 'basic', name: 'Basic', monthly: 6.99, yearly: 59.99,
    features: ['20 data broker removals', 'Monthly re-scans', 'Email scan reports', 'Dashboard access'],
    link: 'https://buy.stripe.com/5kQ7sK2KC4NeaNa76F4Vy00',
    highlight: false,
  },
  {
    id: 'pro', name: 'Pro', monthly: 12.99, yearly: 99.99,
    features: ['50+ data broker removals', 'Bi-weekly re-scans', 'Email scan reports', 'Dashboard access', 'Priority processing'],
    link: 'https://buy.stripe.com/dRm28q0CudjKdZmdv34Vy01',
    highlight: true,
  },
  {
    id: 'elite', name: 'Elite', monthly: 19.99, yearly: 149.99,
    features: ['Unlimited brokers', 'Weekly re-scans', 'Email scan reports', 'Dashboard access', 'Priority processing', 'Dedicated support'],
    link: 'https://buy.stripe.com/9B63cu990bbC1cAdv34Vy02',
    highlight: false,
  },
]

export default function PricingScreen() {
  const [interval, setIntervalType] = useState<'monthly' | 'yearly'>('monthly')

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.hero}>
        <View style={styles.logo}><Text style={styles.logoText}>DS</Text></View>
        <Text style={styles.heroTitle}>DataShield</Text>
        <Text style={styles.heroSubtitle}>Remove your data from 50+ broker sites automatically</Text>
      </View>

      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, interval === 'monthly' && styles.toggleActive]}
          onPress={() => setIntervalType('monthly')}
        >
          <Text style={[styles.toggleText, interval === 'monthly' && styles.toggleTextActive]}>Monthly</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, interval === 'yearly' && styles.toggleActive]}
          onPress={() => setIntervalType('yearly')}
        >
          <Text style={[styles.toggleText, interval === 'yearly' && styles.toggleTextActive]}>Yearly</Text>
          <View style={styles.saveBadge}><Text style={styles.saveText}>Save 35%</Text></View>
        </TouchableOpacity>
      </View>

      <View style={styles.plans}>
        {PLANS.map(plan => (
          <View key={plan.id} style={[styles.planCard, plan.highlight && styles.planHighlight]}>
            {plan.highlight && (
              <View style={styles.popularBadge}><Text style={styles.popularText}>Most popular</Text></View>
            )}
            <Text style={styles.planName}>{plan.name}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceAmount}>
                ${interval === 'monthly' ? plan.monthly : (plan.yearly / 12).toFixed(2)}
              </Text>
              <Text style={styles.pricePeriod}>/mo</Text>
            </View>
            {interval === 'yearly' && (
              <Text style={styles.billedYearly}>Billed ${plan.yearly}/yr</Text>
            )}
            <TouchableOpacity
              style={[styles.ctaBtn, plan.highlight && styles.ctaBtnHighlight]}
              onPress={() => Linking.openURL(plan.link)}
            >
              <Text style={styles.ctaText}>Get started →</Text>
            </TouchableOpacity>
            {plan.features.map(f => (
              <View key={f} style={styles.featureRow}>
                <Text style={styles.featureCheck}>✓</Text>
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.replace('/')}>
          <Text style={styles.footerLink}>Sign in →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f3' },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 8 },
  backBtn: { padding: 4 },
  backText: { fontSize: 16, color: '#666' },
  hero: { alignItems: 'center', padding: 24 },
  logo: { width: 56, height: 56, backgroundColor: '#0f1117', borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  logoText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  heroTitle: { fontSize: 26, fontWeight: '700', color: '#0f1117', marginBottom: 8 },
  heroSubtitle: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22 },
  toggleRow: { flexDirection: 'row', backgroundColor: '#e8e8e8', borderRadius: 10, margin: 20, padding: 4 },
  toggleBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  toggleActive: { backgroundColor: '#fff' },
  toggleText: { fontSize: 14, color: '#888' },
  toggleTextActive: { color: '#0f1117', fontWeight: '500' },
  saveBadge: { backgroundColor: '#e1f5ee', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  saveText: { fontSize: 10, color: '#0f6e56', fontWeight: '500' },
  plans: { paddingHorizontal: 20, gap: 16 },
  planCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#e8e8e8', position: 'relative' },
  planHighlight: { borderWidth: 2, borderColor: '#0f1117' },
  popularBadge: { position: 'absolute', top: -12, alignSelf: 'center', backgroundColor: '#0f1117', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  popularText: { color: '#fff', fontSize: 11, fontWeight: '500' },
  planName: { fontSize: 18, fontWeight: '600', color: '#0f1117', marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 },
  priceAmount: { fontSize: 36, fontWeight: '700', color: '#0f1117' },
  pricePeriod: { fontSize: 15, color: '#888', marginLeft: 2 },
  billedYearly: { fontSize: 12, color: '#888', marginBottom: 8 },
  ctaBtn: { backgroundColor: '#0f1117', borderRadius: 10, padding: 14, alignItems: 'center', marginVertical: 16 },
  ctaBtnHighlight: { backgroundColor: '#0f1117' },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  featureCheck: { color: '#0f6e56', fontWeight: '700', marginRight: 8, fontSize: 14 },
  featureText: { fontSize: 14, color: '#444' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 24 },
  footerText: { fontSize: 14, color: '#888' },
  footerLink: { fontSize: 14, color: '#0f1117', fontWeight: '500' },
})
