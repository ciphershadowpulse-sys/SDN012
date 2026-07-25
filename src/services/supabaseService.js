import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://url-supabase-anda.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'anon-key-anda'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Fungsi Layanan Guru
export const teacherService = {
  async getProfile(userId) {
    const { data, error } = await supabase.from('teacher_profiles').select('*').eq('id', userId).single()
    if (error) throw error
    return data
  },

  async getClasses(teacherId) {
    const { data, error } = await supabase.from('classes').select('*').eq('teacher_id', teacherId)
    if (error) throw error
    return data
  },

  async getAssignments(classId) {
    const { data, error } = await supabase.from('assignments').select('*').eq('class_id', classId)
    if (error) throw error
    return data
  },

  async createAssignment(assignmentData) {
    const { data, error } = await supabase.from('assignments').insert([assignmentData]).select()
    if (error) throw error
    return data
  }
}