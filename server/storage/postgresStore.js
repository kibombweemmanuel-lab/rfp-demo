import pg from 'pg';

const { Pool } = pg;

export function createPostgresStore(connectionString, documentName, initialValue) {
  const pool = new Pool({ connectionString });
  let initialized;

  async function initialize() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS app_documents (
        name TEXT PRIMARY KEY,
        payload JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await pool.query(
      'INSERT INTO app_documents (name, payload) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
      [documentName, JSON.stringify(initialValue)],
    );
  }

  async function ready() {
    initialized ||= initialize();
    await initialized;
  }

  async function read() {
    await ready();
    const result = await pool.query('SELECT payload FROM app_documents WHERE name = $1', [documentName]);
    return result.rows[0]?.payload ?? structuredClone(initialValue);
  }

  async function write(value) {
    await ready();
    await pool.query(
      'UPDATE app_documents SET payload = $2, updated_at = NOW() WHERE name = $1',
      [documentName, JSON.stringify(value)],
    );
  }

  return { read, write, close: () => pool.end() };
}
