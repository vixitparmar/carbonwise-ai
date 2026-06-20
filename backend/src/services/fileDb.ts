import fs from 'fs';
import path from 'path';

const DB_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DB_DIR, 'db.json');

export interface LocalDbSchema {
  users: any[];
  activities: any[];
  goals: any[];
  chatMessages: any[];
  challenges: any[];
}

const defaultDb: LocalDbSchema = {
  users: [],
  activities: [],
  goals: [],
  chatMessages: [],
  challenges: [
    {
      _id: 'ch_1',
      title: 'Meatless Week',
      description: 'Avoid meat products for 7 days straight',
      coinsReward: 150,
      category: 'food',
      difficulty: 'Medium'
    },
    {
      _id: 'ch_2',
      title: 'Active Commuter',
      description: 'Walk or cycle to work/school 3 times this week',
      coinsReward: 100,
      category: 'travel',
      difficulty: 'Easy'
    },
    {
      _id: 'ch_3',
      title: 'Power Saver',
      description: 'Keep your household energy consumption below 5 kWh per day',
      coinsReward: 200,
      category: 'electricity',
      difficulty: 'Hard'
    }
  ]
};

// Initialize file database
function initDb() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
  } else {
    // Merge potential missing default collections
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      let modified = false;
      for (const key of Object.keys(defaultDb) as Array<keyof LocalDbSchema>) {
        if (!data[key]) {
          data[key] = defaultDb[key];
          modified = true;
        }
      }
      if (modified) {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
      }
    } catch (err) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
    }
  }
}

initDb();

export const fileDb = {
  async read(): Promise<LocalDbSchema> {
    try {
      if (!fs.existsSync(DB_FILE)) {
        initDb();
      }
      const content = await fs.promises.readFile(DB_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Error reading file db:', error);
      return defaultDb;
    }
  },

  async write(data: LocalDbSchema): Promise<void> {
    try {
      await fs.promises.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error writing file db:', error);
    }
  },

  async find<T>(collection: keyof LocalDbSchema, queryFn?: (item: T) => boolean): Promise<T[]> {
    const data = await this.read();
    const items = (data[collection] || []) as T[];
    if (queryFn) {
      return items.filter(queryFn);
    }
    return items;
  },

  async findOne<T>(collection: keyof LocalDbSchema, queryFn: (item: T) => boolean): Promise<T | null> {
    const data = await this.read();
    const items = (data[collection] || []) as T[];
    return items.find(queryFn) || null;
  },

  async insert<T>(collection: keyof LocalDbSchema, item: Omit<T, '_id' | 'id'>): Promise<T> {
    const data = await this.read();
    const newId = collection.substring(0, 3) + '_' + Math.random().toString(36).substr(2, 9);
    const newItem = {
      ...item,
      _id: newId,
      id: newId,
      createdAt: new Date().toISOString()
    } as unknown as T;

    if (!data[collection]) {
      data[collection] = [];
    }
    data[collection].push(newItem);
    await this.write(data);
    return newItem;
  },

  async update<T extends { _id: string }>(
    collection: keyof LocalDbSchema,
    id: string,
    updates: Partial<T>
  ): Promise<T | null> {
    const data = await this.read();
    const items = data[collection] || [];
    const index = items.findIndex((item: any) => item._id === id);
    if (index === -1) return null;

    const updatedItem = {
      ...items[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    items[index] = updatedItem;
    data[collection] = items;
    await this.write(data);
    return updatedItem;
  },

  async delete(collection: keyof LocalDbSchema, id: string): Promise<boolean> {
    const data = await this.read();
    const items = data[collection] || [];
    const index = items.findIndex((item: any) => item._id === id);
    if (index === -1) return false;

    items.splice(index, 1);
    data[collection] = items;
    await this.write(data);
    return true;
  }
};
