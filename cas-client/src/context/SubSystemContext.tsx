import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import {
  SubSystem,
  getSubSystems,
  addSubSystem,
  updateSubSystem,
  deleteSubSystem,
  generateToken,
} from '../services/cas';

interface SubSystemContextType {
  systems: SubSystem[];
  addSystem: (system: Omit<SubSystem, 'id'>) => void;
  updateSystem: (id: string, updates: Partial<SubSystem>) => void;
  removeSystem: (id: string) => void;
  refreshSystems: () => void;
}

const SubSystemContext = createContext<SubSystemContextType | null>(null);

export function SubSystemProvider({ children }: { children: ReactNode }) {
  const [systems, setSystems] = useState<SubSystem[]>([]);

  // 初始化加载
  useEffect(() => {
    getSubSystems().then(setSystems);
  }, []);

  const refreshSystems = async () => {
    const list = await getSubSystems();
    setSystems(list);
  };

  const add = async (system: Omit<SubSystem, 'id'>) => {
    const newItem = await addSubSystem(system);
    setSystems(prev => [...prev, newItem]);
  };

  const update = async (id: string, updates: Partial<SubSystem>) => {
    await updateSubSystem(id, updates);
    setSystems(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const remove = async (id: string) => {
    await deleteSubSystem(id);
    setSystems(prev => prev.filter(s => s.id !== id));
  };

  return (
    <SubSystemContext.Provider value={{
      systems,
      addSystem: add,
      updateSystem: update,
      removeSystem: remove,
      refreshSystems,
    }}>
      {children}
    </SubSystemContext.Provider>
  );
}

export const useSubSystems = () => {
  const context = useContext(SubSystemContext);
  if (!context) {
    throw new Error('useSubSystems must be used within SubSystemProvider');
  }
  return context;
};

export { generateToken };
