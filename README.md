# 🎓 IACADEMIE — E-Learning & Intelligence Artificielle

Plateforme Web d'apprentissage en ligne de nouvelle génération combinant la gestion de formations (cours, vidéos, évaluations, certifications) et un assistant virtuel basé sur l'IA.

> 📌 **Note sur le projet :** Projet conçu en collaboration avec **Ben Jeddou Technologies**. Le développement est actuellement *en pause temporaire* pour prioriser le cursus académique en ingéniorat.

---

## 🛠️ Stack Technique

- **Front-End :** React.js, Tailwind CSS
- **Back-End :** Python, FastAPI, SQLAlchemy
- **Base de Données :** MySQL (`utf8mb4`)
- **Outils :** Uvicorn, Git, VS Code, MySQL Workbench

---

## 🚀 Installation & Démarrage

### 1. Back-End (FastAPI)

```bash
# Accéder au dossier backend
cd backend

# Créer et activer l'environnement virtuel
python -m venv venv
.\venv\Scripts\activate   # Windows
source venv/bin/activate  # Linux/Mac

# Installer les dépendances
pip install -r requirements.txt

# Lancer le serveur d'application
uvicorn main:app --reload
