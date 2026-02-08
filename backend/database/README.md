# Database Configuration

This folder contains database setup scripts and schema for the Emotion Companion application.

## Files

- **schema.sql** - PostgreSQL database schema with tables for future ML integration
- **setup_db.py** - Python script to automate database creation
- **README.md** - This file

## Quick Setup

### Method 1: Automated Setup (Recommended)

1. Make sure PostgreSQL is installed and running
2. Update the `.env` file in the backend root with your database credentials
3. Run the setup script:

```bash
python database/setup_db.py
```

4. Run Django migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

### Method 2: Manual Setup

1. Create the database manually:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE emotion_companion;

# Exit psql
\q
```

2. Run Django migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

3. (Optional) Run schema.sql for future tables:

```bash
psql -U postgres -d emotion_companion -f database/schema.sql
```

## Database Schema

### Current Tables (Django Managed)

- **users** - User accounts and profiles (managed by Django ORM)

### Future Tables (For ML Integration)

- **emotion_sessions** - Tracks emotion detection sessions
- **conversations** - Stores conversation history
- **emotion_analytics** - Analytics for emotion patterns
- **user_preferences** - User settings and preferences

## Environment Variables

Required database environment variables in `.env`:

```env
DATABASE_NAME=emotion_companion
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_HOST=localhost
DATABASE_PORT=5432
```

## PostgreSQL Configuration

### Default Credentials
- **Username**: postgres
- **Password**: (set during PostgreSQL installation)
- **Host**: localhost
- **Port**: 5432

### Connection String Format
```
postgresql://user:password@host:port/database_name
```

## Troubleshooting

### Error: "database does not exist"
Run the setup script or create the database manually using psql.

### Error: "role does not exist"
Make sure your PostgreSQL user exists:
```sql
CREATE USER your_username WITH PASSWORD 'your_password';
ALTER USER your_username CREATEDB;
```

### Error: "permission denied"
Grant proper permissions:
```sql
GRANT ALL PRIVILEGES ON DATABASE emotion_companion TO your_username;
```

## Backup and Restore

### Backup
```bash
pg_dump -U postgres emotion_companion > backup.sql
```

### Restore
```bash
psql -U postgres emotion_companion < backup.sql
```

## Production Considerations

1. Use strong passwords
2. Limit database user permissions
3. Enable SSL connections
4. Regular backups
5. Monitor database performance
6. Use connection pooling (pgBouncer)

## Next Steps

After database setup:
1. Run migrations: `python manage.py migrate`
2. Create superuser: `python manage.py createsuperuser`
3. Start server: `python manage.py runserver`
