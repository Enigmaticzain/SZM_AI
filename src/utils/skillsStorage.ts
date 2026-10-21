import { Skill } from '@/data/knowledgeBase';

const DB_NAME = 'SZM_Skills_DB';
const DB_VERSION = 1;
const STORE_NAME = 'skills';

let db: IDBDatabase | null = null;

async function initDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        objectStore.createIndex('category', 'category', { unique: false });
        objectStore.createIndex('source', 'source', { unique: false });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

export async function addSkill(skill: Skill): Promise<void> {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    
    // Add timestamp if not present
    const skillWithTimestamp = {
      ...skill,
      timestamp: new Date().toISOString(),
    };
    
    const request = objectStore.add(skillWithTimestamp);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function updateSkill(skill: Skill): Promise<void> {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    
    const skillWithTimestamp = {
      ...skill,
      timestamp: new Date().toISOString(),
    };
    
    const request = objectStore.put(skillWithTimestamp);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getSkill(id: string): Promise<Skill | null> {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    
    const request = objectStore.get(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

export async function getAllSkills(): Promise<Skill[]> {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    
    const request = objectStore.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

export async function getSkillsByCategory(category: string): Promise<Skill[]> {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const index = objectStore.index('category');
    
    const request = index.getAll(category);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

export async function getSkillsBySource(source: string): Promise<Skill[]> {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const index = objectStore.index('source');
    
    const request = index.getAll(source);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

export async function deleteSkill(id: string): Promise<void> {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    
    const request = objectStore.delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function deleteSkillsBySource(source: string): Promise<number> {
  const skills = await getSkillsBySource(source);
  const database = await initDB();
  let deleteCount = 0;
  
  for (const skill of skills) {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      
      const request = objectStore.delete(skill.id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        deleteCount++;
        resolve();
      };
    });
  }
  
  return deleteCount;
}

export async function searchSkills(query: string): Promise<Skill[]> {
  const allSkills = await getAllSkills();
  const lowerQuery = query.toLowerCase();
  
  return allSkills.filter(
    (skill) =>
      skill.title.toLowerCase().includes(lowerQuery) ||
      skill.description.toLowerCase().includes(lowerQuery) ||
      skill.keyPoints.some((kp) => kp.toLowerCase().includes(lowerQuery))
  );
}

export async function getSkillStats(): Promise<{
  total: number;
  byCategory: Record<string, number>;
  bySour: Record<string, number>;
  averageComplexity: number;
}> {
  const skills = await getAllSkills();
  const byCategory: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  let totalComplexity = 0;

  skills.forEach((skill) => {
    byCategory[skill.category] = (byCategory[skill.category] || 0) + 1;
    bySource[skill.source] = (bySource[skill.source] || 0) + 1;
    totalComplexity += skill.complexity;
  });

  return {
    total: skills.length,
    byCategory,
    bySour: bySource,
    averageComplexity: skills.length > 0 ? totalComplexity / skills.length : 0,
  };
}

export async function clearAllSkills(): Promise<void> {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    
    const request = objectStore.clear();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function exportSkillsToJSON(): Promise<string> {
  const skills = await getAllSkills();
  return JSON.stringify(skills, null, 2);
}

export async function importSkillsFromJSON(jsonStr: string): Promise<number> {
  try {
    const skills = JSON.parse(jsonStr) as Skill[];
    let imported = 0;
    
    for (const skill of skills) {
      try {
        await addSkill(skill);
        imported++;
      } catch (error) {
        // Skip duplicate skills
        if ((error as Error).message?.includes('ConstraintError')) {
          await updateSkill(skill);
          imported++;
        }
      }
    }
    
    return imported;
  } catch (error) {
    throw new Error(`Failed to import skills: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
