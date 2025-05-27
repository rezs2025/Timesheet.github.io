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
          const projectQuery = query(
          collection(db, 'projects'),
          where('__name__', '==', userSnapshot.docs[0].data().projectId)
          );
          const projectsSnapshot = await getDocs(projectQuery);
          console.log('Projects found:', projectsSnapshot.docs, userSnapshot.docs[0].data().projectId);
          const projectsList = projectsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          let currentProject = null;
          if (projectsList.length > 0) {
            currentProject = projectsList[0];
          }
          const user = {
            id: userSnapshot.docs[0].id,
            ...userSnapshot.docs[0].data(),
            currentProject
          }
          setUser(user);
          console.log({user});
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