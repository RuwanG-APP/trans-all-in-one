import React, { createContext, useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, onSnapshot, query, setDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export const TranslatorContext = createContext();

export const TranslatorProvider = ({ children }) => {
  const [translators, setTranslators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'translators'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const translatorsData = [];
      snapshot.forEach((doc) => {
        translatorsData.push({ id: doc.id, ...doc.data() });
      });
      setTranslators(translatorsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addTranslator = async (translatorData) => {
    try {
      const id = translatorData.id || translatorData.name.toLowerCase().replace(/\s+/g, '_');
      await setDoc(doc(db, 'translators', id), {
        ...translatorData,
        id,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error adding translator:", error);
      throw error;
    }
  };

  const updateTranslator = async (id, updatedData) => {
    try {
      const translatorRef = doc(db, 'translators', id);
      await updateDoc(translatorRef, updatedData);
    } catch (error) {
      console.error("Error updating translator:", error);
      throw error;
    }
  };

  const deleteTranslator = async (id) => {
    try {
      await deleteDoc(doc(db, 'translators', id));
    } catch (error) {
      console.error("Error deleting translator:", error);
      throw error;
    }
  };

  return (
    <TranslatorContext.Provider value={{ translators, addTranslator, updateTranslator, deleteTranslator, loading }}>
      {children}
    </TranslatorContext.Provider>
  );
};
