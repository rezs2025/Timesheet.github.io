import { useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { 
  collection, query, where, getDocs, 
  doc, getDoc, documentId 
} from 'firebase/firestore';

const useLoggedUser = () => {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    const checkLoggedUser = async () => {
      setLoading(true);
      try {
        const currentAuthUser = auth.currentUser;
        if (!currentAuthUser) {
          setUser(null);
          return;
        }

        // 1) Obtener datos del usuario
        const userQuery = query(
          collection(db, 'users'),
          where('email', '==', currentAuthUser.email)
        );
        const userSnapshot = await getDocs(userQuery);

        if (userSnapshot.empty) {
          setError('Usuario no encontrado');
          setUser(null);
          return;
        }

        const userData = userSnapshot.docs[0].data();
        console.log('Datos del usuario:', userData);

        // 2) Obtener proyecto actual
        let currentProject = null;
        const projectId = userData.projectId;

        if (projectId) {
          const projectQuery = query(
            collection(db, 'projects'),
            where(documentId(), '==', projectId)
          );
          const projSnap = await getDocs(projectQuery);
          if (!projSnap.empty) {
            const proj = projSnap.docs[0];
            currentProject = { id: proj.id, ...proj.data() };
          }
        } else {
          console.warn('No existe el campo projectId para este usuario');
        }

        // 3) Armar objeto user final
        setUser({
          id: userSnapshot.docs[0].id,
          ...userData,
          currentProject
        });
        setError(null);

      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Error al obtener datos de usuario');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(checkLoggedUser);
    checkLoggedUser();
    return () => unsubscribe();
  }, []);

  return { user, loading, error };
};

export default useLoggedUser;
