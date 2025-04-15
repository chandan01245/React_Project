import psycopg2

# Step 1: Connect to the default 'postgres' database to create a new one
conn = psycopg2.connect(
    dbname="postgres",
    user="postgres",
    password="ILIkari7",
    host="localhost"
)
conn.autocommit = True
cursor = conn.cursor()

# Step 2: Create a new database called 'test_db'
cursor.execute("DROP DATABASE IF EXISTS test_db")
cursor.execute("CREATE DATABASE test_db")
cursor.close()
conn.close()

# Step 3: Connect to the new 'test_db' database
conn = psycopg2.connect(
    dbname="test_db",
    user="postgres",
    password="your_password",
    host="localhost"
)
cursor = conn.cursor()

# Step 4: Create a table
cursor.execute("""
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL
)
""")

# Step 5: Insert some data
cursor.execute("INSERT INTO users (name, email) VALUES (%s, %s)", ("Alice", "alice@example.com"))
cursor.execute("INSERT INTO users (name, email) VALUES (%s, %s)", ("Bob", "bob@example.com"))

# Step 6: Query the data
cursor.execute("SELECT * FROM users")
rows = cursor.fetchall()

for row in rows:
    print(row)

# Step 7: Clean up
conn.commit()
cursor.close()
conn.close()
