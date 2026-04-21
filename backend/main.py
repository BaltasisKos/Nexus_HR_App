import random

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

@app.route('/api/submit', methods=['POST'])
def submit_quiz():
    data = request.json
    username = data.get('username')
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
    for i in range(min(5, len(sorted_talents))):
        talent_name = sorted_talents[i][0]
        score = sorted_talents[i][1]
        
        # Παίρνουμε τις πληροφορίες από το themes_data
        info = STRENGTHS_THEMES.get(talent_name, {"Domain": "Unknown", "Description": ""})
        
        top_5.append({
            "Title": talent_name,
            "Domain": info["Domain"],
            "Description": info["Description"],
            "Score": score
        })

    return jsonify({
        "status": "success",
        "username": username,
        "top_5": top_5
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)