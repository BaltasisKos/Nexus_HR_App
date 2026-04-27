# Nexus HR - Strengths Assessment Tool 🚀

Το **Nexus HR** είναι μια σύγχρονη web εφαρμογή αξιολόγησης προσωπικού, βασισμένη στη φιλοσοφία των 34 ταλέντων (Strengths-Based Development) για προσωπική χρήση και οχι εμπορική. Επιτρέπει στους χρήστες να ανακαλύψουν τα κυρίαρχα ταλέντα τους μέσα από ένα διαδραστικό ερωτηματολόγιο και παρέχει λεπτομερή ανάλυση των αποτελεσμάτων τους.

<div align="center" style="display: flex; justify-content: center; align-items: flex-start; gap: 10px;">
  <img src="./frontend/src/assets/images/DesktopView.png" height="350" alt="Desktop View" />
  <img src="./frontend/src/assets/images/MobileView.png" height="350" alt="Mobile View" />
</div>

## ✨ Χαρακτηριστικά
* **Προσωποποιημένη Εμπειρία:** Εισαγωγή στοιχείων χρήστη και δυναμική φόρτωση ερωτήσεων.
* **Έξυπνος Αλγόριθμος:** Υπολογισμός σκορ σε πραγματικό χρόνο για 34 διαφορετικές θεματικές ενότητες ταλέντων.
* **Visual Results:** Παρουσίαση των Top 5 ταλέντων με χρήση Color Coding ανάλογα με το Domain (Executing, Influencing, Relationship Building, Strategic Thinking).
* **Τοπική Αποθήκευση:** Αυτόματη καταγραφή των αποτελεσμάτων σε JSON αρχείο για μελλοντική ανάλυση από το τμήμα HR.
* **Responsive UI:** Σύγχρονο design φτιαγμένο με React και Material UI.

## 🛠️ Τεχνολογίες
* **Frontend:** React, TypeScript, Material UI, CSS3.
* **Backend:** Python, Flask, Flask-CORS.
* **Data Handling:** JSON, Python Dictionaries.

---

## 🚀 Οδηγίες Εγκατάστασης

1.  **Backend:**
    ```bash
    cd backend
    python main.py
    ```
2.  **Frontend:**
    ```bash
    cd frontend
    npm install
    npm start
    ```