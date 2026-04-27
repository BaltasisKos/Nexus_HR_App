import random

import json
import os
from datetime import datetime

from flask import Flask, request, jsonify
from flask_cors import CORS

# Εισαγωγή των δεδομένων από τα αρχεία σου
from questions_data import QUESTIONS
from themes_data import STRENGTHS_THEMES # Αν το έχεις ονομάσει αλλιώς, άλλαξέ το εδώ

app = Flask(__name__)
CORS(app, resources={r"/api/*": {
    "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
    "methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["Content-Type"]
}})

@app.route('/api/questions', methods=['GET'])
def get_questions():
    # 1. Παίρνουμε τυχαία 20 ερωτήσεις
    random_questions = random.sample(QUESTIONS, 20)
    
    clean_questions = []
    
    # 2. ΠΡΟΣΟΧΗ: Κάνουμε loop στο random_questions και ΟΧΙ στο QUESTIONS
    for q in random_questions:
        clean_questions.append({
            "id": q["id"],
            "statement_a": q["statement_a"],
            "statement_b": q["statement_b"]
        })
    
    return jsonify(clean_questions)

# Συνάρτηση για αποθήκευση σε JSON
def save_user_results(result_data):
    file_path = 'results_database.json'
    
    # 1. Αρχικοποίηση λίστας αποτελεσμάτων
    all_results = []
    
    # 2. Αν το αρχείο υπάρχει ήδη, διάβασε τα περιεχόμενά του
    if os.path.exists(file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                all_results = json.load(f)
        except json.JSONDecodeError:
            # Αν το αρχείο είναι κατεστραμμένο ή άδειο
            all_results = []

    # 3. Πρόσθεσε το νέο αποτέλεσμα στη λίστα
    all_results.append(result_data)
    
    # 4. Αποθήκευση πίσω στο αρχείο
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(all_results, f, ensure_ascii=False, indent=4)
        
@app.route('/api/results', methods=['GET'])
def get_results():
    try:
        with open('results_database.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        return jsonify(data)
    except FileNotFoundError:
        return jsonify([]) # Επιστρέφει άδειο πίνακα αν δεν υπάρχει το αρχείο        

@app.route('/api/submit', methods=['POST'])
def submit_quiz():
    data = request.json
    username = data.get('username')
    age = data.get('age')
    gender = data.get('gender')
    user_answers = data.get('answers') # Format: {"1": [1,0], "2": [0,1]}

    # 1. Δημιουργούμε ένα "κουμπαρά" σκορ για κάθε ταλέντο που υπάρχει στο themes_data
    tallies = {name: 0 for name in STRENGTHS_THEMES.keys()}

    # 2. Υπολογισμός: Διατρέχουμε τις ερωτήσεις από το questions_data
    for q in QUESTIONS:
        q_id = str(q["id"])
        if q_id in user_answers:
            choice = user_answers[q_id] # [1,0] αν επέλεξε A, [0,1] αν επέλεξε B
            
            if choice[0] == 1:
                # Ο χρήστης επέλεξε το Statement A
                talent_name = q["theme_a_id"]
                if talent_name in tallies:
                    tallies[talent_name] += 1
            else:
                # Ο χρήστης επέλεξε το Statement B
                talent_name = q["theme_b_id"]
                if talent_name in tallies:
                    tallies[talent_name] += 1

    # 3. Ταξινόμηση ταλέντων βάσει σκορ (από το μεγαλύτερο στο μικρότερο)
    sorted_talents = sorted(tallies.items(), key=lambda x: x[1], reverse=True)

    # 4. Κατασκευή του Top 5 με όλα τα extra στοιχεία (Domain, Description)
    top_5 = []
    seen_titles = set()
    for talent_name, score in sorted_talents:
        # Αν έχουμε ήδη βρει 5 μοναδικά, σταματάμε
        if len(top_5) == 5:
            break
            
        # Αν το ταλέντο υπάρχει στα δεδομένα μας ΚΑΙ δεν το έχουμε ήδη βάλει
        info = STRENGTHS_THEMES.get(talent_name)
        if info and talent_name not in seen_titles:
            top_5.append({
                "ThemeID": talent_name,
                "Title": info["Title"],
                "Domain": info["Domain"],
                "Description": info["Description"],
                "Score": score
            })
            # Σημειώνουμε το ID για να μην το ξαναβάλουμε
            seen_titles.add(talent_name)
        
        # ΠΡΟΕΤΟΙΜΑΣΙΑ ΔΕΔΟΜΕΝΩΝ ΓΙΑ ΑΠΟΘΗΚΕΥΣΗ
    full_result_to_save = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "user_info": {
            "username": username,
            "age": age,
            "gender": gender
        },
        "top_5_results": top_5,
        
    }

    # ΚΛΗΣΗ ΤΗΣ ΣΥΝΑΡΤΗΣΗΣ ΑΠΟΘΗΚΕΥΣΗΣ
    save_user_results(full_result_to_save)

    return jsonify({
        "status": "success",
        "username": username,
        "top_5": top_5
    })
    
@app.route('/api/delete_user', methods=['POST'])
def delete_user():
    data_received = request.json
    user_to_delete = data_received.get('username')
    
    if not user_to_delete:
        return jsonify({"error": "No username provided"}), 400

    try:
        with open('results_database.json', 'r', encoding='utf-8') as f:
            database = json.load(f)
        
        # ΠΡΟΣΟΧΗ ΕΔΩ: Πηγαίνουμε βαθύτερα στη δομή [user_info][username]
        new_database = [
            user for user in database 
            if user.get('user_info', {}).get('username') != user_to_delete
        ]
        
        with open('results_database.json', 'w', encoding='utf-8') as f:
            json.dump(new_database, f, indent=4, ensure_ascii=False)
            
        return jsonify({"message": "Deleted successfully"}), 200
    except Exception as e:
        # Αυτό θα σου πει ακριβώς τι φταίει αν ξανασυμβεί σφάλμα
        print(f"Error during delete: {e}")
        return jsonify({"error": str(e)}), 500
    

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)