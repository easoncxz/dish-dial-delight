
import { Ingredient, Dish } from '@/types';

// Database configuration
const DB_NAME = 'meal-planner-db';
const DB_VERSION = 1;
const INGREDIENTS_STORE = 'ingredients';
const DISHES_STORE = 'dishes';

// Initialize the database
export const initDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('Error opening IndexedDB:', event);
      reject('Error opening IndexedDB');
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(INGREDIENTS_STORE)) {
        db.createObjectStore(INGREDIENTS_STORE, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(DISHES_STORE)) {
        db.createObjectStore(DISHES_STORE, { keyPath: 'id' });
      }
    };
  });
};

// Generic function to get all items from a store
const getAllItems = <T>(storeName: string): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    initDatabase()
      .then(db => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = () => {
          resolve(request.result as T[]);
        };
        
        request.onerror = (event) => {
          console.error(`Error getting all items from ${storeName}:`, event);
          reject(`Error getting all items from ${storeName}`);
        };
      })
      .catch(reject);
  });
};

// Generic function to save all items to a store
const saveAllItems = <T>(storeName: string, items: T[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    initDatabase()
      .then(db => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        
        // Clear all existing data
        const clearRequest = store.clear();
        
        clearRequest.onsuccess = () => {
          // Add all new items
          items.forEach(item => {
            store.add(item);
          });
          
          transaction.oncomplete = () => {
            resolve();
          };
          
          transaction.onerror = (event) => {
            console.error(`Error saving items to ${storeName}:`, event);
            reject(`Error saving items to ${storeName}`);
          };
        };
      })
      .catch(reject);
  });
};

// Ingredients specific functions
export const getStoredIngredients = (): Promise<Ingredient[]> => {
  return getAllItems<Ingredient>(INGREDIENTS_STORE);
};

export const storeIngredients = (ingredients: Ingredient[]): Promise<void> => {
  return saveAllItems<Ingredient>(INGREDIENTS_STORE, ingredients);
};

// Dishes specific functions
export const getStoredDishes = (): Promise<Dish[]> => {
  return getAllItems<Dish>(DISHES_STORE);
};

export const storeDishes = (dishes: Dish[]): Promise<void> => {
  return saveAllItems<Dish>(DISHES_STORE, dishes);
};

// Export and import functions
export const exportAllData = async (): Promise<string> => {
  try {
    const ingredients = await getStoredIngredients();
    const dishes = await getStoredDishes();
    
    const data = {
      ingredients,
      dishes,
      version: '1.0.0',
      exportDate: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};

export const importAllData = async (jsonData: string): Promise<{ ingredients: Ingredient[], dishes: Dish[] }> => {
  try {
    const data = JSON.parse(jsonData);
    
    if (!data.ingredients || !data.dishes) {
      throw new Error('Invalid data format: missing ingredients or dishes');
    }
    
    await storeIngredients(data.ingredients);
    await storeDishes(data.dishes);
    
    return {
      ingredients: data.ingredients,
      dishes: data.dishes
    };
  } catch (error) {
    console.error('Error importing data:', error);
    throw new Error('Failed to import data. The format might be invalid.');
  }
};
