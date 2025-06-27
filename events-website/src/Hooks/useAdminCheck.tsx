import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../utils/firebase';
import supabase from '../utils/supabase';

const useAdminCheck = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);

        const { data, error } = await supabase
          .from('Users')
          .select('admin')
          .eq('firebase_uid', user.uid)
          .single();

        if (error || !data) {
          console.error('Admin check failed:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(data.admin === true);
        }
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { isAdmin, loading, uid };
};

export default useAdminCheck;