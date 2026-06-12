from backend.app.database import get_connection

conn = get_connection()
cur = conn.cursor()

cur.execute("SELECT version();")
print(cur.fetchone())

conn.close()