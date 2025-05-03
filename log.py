import sys
import io
from flask import Flask, render_template, request, redirect, url_for
import pymysql
from pymysql.err import MySQLError

# Fix Unicode printing on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

app = Flask(__name__)

# Function to create DB connection
def create_connection():
    try:
        connection = pymysql.connect(
            host='localhost',
            user='root',
            password='',  # for XAMPP default
            database='register',
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        print("✅ Database Connected Successfully")
        return connection
    except MySQLError as e:
        print(f"[❌ DB ERROR] {e}")
        return None

# Route for login page
@app.route('/')
def login_page():
    return render_template('login.html')

# Route to handle login form submission
@app.route('/login', methods=['POST'])
def login():
    conn = create_connection()
    if conn is None:
        return "Database Connection Failed!", 500

    cursor = conn.cursor()

    # Collect form data
    user_data = {
        'username': request.form.get('username'),
        'email': request.form.get('email'),
        'phone': request.form.get('phone'),
        'alt_phone': request.form.get('altPhone'),
        'password': request.form.get('password')
    }

    # Check if all required fields are filled
    if not all(value for key, value in user_data.items() if key != 'alt_phone'):
        return "All required fields must be filled!"

    try:
        sql = """
        INSERT INTO login (username, email, phone, alt_Phone, password)
        VALUES (%s, %s, %s, %s, %s)
        """
        values = tuple(user_data.values())
        cursor.execute(sql, values)
        conn.commit()
        print("✅ Data inserted successfully!")
    except MySQLError as e:
        print(f"[❌ INSERT ERROR] {e}")
        return f"Database Error: {e}"
    finally:
        cursor.close()
        conn.close()

    return redirect(url_for('home'))

# Route for the main page (bus.html)
@app.route('/home')
def home():
    return render_template('bus.html')

# Start the Flask app
if __name__ == '__main__':
    app.run(debug=True)
