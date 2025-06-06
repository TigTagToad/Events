
import { createClient } from '@supabase/supabase-js';
import { auth } from './firebase'; // Import your Firebase auth instance

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseUser = createClient(supabaseUrl, supabaseKey, {
  accessToken: async () => {
    // Use the modern Firebase auth instance instead of the legacy one
    const currentUser = auth.currentUser;
    if (currentUser) {
      return await currentUser.getIdToken(/* forceRefresh */ false);
    }
    return null;
  },
});

export default supabaseUser;