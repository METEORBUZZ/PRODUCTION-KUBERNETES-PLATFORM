import { Pool, PoolClient } from 'pg';

export interface VoteResult {
  cat: number;
  dog: number;
  total: number;
  catPercentage: number;
  dogPercentage: number;
}

// In-memory fallback store for local testing/development when Postgres is unavailable
class InMemoryStore {
  private catVotes: number = 0;
  private dogVotes: number = 0;

  async getVotes(): Promise<VoteResult> {
    const total = this.catVotes + this.dogVotes;
    const catPercentage = total === 0 ? 50 : Math.round((this.catVotes / total) * 100);
    const dogPercentage = total === 0 ? 50 : Math.round((this.dogVotes / total) * 100);
    return {
      cat: this.catVotes,
      dog: this.dogVotes,
      total,
      catPercentage,
      dogPercentage,
    };
  }

  async incrementVote(option: 'CAT' | 'DOG'): Promise<VoteResult> {
    if (option === 'CAT') {
      this.catVotes += 1;
    } else if (option === 'DOG') {
      this.dogVotes += 1;
    }
    return this.getVotes();
  }

  async resetVotes(): Promise<VoteResult> {
    this.catVotes = 0;
    this.dogVotes = 0;
    return this.getVotes();
  }

  isReady(): boolean {
    return true;
  }
}

const memoryStore = new InMemoryStore();
let forceMemoryStore = process.env.USE_MEMORY_STORE === 'true';

export function setUseMemoryStore(enabled: boolean) {
  forceMemoryStore = enabled;
}

export function isMemoryStoreActive(): boolean {
  return forceMemoryStore || process.env.USE_MEMORY_STORE === 'true';
}

const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'catdog',
  max: parseInt(process.env.DB_POOL_MAX || '50', 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

export const pool = new Pool(poolConfig);

export async function initDatabase(): Promise<void> {
  if (isMemoryStoreActive()) {
    console.log('[DB] Running with in-memory store.');
    return;
  }

  try {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS votes (
          id SERIAL PRIMARY KEY,
          option VARCHAR(10) NOT NULL UNIQUE,
          count BIGINT NOT NULL DEFAULT 0 CHECK (count >= 0),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_votes_option ON votes(option);

        INSERT INTO votes (option, count, updated_at)
        VALUES 
          ('CAT', 0, CURRENT_TIMESTAMP),
          ('DOG', 0, CURRENT_TIMESTAMP)
        ON CONFLICT (option) DO NOTHING;
      `);
      console.log('[DB] PostgreSQL schema verified and ready.');
    } finally {
      client.release();
    }
  } catch (err) {
    console.warn('[DB] Failed to connect to PostgreSQL during startup:', (err as Error).message);
    if (process.env.NODE_ENV === 'test' || process.env.FALLBACK_TO_MEMORY === 'true') {
      console.warn('[DB] Falling back to in-memory store for development/testing.');
      forceMemoryStore = true;
    }
  }
}

export async function checkDatabaseHealth(): Promise<boolean> {
  if (isMemoryStoreActive()) {
    return true;
  }
  try {
    const res = await pool.query('SELECT 1 AS health');
    return res.rows.length > 0;
  } catch (err) {
    console.error('[DB Health Check Error]:', (err as Error).message);
    return false;
  }
}

export async function getVotesFromDB(): Promise<VoteResult> {
  if (isMemoryStoreActive()) {
    return memoryStore.getVotes();
  }

  const res = await pool.query('SELECT option, count FROM votes WHERE option IN (\'CAT\', \'DOG\')');
  let cat = 0;
  let dog = 0;

  for (const row of res.rows) {
    if (row.option === 'CAT') {
      cat = parseInt(row.count, 10);
    } else if (row.option === 'DOG') {
      dog = parseInt(row.count, 10);
    }
  }

  const total = cat + dog;
  const catPercentage = total === 0 ? 50 : Math.round((cat / total) * 100);
  const dogPercentage = total === 0 ? 50 : Math.round((dog / total) * 100);

  return {
    cat,
    dog,
    total,
    catPercentage,
    dogPercentage,
  };
}

export async function incrementVoteInDB(option: 'CAT' | 'DOG'): Promise<VoteResult> {
  if (isMemoryStoreActive()) {
    return memoryStore.incrementVote(option);
  }

  // Atomic update within a single checked-out client to eliminate connection deadlocks
  const client: PoolClient = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE votes 
       SET count = count + 1, updated_at = CURRENT_TIMESTAMP 
       WHERE option = $1`,
      [option]
    );

    const res = await client.query('SELECT option, count FROM votes WHERE option IN (\'CAT\', \'DOG\')');
    await client.query('COMMIT');

    let cat = 0;
    let dog = 0;
    for (const row of res.rows) {
      if (row.option === 'CAT') {
        cat = parseInt(row.count, 10);
      } else if (row.option === 'DOG') {
        dog = parseInt(row.count, 10);
      }
    }

    const total = cat + dog;
    const catPercentage = total === 0 ? 50 : Math.round((cat / total) * 100);
    const dogPercentage = total === 0 ? 50 : Math.round((dog / total) * 100);

    return {
      cat,
      dog,
      total,
      catPercentage,
      dogPercentage,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function resetVotesInDB(): Promise<VoteResult> {
  if (isMemoryStoreActive()) {
    return memoryStore.resetVotes();
  }

  await pool.query('UPDATE votes SET count = 0, updated_at = CURRENT_TIMESTAMP');
  return {
    cat: 0,
    dog: 0,
    total: 0,
    catPercentage: 50,
    dogPercentage: 50,
  };
}
