import pymysql
from passlib.context import CryptContext


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Informations du compte administrateur à créer
ADMIN_NAME = "Admin Principal"
ADMIN_EMAIL = "admin@iacademie.com"
ADMIN_PASSWORD = "IAcademi_2026@"  


hashed_password = pwd_context.hash(ADMIN_PASSWORD)

# Connexion à la base de données MySQL
try:
    connection = pymysql.connect(
        host="localhost",
        user="root",          
        password="Projet@iacademie@2026_",          
        database="iacademie_db",
        cursorclass=pymysql.cursors.DictCursor
    )

    with connection.cursor() as cursor:
        # Vérifier si l'admin existe déjà
        sql_check = "SELECT id FROM users WHERE email = %s"
        cursor.execute(sql_check, (ADMIN_EMAIL,))
        existing_user = cursor.fetchone()

        if existing_user:
            # S'il existe déjà, on met simplement à jour son rôle et son mot de passe
            sql_update = "UPDATE users SET password_hash = %s, role = 'admin' WHERE email = %s"
            cursor.execute(sql_update, (hashed_password, ADMIN_EMAIL))
            print(f" Le compte {ADMIN_EMAIL} existait déjà. Il a été mis à jour en rôle ADMIN.")
        else:
            # Sinon, on crée le nouveau compte admin
            sql_insert = """
                INSERT INTO users (full_name, email, password_hash, role)
                VALUES (%s, %s, %s, 'admin')
            """
            cursor.execute(sql_insert, (ADMIN_NAME, ADMIN_EMAIL, hashed_password))
            print(f" Compte Administrateur créé avec succès ! Email: {ADMIN_EMAIL}")

    # Valider les changements dans la BDD
    connection.commit()

except Exception as e:
    print(f" Erreur lors de la création de l'admin : {e}")

finally:
    if 'connection' in locals() and connection.open:
        connection.close()