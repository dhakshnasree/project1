import psycopg2

def get_connection():
    return psycopg2.connect(
        host="ep-floral-frost-ap2agpz5-pooler.c-7.us-east-1.aws.neon.tech",
        database="neondb",
        user="neondb_owner",
        password="npg_tTl8Sn7rWdup",
        sslmode="require"
    )