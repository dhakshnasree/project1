import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()

DATABASE_URL = os.getenv("postgresql://neondb_owner:npg_6YBbs3yKrdzE@ep-floral-frost-ap2agpz5-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require")

def get_connection():
    return psycopg2.connect("postgresql://neondb_owner:npg_6YBbs3yKrdzE@ep-floral-frost-ap2agpz5-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require")