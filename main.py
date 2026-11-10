import os
import random
from typing import List, Optional
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
import shutil

# Imports Google OAuth2
from google.oauth2 import id_token
from google.auth.transport import requests

# Modules locaux
import database 
from security import hash_password, verify_password, create_access_token

# Chargement des variables d'environnement (.env)
load_dotenv()

app = FastAPI(title="IACADEMIE API")

# Configuration des accès CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montage du dossier uploads pour rendre les images et vidéos accessibles publiquement
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Configuration pour l'envoi des emails de vérification
conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME", "y.leghmizi.etudiant@gmail.com"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD", "dqznrgusapqortal"),
    MAIL_FROM=os.getenv("MAIL_FROM", "y.leghmizi.etudiant@gmail.com"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

# ID Client OAuth2 Google
GOOGLE_CLIENT_ID = os.getenv(
    "GOOGLE_CLIENT_ID",
    "469011736457-ag3c9pm0n1joallf06acb0hp0ie6c9cl.apps.googleusercontent.com"
)

# Stockage temporaire des codes OTP en mémoire (email -> code)
otp_storage = {}


# --- Modèles Pydantic ---
class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str = "student"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class EmailVerifyRequest(BaseModel):
    email: EmailStr

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    code: str

class GoogleAuthRequest(BaseModel):
    token: str

class DashboardStats(BaseModel):
    total_users: int
    total_courses: int

class RoleUpdate(BaseModel):
    role: str

class AdminProfileUpdate(BaseModel):
    full_name: str
    email: EmailStr
    current_password: Optional[str] = None
    new_password: Optional[str] = None

class InvoiceCreate(BaseModel):
    invoice_number: str
    client_name: str
    client_email: EmailStr
    amount: float
    status: str = "En attente"
    due_date: Optional[str] = None

class SaleCreate(BaseModel):
    user_id: Optional[int] = None
    item_title: str
    item_type: str
    price: float
    payment_method: str = "Carte bancaire"

class StockItemCreate(BaseModel):
    item_name: str
    category: str
    quantity: int
    unit_price: float
    min_threshold: Optional[int] = 5


@app.get("/")
def read_root():
    return {"status": "ok", "message": "API IACADEMIE opérationnelle !"}


@app.post("/send-otp")
async def send_otp(data: EmailVerifyRequest):
    conn = database.get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM users WHERE email = %s", (data.email,))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cet e-mail est déjà utilisé."
            )
    finally:
        cursor.close()
        conn.close()

    otp_code = str(random.randint(100000, 999999))
    otp_storage[data.email] = otp_code

    message = MessageSchema(
        subject="Code de vérification - IACADEMIE",
        recipients=[data.email],
        body=f"Bonjour,\n\nVoici votre code de vérification pour votre inscription sur IACADEMIE : {otp_code}\n\nSaisissez ce code pour valider votre compte.",
        subtype=MessageType.plain
    )

    fm = FastMail(conf)
    try:
        await fm.send_message(message)
        return {"message": "Code de vérification envoyé par e-mail."}
    except Exception as e:
        print(f"Erreur SMTP/FastMail : {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erreur d'envoi: {str(e)}"
        )


@app.post("/verify-otp")
def verify_otp(data: VerifyOTPRequest):
    stored_code = otp_storage.get(data.email)
    if not stored_code or stored_code != data.code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Code de vérification incorrect ou expiré."
        )
    
    del otp_storage[data.email]
    return {"message": "Adresse e-mail vérifiée avec succès !"}


