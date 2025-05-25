// hooks/useCurrentProject.js
import { useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';

const useLoggedUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkLoggedUser = async () => {
      try {
        if (!auth.currentUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        const userQuery = query(
          collection(db, 'users'),
          where('email', '==', auth.currentUser.email),
        );

        const userSnapshot = await getDocs(userQuery);
        if (userSnapshot.empty) {
          setUser(null);
          setError('User not found');
        } else {
          setUser(userSnapshot.docs[0].data());
          console.log({ user: userSnapshot.docs[0].data() });
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Error fetching user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Verificar cuando cambia el estado de autenticación
    const unsubscribe = auth.onAuthStateChanged(() => {
      checkLoggedUser();
    });

    // Verificar inmediatamente
    checkLoggedUser();

    return () => unsubscribe();
  }, []);

  return { user, loading, error };
};

export default useLoggedUser;