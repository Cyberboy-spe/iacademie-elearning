-- 1. Création et sélection de la base de données
CREATE DATABASE IF NOT EXISTS iacademie_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE iacademie_db;

-- 2. Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'instructor', 'admin') NOT NULL DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Insertion du compte Administrateur par défaut
-- Mot de passe par défaut : Admin123! (déjà haché avec bcrypt)
INSERT INTO users (full_name, email, password_hash, role) 
VALUES (
    'Administrateur IACADEMIE', 
    'admin@iacademie.com', 
    '$2b$12$e.qXv1Z.N5f41Wd1XkHGe.9vY8v7dJ0QG/0WdYV1Z5f41Wd1XkHGe', 
    'admin'
)
ON DUPLICATE KEY UPDATE role='admin';

-- 4. Index pour accélérer la recherche par email et rôle lors du login
CREATE INDEX idx_users_email ON users(email);

-- 5. Création de la table des cours 
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    sub_category VARCHAR(100),
    selling_type VARCHAR(100) DEFAULT,
    instructor VARCHAR(100) DEFAULT,
    duration VARCHAR(50) NOT NULL,
    lessons INT NOT NULL DEFAULT 1,
    base_price DECIMAL(10,2) DEFAULT 0.00,
    discount_percent INT DEFAULT 0,
    cover_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insertion de cours de démonstration mis à jour
INSERT INTO courses (title, description, category, sub_category, selling_type, instructor, duration, lessons, base_price, discount_percent, cover_image) VALUES
('Introduction à Python & FastAPI', 'Apprenez à concevoir des API robustes et performantes avec Python et FastAPI.', 'Développement', 'Back-End', 'Disponible en enregistré', 'Ben Jeddou Technologies', '4h 30m', 12, 15000.00, 0, NULL),
('React & Tailwind CSS Masterclass', 'Maîtrisez le développement front-end moderne avec React et l’écosystème Tailwind CSS.', 'Développement', 'Web Dev', 'Live & Enregistré', 'Ben Jeddou Technologies', '6h 15m', 18, 20000.00, 10, NULL),
('Sécurité Réseau & Socket en C', 'Plongez dans la programmation bas niveau, les sockets TCP et l’analyse défensive.', 'Cybersécurité', 'Réseaux', 'Disponible en enregistré', 'Ben Jeddou Technologies', '8h 00m', 24, 35000.00, 0, NULL);

-- 6. Création de la table des leçons (liée aux cours)
CREATE TABLE IF NOT EXISTS lessons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    duration VARCHAR(50) DEFAULT '20 min',
    video_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Table des factures
CREATE TABLE IF NOT EXISTS invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    client_name VARCHAR(100) NOT NULL,
    client_email VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status ENUM('Payé', 'En attente', 'Annulé') NOT NULL DEFAULT 'En attente',
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Table des ventes / transactions commerciales
CREATE TABLE IF NOT EXISTS sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    item_title VARCHAR(255) NOT NULL,
    item_type ENUM('Formation', 'Cours') NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Carte bancaire',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insertion de données de test pour les factures et ventes
INSERT INTO invoices (invoice_number, client_name, client_email, amount, status, due_date) VALUES
('FAC-2026-001', 'Karim Benjedou', 'karim@benjedou.com', 45000.00, 'Payé', '2026-10-30'),
('FAC-2026-002', 'Amine Merad', 'amine.merad@gmail.com', 25000.00, 'En attente', '2026-11-15');

INSERT INTO sales (user_id, item_title, item_type, price, payment_method) VALUES
(1, 'Introduction à Python & FastAPI', 'Cours', 15000.00, 'Carte bancaire');


-- Table pour la FAQ des cours
CREATE TABLE IF NOT EXISTS course_faqs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Table pour les Avis (Reviews) des cours
CREATE TABLE IF NOT EXISTS course_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) DEFAULT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS stock_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    quantity INT NOT NULL DEFAULT 0,
    unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    min_threshold INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);