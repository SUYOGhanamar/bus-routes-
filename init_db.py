import mysql.connector
from mysql.connector import Error

def init_database():
    try:
        # Connect to MySQL server
        connection = mysql.connector.connect(
            host="localhost",
            user="root",
            password=""
        )
        
        if connection.is_connected():
            cursor = connection.cursor()
            
            # Create database if it doesn't exist
            cursor.execute("CREATE DATABASE IF NOT EXISTS register")
            cursor.execute("USE register")
            
            # Create routes table
            create_routes_table = """
            CREATE TABLE IF NOT EXISTS routes (
                id VARCHAR(10) PRIMARY KEY,
                source VARCHAR(100) NOT NULL,
                destination VARCHAR(100) NOT NULL,
                distance INT NOT NULL,
                duration_hours INT NOT NULL,
                duration_minutes INT NOT NULL,
                num_buses INT DEFAULT 0,
                min_fare DECIMAL(10,2) NOT NULL,
                max_fare DECIMAL(10,2) NOT NULL,
                status VARCHAR(20) NOT NULL,
                description TEXT
            )
            """
            cursor.execute(create_routes_table)

            # Create bookings table
            create_bookings_table = """
            CREATE TABLE IF NOT EXISTS bookings (
                id VARCHAR(10) PRIMARY KEY,
                route_id VARCHAR(10) NOT NULL,
                passenger_name VARCHAR(100) NOT NULL,
                passenger_email VARCHAR(100) NOT NULL,
                passenger_phone VARCHAR(20) NOT NULL,
                travel_date DATE NOT NULL,
                num_passengers INT NOT NULL,
                total_fare DECIMAL(10,2) NOT NULL,
                status VARCHAR(20) DEFAULT 'pending',
                booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (route_id) REFERENCES routes(id)
            )
            """
            cursor.execute(create_bookings_table)
            
            print("✅ Database and tables created successfully!")
            
    except Error as e:
        print(f"❌ Error: {e}")
    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()
            print("MySQL connection closed.")

if __name__ == "__main__":
    init_database()