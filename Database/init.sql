CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);

-- Optional: insert test user
INSERT INTO users (email, password) VALUES (
  'chandan@example.com',
  '$2b$12$HashedPasswordHere'
);