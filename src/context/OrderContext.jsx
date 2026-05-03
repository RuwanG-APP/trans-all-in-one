import React, { createContext, useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, setDoc, onSnapshot, query, orderBy, updateDoc, doc } from 'firebase/firestore';

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to real-time updates from Firestore
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = [];
      snapshot.forEach((doc) => {
        ordersData.push({ id: doc.id, ...doc.data() });
      });
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addOrder = async (orderData) => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const date = String(now.getDate()).padStart(2, '0');
      let hours = now.getHours();
      const mins = String(now.getMinutes()).padStart(2, '0');
      
      // Convert to 12 hour format for the ID (optional, but requested format looked like 4:49)
      hours = hours % 12 || 12;

      const randomSuffix = Math.floor(Math.random() * 90 + 10); // 10 to 99
      const customId = `${year}${month}${date}-${hours}${mins}-${randomSuffix}`;

      const newOrder = {
        ...orderData,
        createdAt: now.toISOString(),
        status: 'pending'
      };
      
      await setDoc(doc(db, 'orders', customId), newOrder);
      return customId;
    } catch (error) {
      console.error("Error adding order: ", error);
      throw error;
    }
  };

  const updateOrderStatus = async (id, status, extraData = {}) => {
    try {
      const orderRef = doc(db, 'orders', id);
      await updateDoc(orderRef, {
        status,
        ...extraData
      });
    } catch (error) {
      console.error("Error updating order:", error);
      throw error;
    }
  };

  const assignTranslator = async (orderId, translatorId) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        translatorId: translatorId,
        assignedAt: new Date().toISOString(),
        status: 'assigned'
      });
    } catch (error) {
      console.error("Error assigning translator:", error);
      throw error;
    }
  };

  const assignAgent = async (orderId, agentId) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        agentId: agentId,
        linkedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error assigning agent:", error);
      throw error;
    }
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus, assignTranslator, assignAgent, loading }}>
      {children}
    </OrderContext.Provider>
  );
};
