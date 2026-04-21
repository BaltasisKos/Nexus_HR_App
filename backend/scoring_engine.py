# scoring_engine.py
from themes_data import STRENGTHS_THEMES

def run_assessment(user_answers):
    """
    Υπολογίζει τους βαθμούς για κάθε θέμα με βάση τη σχετική προτίμηση (Forced-Choice).
    Χρησιμοποιεί τη διαφορά των σκορ (A-B) και (B-A) για να υπολογίσει πόσο κερδίζει
    ένα Θέμα έναντι του άλλου.
    
    :param user_answers: Ένα λεξικό της μορφής {ερώτηση_id: [βαθμός_A, βαθμός_B], ...}
    :return: Λεξικό με τα συνολικά σκορ των θεμάτων (scores).
    """
    # Αρχικοποίηση σκορ για όλα τα 34 Θέματα στο 0
    scores = {theme_id: 0 for theme_id in STRENGTHS_THEMES.keys()}
    
    # Φόρτωση ερωτήσεων
    # Εισάγουμε το questions_data εδώ (αντί για την κορυφή) για να αποφύγουμε κυκλικές 
    # εξαρτήσεις, δεδομένου ότι το scoring_engine.py καλείται από το main_app.py
    from questions_data import QUESTIONS 
    q_lookup = {q["id"]: q for q in QUESTIONS}

    for q_id, (score_a, score_b) in user_answers.items():
        # Εξασφάλιση ότι τα σκορ είναι ακέραιοι αριθμοί (int)
        try:
            score_a = int(score_a)
            score_b = int(score_b)
        except (ValueError, TypeError):
             # Αγνοούμε μη έγκυρες ή ελλιπείς απαντήσεις
             continue

        if q_id in q_lookup:
            question = q_lookup[q_id]
            theme_a = question["theme_a_id"]
            theme_b = question["theme_b_id"]
            
            # --- Λογική Βαθμολόγησης Forced-Choice ---
            # Υπολογίζουμε τη σχετική προτίμηση του Α έναντι του Β
            preference_a = score_a - score_b  
            
            # Αν το score_a > score_b (θετική διαφορά), το Θέμα A κερδίζει πόντους 
            # και το Θέμα B χάνει πόντους
            scores[theme_a] += preference_a
            scores[theme_b] -= preference_a # Ισοδύναμο με scores[theme_b] += (score_b - score_a)
            
    return scores

def get_top_strengths(scores, num_top=5):
    """ Ταξινομεί τα σκορ και επιστρέφει τα κορυφαία N πλεονεκτήματα με λεπτομέρειες. """
    
    # Ταξινόμηση των θεμάτων με βάση το συνολικό σκορ σε φθίνουσα σειρά
    sorted_scores = sorted(scores.items(), key=lambda item: item[1], reverse=True)
    
    top_n_results = []
    # Επιστρέφουμε μόνο τα κορυφαία N (default: 5)
    for theme_id, score in sorted_scores[:num_top]:
        if theme_id in STRENGTHS_THEMES:
            details = STRENGTHS_THEMES[theme_id]
            top_n_results.append({
                "ThemeID": theme_id,
                "Title": details["Title"],
                "Domain": details["Domain"],
                "Score": score, # Ο συνολικός βαθμός προτίμησης (μπορεί να είναι και αρνητικός)
                "Description": details["Description"]
            })
        
    return top_n_results