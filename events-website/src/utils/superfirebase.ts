
import { createClient } from '@supabase/supabase-js';
import firebase from 'firebase/compat/app';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseUser = createClient(supabaseUrl, supabaseKey, {
  accessToken: async () => {
    return (await firebase.auth().currentUser?.getIdToken(/* forceRefresh */ false)) ?? null
  },
})

export default supabaseUser