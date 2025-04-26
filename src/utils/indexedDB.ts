import { Ingredient, Dish, Meal } from '@/types';

// Database configuration
const DB_NAME = 'meal-planner-db';
const DB_VERSION = 2; // Increased version for new store
const INGREDIENTS_STORE = 'ingredients';
const DISHES_STORE = 'dishes';
const MEALS_STORE = 'meals'; // New store for meals

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
      
      // Create the meals store if it doesn't exist
      if (!db.objectStoreNames.contains(MEALS_STORE)) {
        db.createObjectStore(MEALS_STORE, { keyPath: 'id' });
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

// Meals specific functions
export const getStoredMeals = (): Promise<Meal[]> => {
  return getAllItems<Meal>(MEALS_STORE).catch(() => {
    // If there's an error (e.g., store doesn't exist yet), return empty array
    return [] as Meal[];
  });
};

export const storeMeals = (meals: Meal[]): Promise<void> => {
  return saveAllItems<Meal>(MEALS_STORE, meals);
};

// Export and import functions
export const exportAllData = async (): Promise<string> => {
  try {
    const ingredients = await getStoredIngredients();
    const dishes = await getStoredDishes();
    const meals = await getStoredMeals();
    
    const data = {
      ingredients,
      dishes,
      meals,
      version: '1.0.0',
      exportDate: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};

export const importAllData = async (jsonData: string): Promise<{ 
  ingredients: Ingredient[],
  dishes: Dish[],
  meals: Meal[]
}> => {
  try {
    const data = JSON.parse(jsonData);
    
    if (!data.ingredients || !data.dishes) {
      throw new Error('Invalid data format: missing ingredients or dishes');
    }
    
    await storeIngredients(data.ingredients);
    await storeDishes(data.dishes);
    
    // Handle meals if present
    if (data.meals) {
      await storeMeals(data.meals);
    }
    
    return {
      ingredients: data.ingredients,
      dishes: data.dishes,
      meals: data.meals || []
    };
  } catch (error) {
    console.error('Error importing data:', error);
    throw new Error('Failed to import data. The format might be invalid.');
  }
};
