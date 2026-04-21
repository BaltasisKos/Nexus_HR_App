# db_manager.py
import sqlite3
import pandas as pd
import os

DB_NAME = "strengths_assessment.db"

def connect_db():
    """ Δημιουργεί τη σύνδεση με τη βάση δεδομένων SQLite. """
    return sqlite3.connect(DB_NAME)

def setup_database():
    """ Δημιουργεί τους πίνακες 'users' και 'results' εάν δεν υπάρχουν. """
    conn = connect_db()
    cursor = conn.cursor()
    
    # Πίνακας Χρηστών
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY,
            username TEXT NOT NULL UNIQUE
        )
    """)
    
    # Πίνακας Αποτελεσμάτων
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS results (
            result_id INTEGER PRIMARY KEY,
            user_id INTEGER,
            theme_id TEXT NOT NULL,
            score INTEGER NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (user_id)
        )
    """)
    
    conn.commit()
    conn.close()

def save_assessment_results(username, scores):
    """ Αποθηκεύει τα σκορ για έναν χρήστη. """
    conn = connect_db()
    cursor = conn.cursor()

    # 1. Βρίσκει ή δημιουργεί τον χρήστη
    cursor.execute("INSERT OR IGNORE INTO users (username) VALUES (?)", (username,))
    
    # Ανεξάρτητα από το αν δημιουργήθηκε, βρίσκουμε το user_id
    cursor.execute("SELECT user_id FROM users WHERE username = ?", (username,))
    user_id = cursor.fetchone()[0]

    # Προαιρετικό: Διαγραφή παλαιότερων αποτελεσμάτων του χρήστη (για να διατηρηθεί μόνο το πιο πρόσφατο)
    # cursor.execute("DELETE FROM results WHERE user_id = ?", (user_id,))
    
    # 2. Αποθήκευση των νέων αποτελεσμάτων
    results_to_insert = [(user_id, theme_id, score) for theme_id, score in scores.items()]
    
    cursor.executemany("""
        INSERT INTO results (user_id, theme_id, score) VALUES (?, ?, ?)
    """, results_to_insert)

    conn.commit()
    conn.close()
    
    return user_id

def export_all_results_to_csv_excel(output_filename="strengths_results.xlsx"):
    """
    Εξάγει όλα τα αποθηκευμένα αποτελέσματα (από όλους τους χρήστες) σε αρχείο Excel/CSV.
    Χρησιμοποιεί τη βιβλιοθήκη Pandas.
    """
    conn = connect_db()
    
    # SQL query για να ενώσει τα ονόματα των χρηστών με τα αποτελέσματά τους
    query = """
    SELECT
        u.username,
        r.theme_id,
        r.score,
        r.timestamp
    FROM
        results r
    JOIN
        users u ON r.user_id = u.user_id
    ORDER BY
        u.username, r.score DESC;
    """
    
    # Δημιουργία DataFrame από το query
    df = pd.read_sql_query(query, conn)
    conn.close()
    
    # Εξαγωγή ανάλογα με την κατάληξη του αρχείου
    if output_filename.lower().endswith('.csv'):
        df.to_csv(output_filename, index=False, encoding='utf-8')
    else:
        # Προεπιλογή: Excel
        df.to_excel(output_filename, index=False, sheet_name='All Results')
        
    return os.path.abspath(output_filename)