import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native'
import { router } from 'expo-router'
import { supabase, getJobs, getSubscription, Job, Subscription } from '../src/lib/supabase'

const STATUS_COLOR: Record<string, string> = {
  completed: '#0f6e56', running: '#185FA5', claimed: '#854F0B', pending: '#888', failed: '#A32D2D'
}
const STATUS_ICON: Record<string, string> = {
  completed: '✓', running: '●', claimed: '○', pending: '○', failed: '✗'
}
const STATUS_LABEL: Record<string, string> = {
  completed: 'Submitted', running: 'Running', claimed: 'Queued', pending: 'Waiting', failed: 'Failed'
}

export default function DashboardScreen() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [sub, setSub] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [userName, setUserName] = useState('')

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/'); return }
    setUserName(user.email?.split('@')[0] || '')
    const [jobData, subData] = await Promise.all([
      getJobs(user.id),
      getSubscription(user.id)
    ])
    setJobs(jobData)
    setSub(subData)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [fetchData])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.replace('/')
  }

  const counts = {
    completed: jobs.filter(j => j.status === 'completed').length,
    inProgress: jobs.filter(j => ['running', 'claimed'].includes(j.status)).length,
    pending: jobs.filter(j => j.status === 'pending').length,
    failed: jobs.filter(j => j.status === 'failed').length,
  }
  const pct = jobs.length ? Math.round((counts.completed / jobs.length) * 100) : 0
  const nextScan = sub?.next_scan_at
    ? new Date(sub.next_scan_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—'

  const sortedJobs = [...jobs].sort((a, b) => {
    const order: Record<string, number> = { completed: 0, running: 1, claimed: 2, pending: 3, failed: 4 }
    return (order[a.status] ?? 5) - (order[b.status] ?? 5)
  })

  if (loading) return (
    <View style={styles.loading}>
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  )

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logo}><Text style={styles.logoText}>DS</Text></View>
          <Text style={styles.headerTitle}>DataShield</Text>
        </View>
        <TouchableOpacity onPress={signOut}>
          <Text style={styles.signOut}>Sign out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Greeting */}
        <Text style={styles.greeting}>Hi, {userName} 👋</Text>
        <Text style={styles.greetingSubtitle}>
          {sub ? `Scan #${sub.total_scans} across ${jobs.length} brokers` : 'Your removal status'}
        </Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: '#0f6e56' }]}>{counts.completed}</Text>
            <Text style={styles.statLabel}>Submitted</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: '#185FA5' }]}>{counts.inProgress}</Text>
            <Text style={styles.statLabel}>Running</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: '#888' }]}>{counts.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: '#A32D2D' }]}>{counts.failed}</Text>
            <Text style={styles.statLabel}>Failed</Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Scan progress</Text>
            <Text style={styles.progressPct}>{pct}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${pct}%` as any }]} />
          </View>
          <Text style={styles.nextScanText}>Next scan: {nextScan}</Text>
        </View>

        {/* Broker list */}
        <Text style={styles.sectionTitle}>Broker status</Text>
        {sortedJobs.map(job => {
          const notFound = job.result?.status === 'not_found'
          return (
            <View key={job.id} style={styles.brokerRow}>
              <View style={[styles.brokerIcon, { backgroundColor: STATUS_COLOR[job.status] + '20' }]}>
                <Text style={[styles.brokerIconText, { color: STATUS_COLOR[job.status] }]}>
                  {STATUS_ICON[job.status] || '○'}
                </Text>
              </View>
              <View style={styles.brokerInfo}>
                <Text style={styles.brokerName}>{job.broker_name}</Text>
                <Text style={styles.brokerStatus}>{notFound ? 'Not listed' : STATUS_LABEL[job.status] || job.status}</Text>
              </View>
            </View>
          )
        })}

        {/* Info box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>What happens next?</Text>
          <Text style={styles.infoText}>
            Brokers process removals within 3–30 days. Some will email you to confirm — tap those confirmation links when they arrive. DataShield re-scans every 30 days automatically.
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f3' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f3' },
  loadingText: { color: '#888', fontSize: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e8e8e8' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 32, height: 32, backgroundColor: '#0f1117', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  logoText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#0f1117' },
  signOut: { fontSize: 14, color: '#888' },
  content: { padding: 20 },
  greeting: { fontSize: 24, fontWeight: '700', color: '#0f1117', marginTop: 8, marginBottom: 4 },
  greetingSubtitle: { fontSize: 14, color: '#888', marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e8e8e8' },
  statNum: { fontSize: 22, fontWeight: '700', marginBottom: 2 },
  statLabel: { fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 },
  progressCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#e8e8e8' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 13, color: '#666' },
  progressPct: { fontSize: 13, color: '#666', fontWeight: '500' },
  progressBar: { height: 8, backgroundColor: '#f0f0f0', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: '#1D9E75', borderRadius: 4 },
  nextScanText: { fontSize: 12, color: '#888' },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#444', marginBottom: 12 },
  brokerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#e8e8e8' },
  brokerIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  brokerIconText: { fontSize: 14, fontWeight: '600' },
  brokerInfo: { flex: 1 },
  brokerName: { fontSize: 14, fontWeight: '500', color: '#0f1117' },
  brokerStatus: { fontSize: 12, color: '#888', marginTop: 1 },
  infoBox: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginTop: 8, marginBottom: 32, borderWidth: 1, borderColor: '#e8e8e8' },
  infoTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#0f1117' },
  infoText: { fontSize: 13, color: '#666', lineHeight: 20 },
})
