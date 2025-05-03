from flask import Flask, render_template, request, redirect, url_for, jsonify
import mysql.connector
from mysql.connector import Error
import random
import string

app = Flask(__name__, 
    static_url_path='',
    static_folder='static',
    template_folder='templates'
)

def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="register"
        )
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

def generate_route_id():
    number = ''.join(random.choices(string.digits, k=3))
    return f"RT{number}"

def generate_booking_id():
    number = ''.join(random.choices(string.digits, k=4))
    return f"BK{number}"

@app.route('/')
def login_page():
    return render_template('login.html')

@app.route('/home')
def home():
    return render_template('bus.html')

@app.route('/login', methods=['POST'])
def login():
    conn = get_db_connection()
    if conn is None:
        return "Database Connection Failed!", 500

    try:
        cursor = conn.cursor()
        user_data = {
            'username': request.form.get('username'),
            'email': request.form.get('email'),
            'phone': request.form.get('phone'),
            'alt_phone': request.form.get('altPhone'),
            'password': request.form.get('password')
        }

        if not all(value for key, value in user_data.items() if key != 'alt_phone'):
            return "All required fields must be filled!"

        sql = """
        INSERT INTO login (username, email, phone, alt_Phone, password)
        VALUES (%s, %s, %s, %s, %s)
        """
        values = tuple(user_data.values())
        cursor.execute(sql, values)
        conn.commit()
        print("✅ Data inserted successfully!")
        return redirect(url_for('home'))
    except Error as e:
        print(f"[❌ INSERT ERROR] {e}")
        return f"Database Error: {e}"
    finally:
        if 'cursor' in locals():
            cursor.close()
        conn.close()

@app.route('/submit_journey', methods=['POST'])
def submit_journey():
    conn = get_db_connection()
    if not conn:
        return "Database connection failed", 500

    try:
        cursor = conn.cursor()
        source = request.form['source']
        destination = request.form['destination']
        travel_date = request.form['travel_date']
        passengers = request.form['passengers']

        sql = "INSERT INTO journeys (source, destination, travel_date, passengers) VALUES (%s, %s, %s, %s)"
        val = (source, destination, travel_date, passengers)
        cursor.execute(sql, val)
        conn.commit()
        return redirect('/')
    except Error as e:
        print(f"Error: {e}")
        return f"Database Error: {e}", 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        conn.close()

@app.route('/api/routes', methods=['POST'])
def create_route():
    conn = get_db_connection()
    if not conn:
        return jsonify({"success": False, "message": "Database connection failed"}), 500

    try:
        cursor = conn.cursor()
        data = request.json
        route_id = generate_route_id()
        
        # Insert new route
        sql = """
        INSERT INTO routes (id, source, destination, distance, duration_hours, 
                          duration_minutes, num_buses, min_fare, max_fare, status, description)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            route_id,
            data['source'],
            data['destination'],
            data['distance'],
            data['duration_hours'],
            data['duration_minutes'],
            data.get('num_buses', 0),
            data['min_fare'],
            data['max_fare'],
            data['status'],
            data.get('description', '')
        )
        
        cursor.execute(sql, values)
        conn.commit()
        
        return jsonify({
            "success": True,
            "message": "Route created successfully",
            "route_id": route_id
        }), 201
        
    except Error as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        conn.close()

@app.route('/api/routes', methods=['GET'])
def get_routes():
    conn = get_db_connection()
    if not conn:
        return jsonify({"success": False, "message": "Database connection failed"}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM routes WHERE status = 'active' ORDER BY source, destination")
        routes = cursor.fetchall()
        
        return jsonify({
            "success": True,
            "routes": routes
        })
        
    except Error as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        conn.close()

@app.route('/api/bookings', methods=['POST'])
def create_booking():
    conn = get_db_connection()
    if not conn:
        return jsonify({"success": False, "message": "Database connection failed"}), 500

    try:
        cursor = conn.cursor()
        data = request.json
        booking_id = generate_booking_id()
        
        # Calculate total fare based on route's fare and number of passengers
        cursor.execute("SELECT min_fare, max_fare FROM routes WHERE id = %s", (data['route_id'],))
        route_fare = cursor.fetchone()
        if not route_fare:
            return jsonify({"success": False, "message": "Invalid route"}), 400
            
        total_fare = route_fare[0] * data['num_passengers']  # Using min_fare for simplicity
        
        # Insert new booking
        sql = """
        INSERT INTO bookings (id, route_id, passenger_name, passenger_email, 
                            passenger_phone, travel_date, num_passengers, 
                            total_fare, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            booking_id,
            data['route_id'],
            data['passenger_name'],
            data['passenger_email'],
            data['passenger_phone'],
            data['travel_date'],
            data['num_passengers'],
            total_fare,
            'pending'
        )
        
        cursor.execute(sql, values)
        conn.commit()
        
        return jsonify({
            "success": True,
            "message": "Booking created successfully",
            "booking_id": booking_id,
            "total_fare": total_fare
        }), 201
        
    except Error as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        conn.close()

if __name__ == "__main__":
    app.run(debug=True)
