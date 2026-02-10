import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const ModuleContext = createContext();

export const ModuleProvider = ({ children }) => {
  const { user } = useAuth();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

  const fetchModules = useCallback(async () => {
    if (!user) {
      setModules([]);
      return;
    }

    try {
      setLoading(true);

      // Fetch user's own modules
      const { data: ownModules, error: ownError } = await supabase
        .from('modules')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ownError) throw ownError;

      // Fetch shared modules
      const { data: sharedModules, error: sharedError } = await supabase
        .from('shared_modules')
        .select('modules(*)')
        .eq('shared_with_id', user.id)
        .order('created_at', { ascending: false });

      if (sharedError) throw sharedError;

      const sharedModulesList = sharedModules?.map((item) => ({
        ...item.modules,
        isShared: true,
      })) || [];

      const allModules = [...(ownModules || []), ...sharedModulesList];
      setModules(allModules);
    } catch (error) {
      console.error('Error fetching modules:', error);
      setModules([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createModule = async (title, description, color, icon) => {
    if (!user) {
      console.error('No user logged in');
      return { module: null, error: 'No user logged in' };
    }

    try {
      const { data, error } = await supabase
        .from('modules')
        .insert([
          {
            user_id: user.id,
            title,
            description,
            color,
            icon,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setModules((prev) => [data, ...prev]);
      return { module: data, error: null };
    } catch (error) {
      console.error('Error creating module:', error);
      return { module: null, error: error.message };
    }
  };

  const updateModule = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('modules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setModules((prev) =>
        prev.map((m) => (m.id === id ? data : m))
      );

      if (selectedModule?.id === id) {
        setSelectedModule(data);
      }

      return { module: data, error: null };
    } catch (error) {
      console.error('Error updating module:', error);
      return { module: null, error: error.message };
    }
  };

  const deleteModule = async (id) => {
    try {
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setModules((prev) => prev.filter((m) => m.id !== id));

      if (selectedModule?.id === id) {
        setSelectedModule(null);
      }

      return { error: null };
    } catch (error) {
      console.error('Error deleting module:', error);
      return { error: error.message };
    }
  };

  const selectModule = (module) => {
    setSelectedModule(module);
  };

  const value = {
    modules,
    loading,
    selectedModule,
    fetchModules,
    createModule,
    updateModule,
    deleteModule,
    selectModule,
  };

  return (
    <ModuleContext.Provider value={value}>{children}</ModuleContext.Provider>
  );
};

export const useModules = () => {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error('useModules must be used within a ModuleProvider');
  }
  return context;
};
