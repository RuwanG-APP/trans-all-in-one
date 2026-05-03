import React, { createContext, useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, onSnapshot, query, setDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export const AgentContext = createContext();

export const AgentProvider = ({ children }) => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'agents'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const agentsData = [];
      snapshot.forEach((doc) => {
        agentsData.push({ id: doc.id, ...doc.data() });
      });
      setAgents(agentsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addAgent = async (agentData) => {
    try {
      const id = agentData.id || agentData.name.toLowerCase().replace(/\s+/g, '_');
      await setDoc(doc(db, 'agents', id), {
        ...agentData,
        id,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error adding agent:", error);
      throw error;
    }
  };

  const updateAgent = async (id, updatedData) => {
    try {
      const agentRef = doc(db, 'agents', id);
      await updateDoc(agentRef, updatedData);
    } catch (error) {
      console.error("Error updating agent:", error);
      throw error;
    }
  };

  const deleteAgent = async (id) => {
    try {
      await deleteDoc(doc(db, 'agents', id));
    } catch (error) {
      console.error("Error deleting agent:", error);
      throw error;
    }
  };

  return (
    <AgentContext.Provider value={{ agents, addAgent, updateAgent, deleteAgent, loading }}>
      {children}
    </AgentContext.Provider>
  );
};
