import mysql, { type Connection } from 'mysql2/promise'

export async function withDatabase<T>(
  callback: (db: Connection) => Promise<T>
): Promise<T> {
  let db: Connection | null = null

  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST as string,
      user: process.env.DB_USER as string,
      password: process.env.DB_PASSWORD as string,
      database: process.env.DB_NAME as string,
    })

    await initializeDatabase(db)

    return await callback(db)
  } catch (error) {
    console.error('DB ERROR: ', error)
    throw error
  } finally {
    // Ensure the connection is always closed
    if (db) {
      await db.end()
    }
  }
}

async function initializeDatabase(db: Connection) {
  // politicians
  await db.execute(`
    CREATE TABLE IF NOT EXISTS politicians (
      id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
      party VARCHAR(255),
      name VARCHAR(255) NOT NULL,
      avatar VARCHAR(255),
      birth_year INT,
      gender VARCHAR(255),
      website VARCHAR(255),
      facebook VARCHAR(255),
      twitter VARCHAR(255),
      youtube VARCHAR(255),
      line VARCHAR(255),
      instagram VARCHAR(255),
      tiktok VARCHAR(255),
      linkedin VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // represent51 candidates
  await db.execute(`
    CREATE TABLE IF NOT EXISTS represent51 (
      id INT AUTO_INCREMENT PRIMARY KEY,
      district VARCHAR(255) NOT NULL,
      politician_id INT NOT NULL,
      new_comer VARCHAR(255),
      tickets INT NOT NULL DEFAULT 0,
      member BOOLEAN NOT NULL DEFAULT FALSE,
      proportional BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (politician_id) REFERENCES politicians(id) ON DELETE CASCADE
    )
  `)

  // representatives2026 candidates
  await db.execute(`
    CREATE TABLE IF NOT EXISTS representatives2026 (
      kanji_name VARCHAR(255),
      hiragana_name VARCHAR(255),
      party VARCHAR(255),
      district VARCHAR(255),
      proportional VARCHAR(255),
      shu_count INT,
      san_count INT,
      birth_date VARCHAR(255),
      avatar VARCHAR(255),
      title VARCHAR(255),
      biography TEXT,
      origin VARCHAR(255),
      shin VARCHAR(255),
      questions_answers JSON
    )
  `)
}