@app.post("/auth/google")
def google_auth(data: GoogleAuthRequest):
    try:
        id_info = id_token.verify_oauth2_token(
            data.token, 
            requests.Request(), 
            GOOGLE_CLIENT_ID
        )

        email = id_info.get("email")
        full_name = id_info.get("name", "Utilisateur Google")

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Impossible de récupérer l'e-mail depuis le compte Google."
            )

        conn = database.get_db_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
            user = cursor.fetchone()

            if not user:
                dummy_hashed_pwd = hash_password("google_oauth_protected_pass_123")
                try:
                    cursor.execute(
                        "INSERT INTO users (full_name, email, password_hash, role) VALUES (%s, %s, %s, %s)",
                        (full_name, email, dummy_hashed_pwd, "student")
                    )
                except Exception:
                    conn.rollback()
                    cursor.execute(
                        "INSERT INTO users (full_name, email, password_hash) VALUES (%s, %s, %s)",
                        (full_name, email, dummy_hashed_pwd)
                    )

                conn.commit()
                cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
                user = cursor.fetchone()
        finally:
            cursor.close()
            conn.close()

        if isinstance(user, dict):
            user_id = user["id"]
            user_email = user["email"]
            user_name = user["full_name"]
            user_role = user.get("role", "student")
        else:
            user_id, user_name, user_email = user[0], user[1], user[2]
            user_role = user[4] if len(user) > 4 else "student"

        access_token = create_access_token(data={"sub": user_email, "user_id": user_id})

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "full_name": user_name,
                "email": user_email,
                "role": user_role
            }
        }

    except ValueError as ve:
        print(f"Erreur Token Google : {ve}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token Google invalide ou expiré."
        )
    except Exception as e:
        print(f"Erreur serveur Auth Google : {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur d'authentification Google : {str(e)}"
        )


@app.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: UserRegister):
    conn = database.get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT * FROM users WHERE email = %s", (user.email,))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cet e-mail est déjà utilisé."
            )

        hashed_pwd = hash_password(user.password)
        
        try:
            cursor.execute(
                "INSERT INTO users (full_name, email, password_hash, role) VALUES (%s, %s, %s, %s)",
                (user.full_name, user.email, hashed_pwd, user.role)
            )
        except Exception:
            conn.rollback()
            cursor.execute(
                "INSERT INTO users (full_name, email, password_hash) VALUES (%s, %s, %s)",
                (user.full_name, user.email, hashed_pwd)
            )

        conn.commit()
    finally:
        cursor.close()
        conn.close()
    
    return {"message": "Compte créé avec succès !"}


@app.post("/login")
def login(credentials: UserLogin):
    conn = database.get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT * FROM users WHERE email = %s", (credentials.email,))
        user = cursor.fetchone()
    finally:
        cursor.close()
        conn.close()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Identifiants incorrects."
        )

    if isinstance(user, dict):
        pwd_hash = user["password_hash"]
        user_id = user["id"]
        user_email = user["email"]
        user_name = user["full_name"]
        user_role = user.get("role", "student")
    else:
        user_id, user_name, user_email, pwd_hash = user[0], user[1], user[2], user[3]
        user_role = user[4] if len(user) > 4 else "student"
    
    if not verify_password(credentials.password, pwd_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Identifiants incorrects."
        )
    
    access_token = create_access_token(data={"sub": user_email, "user_id": user_id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "full_name": user_name,
            "email": user_email,
            "role": user_role
        }
    }


@app.get("/api/admin/stats", response_model=DashboardStats)
def get_admin_stats():
    total_users_count = 0
    total_courses_count = 0
    
    try:
        conn = database.get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT COUNT(*) FROM users")
            res = cursor.fetchone()
            total_users_count = res["COUNT(*)"] if isinstance(res, dict) else res[0]

            cursor.execute("SELECT COUNT(*) FROM courses")
            res_c = cursor.fetchone()
            total_courses_count = res_c["COUNT(*)"] if isinstance(res_c, dict) else res_c[0]
        except Exception as db_err:
            print(f"Notice BDD Stats: {db_err}")
            total_users_count = 0
            total_courses_count = 0
        finally:
            cursor.close()
            conn.close()
    except Exception:
        total_users_count = 0
        total_courses_count = 0

    return {
        "total_users": total_users_count,
        "total_courses": total_courses_count
    }


# ==========================================
# --- MODULE GESTION DU STOCK (ADMIN) ---
# ==========================================

