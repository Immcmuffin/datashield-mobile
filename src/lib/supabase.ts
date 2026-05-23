import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import Constants from 'expo-constants'

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl!
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

export interface Job {
  id: string
  broker_name: string
  status: string
  result: { status: string; message: string } | null
  error_message: string | null
  updated_at: string
}

export interface Subscription {
  id: string
  plan_id: string
  status: string
  subject_name: string
  next_scan_at: string
  total_scans: number
}

export async function getJobs(userId: string): Promise<Job[]> {
  const { data } = await supabase.rpc('get_all_jobs_for_user', { p_user_id: userId })
  return data || []
}

export async function getSubscription(userId: string): Promise<Subscription | null> {
  const { data } = await supabase
    .schema('ds')
    .from('subscriptions')
    .select('id, plan_id, status, subject_name, next_scan_at, total_scans')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  return data
}