@app.get("/api/admin/stock")
def get_stock_items():
    conn = database.get_db_connection()
    try:
        cursor = conn.cursor(dictionary=True)
    except TypeError:
        cursor = conn.cursor()
        
    try:
        cursor.execute("SELECT * FROM stock_items ORDER BY id DESC")
        rows = cursor.fetchall()
        
        items = []
        for r in rows:
            if isinstance(r, dict):
                items.append(r)
            else:
                items.append({
                    "id": r[0],
                    "item_name": r[1],
                    "category": r[2],
                    "quantity": r[3],
                    "unit_price": r[4],
                    "min_threshold": r[5]
                })
        return items
    except Exception as e:
        print(f"Erreur récupération stock : {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@app.post("/api/admin/stock")
def add_stock_item(item: StockItemCreate):
    conn = database.get_db_connection()
    cursor = conn.cursor()
    try:
        query = """
            INSERT INTO stock_items (item_name, category, quantity, unit_price, min_threshold)
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(query, (item.item_name, item.category, item.quantity, item.unit_price, item.min_threshold))
        conn.commit()
        return {"message": "Article ajouté avec succès"}
    except Exception as e:
        conn.rollback()
        print(f"Erreur ajout stock : {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@app.put("/api/admin/stock/{item_id}/quantity")
def update_stock_quantity(item_id: int, quantity: int):
    conn = database.get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE stock_items SET quantity = %s WHERE id = %s", (quantity, item_id))
        conn.commit()
        return {"message": "Quantité mise à jour"}
    except Exception as e:
        conn.rollback()
        print(f"Erreur mise à jour quantité stock : {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@app.delete("/api/admin/stock/{item_id}")
def delete_stock_item(item_id: int):
    conn = database.get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM stock_items WHERE id = %s", (item_id,))
        conn.commit()
        return {"message": "Article supprimé"}
    except Exception as e:
        conn.rollback()
        print(f"Erreur suppression stock : {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@app.get("/api/admin/dashboard-stats")
def get_dashboard_stats():
    conn = database.get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT COUNT(*) FROM users")
        res_users = cursor.fetchone()
        total_users = res_users["COUNT(*)"] if isinstance(res_users, dict) else (res_users[0] if res_users else 0)

        cursor.execute("SELECT COUNT(*) FROM courses")
        res_courses = cursor.fetchone()
        total_courses = res_courses["COUNT(*)"] if isinstance(res_courses, dict) else (res_courses[0] if res_courses else 0)

        cursor.execute("SELECT COUNT(*) FROM lessons")
        res_lessons = cursor.fetchone()
        total_videos = res_lessons["COUNT(*)"] if isinstance(res_lessons, dict) else (res_lessons[0] if res_lessons else 0)

        cursor.execute("SELECT SUM(price) FROM sales")
        res_earnings = cursor.fetchone()
        val_earnings = res_earnings["SUM(price)"] if isinstance(res_earnings, dict) else (res_earnings[0] if res_earnings else 0)
        total_earnings = float(val_earnings) if val_earnings else 0.0

        sales = []
        try:
            cursor.execute("SELECT id, item_title, price, payment_method, created_at FROM sales ORDER BY id DESC LIMIT 5")
            sales = cursor.fetchall()
        except Exception:
            sales = []

        return {
            "total_users": total_users,
            "total_courses": total_courses,
            "total_videos": total_videos,
            "total_earnings": total_earnings,
            "recent_sales": sales
        }
    except Exception as e:
        print(f"Erreur stats dashboard : {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

        
@app.get("/api/admin/users")
def get_all_users():
    conn = database.get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, full_name, email, role FROM users ORDER BY id DESC")
        users = cursor.fetchall()
        return users
    except Exception as e:
        print(f"Erreur récupération utilisateurs : {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération des utilisateurs."
        )
    finally:
        cursor.close()
        conn.close()


@app.put("/api/admin/users/{user_id}/role")
def update_user_role(user_id: int, data: RoleUpdate):
    conn = database.get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Utilisateur non trouvé."
            )

        cursor.execute("UPDATE users SET role = %s WHERE id = %s", (data.role, user_id))
        conn.commit()

        return {
            "message": "Rôle mis à jour avec succès !",
            "user_id": user_id,
            "new_role": data.role
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        conn.rollback()
        print(f"Erreur mise à jour rôle : {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la modification du rôle."
        )
    finally:
        cursor.close()
        conn.close()


@app.put("/api/admin/profile")
def update_admin_profile(data: AdminProfileUpdate):
    conn = database.get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM users WHERE role = 'admin' OR role = 'super_admin' LIMIT 1")
        admin = cursor.fetchone()
        
        if not admin:
            raise HTTPException(status_code=404, detail="Administrateur non trouvé.")

        if isinstance(admin, dict):
            stored_pwd_hash = admin["password_hash"]
        else:
            stored_pwd_hash = admin[3]

        if data.new_password and data.new_password.strip():
            if not data.current_password or not verify_password(data.current_password, stored_pwd_hash):
                raise HTTPException(status_code=400, detail="L'ancien mot de passe est incorrect.")
            
            hashed_pwd = hash_password(data.new_password)
            cursor.execute(
                "UPDATE users SET full_name = %s, email = %s, password_hash = %s WHERE role = 'admin' OR role = 'super_admin' LIMIT 1",
                (data.full_name, data.email, hashed_pwd)
            )
        else:
            cursor.execute(
                "UPDATE users SET full_name = %s, email = %s WHERE role = 'admin' OR role = 'super_admin' LIMIT 1",
                (data.full_name, data.email)
            )
        
        conn.commit()
        return {
            "message": "Profil mis à jour avec succès !",
            "user": {"full_name": data.full_name, "email": data.email}
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@app.delete("/api/admin/users/{user_id}")
def delete_user(user_id: int):
    conn = database.get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Utilisateur non trouvé."
            )
        return {"message": f"Utilisateur {user_id} supprimé avec succès !"}
    except HTTPException as he:
        raise he
    except Exception as e:
        conn.rollback()
        print(f"Erreur suppression utilisateur : {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la suppression."
        )
    finally:
        cursor.close()
        conn.close()


# ==========================================
# --- MODULE GESTION DES COURS (ADMIN) ---
# ==========================================

@app.get("/api/admin/courses")
def get_all_courses():
    conn = database.get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, title, category, description, duration, lessons, base_price, cover_image, instructor, selling_type FROM courses ORDER BY id DESC")
        courses = cursor.fetchall()
        
        formatted_courses = []
        for c in courses:
            if isinstance(c, dict):
                formatted_courses.append(c)
            else:
                formatted_courses.append({
                    "id": c[0],
                    "title": c[1],
                    "category": c[2],
                    "description": c[3],
                    "duration": c[4],
                    "lessons": c[5],
                    "base_price": c[6],
                    "cover_image": c[7],
                    "instructor": c[8],
                    "selling_type": c[9]
                })
        return formatted_courses
    except Exception as e:
        print(f"Notice BDD Courses (fallback demo): {e}")
        return []
    finally:
        cursor.close()
        conn.close()


@app.post("/api/admin/courses", status_code=status.HTTP_201_CREATED)
async def create_course(
    title: str = Form(...),
    description: str = Form(default=""),
    category: str = Form(...),
    sub_category: str = Form(default=""),
    selling_type: str = Form(default="Disponible en enregistré"),
    instructor: str = Form(default="Ben Jeddou Technologies"),
    base_price: float = Form(default=0),
    discount_percent: int = Form(default=0),
    cover_image: Optional[UploadFile] = File(default=None),
    videos: List[UploadFile] = File(default=[])
):
    conn = database.get_db_connection()
    cursor = conn.cursor()
    try:
        lessons_count = len(videos)
        duration_str = f"{lessons_count * 20} min" if lessons_count > 0 else "2h 00m"

        cover_image_url = None
        if cover_image and cover_image.filename:
            image_dir = "uploads/images"
            os.makedirs(image_dir, exist_ok=True)
            image_path = os.path.join(image_dir, cover_image.filename)
            with open(image_path, "wb") as buffer:
                shutil.copyfileobj(cover_image.file, buffer)
            cover_image_url = f"/{image_path.replace(os.sep, '/')}"

        cursor.execute(
            """
            INSERT INTO courses (title, description, category, sub_category, selling_type, instructor, base_price, discount_percent, cover_image, duration, lessons) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (title, description, category, sub_category, selling_type, instructor, base_price, discount_percent, cover_image_url, duration_str, lessons_count)
        )
        conn.commit()
        new_course_id = cursor.lastrowid

        saved_lessons = []
        for index, video in enumerate(videos):
            video_dir = "uploads/videos"
            os.makedirs(video_dir, exist_ok=True)
            video_path = os.path.join(video_dir, video.filename)
            
            with open(video_path, "wb") as buffer:
                shutil.copyfileobj(video.file, buffer)
            
            video_url = f"/{video_path.replace(os.sep, '/')}"
            lesson_title = video.filename

            cursor.execute(
                """
                INSERT INTO lessons (course_id, title, duration, video_url) 
                VALUES (%s, %s, %s, %s)
                """,
                (new_course_id, lesson_title, "20 min", video_url)
            )
            conn.commit()
            
            saved_lessons.append({
                "id": cursor.lastrowid,
                "title": lesson_title,
                "duration": "20 min",
                "video_url": video_url
            })

        return {
            "message": "Cours créé avec succès !",
            "course": {
                "id": new_course_id,
                "title": title,
                "category": category,
                "duration": duration_str,
                "lessons": lessons_count,
                "description": description,
                "base_price": base_price,
                "cover_image": cover_image_url,
                "instructor": instructor,
                "selling_type": selling_type,
                "lessons_list": saved_lessons
            }
        }
    except Exception as e:
        conn.rollback()
        print(f"Erreur création cours : {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Impossible de créer le cours : {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()


@app.put("/api/admin/courses/{course_id}")
async def update_course(
    course_id: int,
    title: str = Form(...),
    description: str = Form(default=""),
    category: str = Form(...),
    sub_category: str = Form(default=""),
    selling_type: str = Form(default="Disponible en enregistré"),
    instructor: str = Form(default="Ben Jeddou Technologies"),
    base_price: float = Form(default=0),
    discount_percent: int = Form(default=0),
    cover_image: Optional[UploadFile] = File(default=None)
):
    conn = database.get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, cover_image FROM courses WHERE id = %s", (course_id,))
        course_db = cursor.fetchone()
        if not course_db:
            raise HTTPException(status_code=404, detail="Cours non trouvé.")

        old_cover = course_db["cover_image"] if isinstance(course_db, dict) else course_db[1]
        image_url = old_cover

        if cover_image and cover_image.filename:
            image_dir = "uploads/images"
            os.makedirs(image_dir, exist_ok=True)
            image_path = os.path.join(image_dir, cover_image.filename)
            with open(image_path, "wb") as buffer:
                shutil.copyfileobj(cover_image.file, buffer)
            image_url = f"/{image_path.replace(os.sep, '/')}"

        cursor.execute(
            """
            UPDATE courses 
            SET title = %s, description = %s, category = %s, sub_category = %s, 
                selling_type = %s, instructor = %s, base_price = %s, 
                discount_percent = %s, cover_image = %s
            WHERE id = %s
            """,
            (title, description, category, sub_category, selling_type, instructor, base_price, discount_percent, image_url, course_id)
        )
        conn.commit()

        return {
            "message": "Cours mis à jour avec succès !",
            "course": {
                "id": course_id,
                "title": title,
                "description": description,
                "category": category,
                "sub_category": sub_category,
                "selling_type": selling_type,
                "instructor": instructor,
                "base_price": base_price,
                "discount_percent": discount_percent,
                "cover_image": image_url
            }
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        conn.rollback()
        print(f"Erreur modification cours : {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@app.delete("/api/admin/courses/{course_id}")
def delete_course(course_id: int):
    conn = database.get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM courses WHERE id = %s", (course_id,))
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cours non trouvé."
            )
        return {"message": f"Cours {course_id} supprimé avec succès !"}
    except HTTPException as he:
        raise he
    except Exception as e:
        conn.rollback()
        print(f"Erreur suppression cours : {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la suppression du cours."
        )
    finally:
        cursor.close()
        conn.close()


# ==========================================
# --- MODULE GESTION DES LEÇONS ---
# ==========================================

@app.get("/api/admin/courses/{course_id}/lessons")
def get_course_lessons(course_id: int):
    conn = database.get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, title, duration, video_url FROM lessons WHERE course_id = %s", (course_id,))
        lessons = cursor.fetchall()
        
        formatted_lessons = []
        for l in lessons:
            if isinstance(l, dict):
                formatted_lessons.append(l)
            else:
                formatted_lessons.append({
                    "id": l[0],
                    "title": l[1],
                    "duration": l[2],
                    "video_url": l[3]
                })
        return formatted_lessons
    except Exception as e:
        print(f"Erreur récupération leçons : {e}")
        return []
    finally:
        cursor.close()
        conn.close()


@app.post("/api/admin/courses/{course_id}/lessons", status_code=status.HTTP_201_CREATED)
async def add_lesson_to_course(
    course_id: int,
    title: Optional[str] = Form(default=None),
    duration: str = Form(default="20 min"),
    video: UploadFile = File(...)
):
    conn = database.get_db_connection()
    cursor = conn.cursor()
    try:
        video_dir = "uploads/videos"
        os.makedirs(video_dir, exist_ok=True)
        video_path = os.path.join(video_dir, video.filename)
        
        with open(video_path, "wb") as buffer:
            shutil.copyfileobj(video.file, buffer)
        
        video_url = f"/{video_path.replace(os.sep, '/')}"
        lesson_title = title if title and title.strip() else video.filename

        cursor.execute(
            """
            INSERT INTO lessons (course_id, title, duration, video_url) 
            VALUES (%s, %s, %s, %s)
            """,
            (course_id, lesson_title, duration, video_url)
        )
        
        cursor.execute(
            "UPDATE courses SET lessons = lessons + 1 WHERE id = %s",
            (course_id,)
        )
        conn.commit()
        
        new_lesson_id = cursor.lastrowid
        return {
            "message": "Leçon ajoutée avec succès !",
            "lesson": {
                "id": new_lesson_id,
                "title": lesson_title,
                "duration": duration,
                "video_url": video_url
            }
        }
    except Exception as e:
        conn.rollback()
        print(f"Erreur ajout leçon : {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@app.delete("/api/admin/lessons/{lesson_id}")
def delete_lesson(lesson_id: int):
    conn = database.get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, course_id, video_url FROM lessons WHERE id = %s", (lesson_id,))
        lesson = cursor.fetchone()
        
        if not lesson:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Leçon non trouvée."
            )

        if isinstance(lesson, dict):
            c_id = lesson["course_id"]
            v_url = lesson["video_url"]
        else:
            c_id, v_url = lesson[1], lesson[3]

        if v_url:
            file_path = v_url.lstrip("/")
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except Exception as file_err:
                    print(f"Erreur suppression fichier physique : {file_err}")

        cursor.execute("DELETE FROM lessons WHERE id = %s", (lesson_id,))
        cursor.execute(
            "UPDATE courses SET lessons = GREATEST(lessons - 1, 0) WHERE id = %s",
            (c_id,)
        )
        conn.commit()
        return {"message": "Leçon supprimée avec succès !"}
    except HTTPException as he:
        raise he
    except Exception as e:
        conn.rollback()
        print(f"Erreur suppression leçon : {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la suppression de la leçon."
        )
    finally:
        cursor.close()
        conn.close()