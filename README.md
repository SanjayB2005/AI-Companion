# Emotion-Aware AI Companion 🤖💙

An intelligent AI companion that detects emotions through voice and facial expressions to provide empathetic, context-aware responses.

## 🌟 Features (Phase 1 - Current)
- ✨ Beautiful and clean UI interface
- 🔐 Secure user authentication (Login/Signup)
- 🎨 Modern loading animations
- 📱 Cross-platform mobile app (iOS & Android)
- 💾 PostgreSQL database for user management

## 🚀 Tech Stack

### Frontend
- **React Native** - Cross-platform mobile development
- **React Navigation** - Navigation library
- **Axios** - HTTP client
- **AsyncStorage** - Local storage

### Backend
- **Django** - Python web framework
- **Django REST Framework** - RESTful API toolkit
- **PostgreSQL** - Relational database
- **JWT** - Authentication tokens (djangorestframework-simplejwt)
- **CORS Headers** - Cross-origin resource sharing

### Future Integration
- Python ML models for emotion detection (voice & face) - Easy integration with Django backend

## 📁 Project Structure

```
Emotion-Aware AI Companion/
├── mobile/                    # React Native app
│   ├── src/
│   │   ├── screens/          # UI screens (Login, Signup, Home, etc.)
│   │   ├── components/       # Reusable components
│   │   ├── navigation/       # Navigation configuration
│   │   ├── services/         # API service calls
│   │   ├── utils/            # Helper functions
│   │   └── assets/           # Images, fonts, etc.
│   ├── App.js
│   └── package.json
│
├── backend/                   # Django server
│   ├── emotion_companion/    # Django project
│   │   ├── settings.py       # Project settings
│   │   ├── urls.py           # URL configuration
│   │   └── wsgi.py           # WSGI config
│   ├── users/                # Users app
│   │   ├── models.py         # User models
│   │   ├── serializers.py    # API serializers
│   │   ├── views.py          # API views
│   │   └── urls.py           # App URLs
│   ├── manage.py             # Django management script
│   └── requirements.txt      # Python dependencies
│
└── database/                  # Database files
    ├── schema.sql            # Database schema
    └── migrations/           # Database migrations
```

## 🛠️ Setup Instructions
Python (v3.10 or higher)
- pip and virtualenv
- Node.js (v18 or higher) - for React Native
### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (v14 or higher)
- React Native development environment
- Android Studio / Xcode (for emulators)

### Database Setup

1. Install PostgreSQL and create a database:
```sql
CREATE DATABASE emotion_companion;
```

2. Run the schema file:
```bash
psql -U postgres -d emotion_companion -f database/schema.sql
```

### Backend Setup

1. Navigate to backend directory:
```Create and activate virtual environment:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file:
```env
SECRET_KEY=your_django_secret_key_here
DEBUG=True
DATABASE_NAME=emotion_companion
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_HOST=localhost
DATABASE_PORT=5432
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:8081,http://10.0.2.2:8000
```

5. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

6. Create superuser (optional):
```bash
python manage.py createsuperuser
```
8
7. Start the server:
```bash
python manage.py runserver
```

The server will run on `http://localhost:8
npm start
```

The server will run on `http://localhost:3000`

### Mobile App Setup

1. Navigate to mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Install iOS dependencies (Mac only):
```bash
cd ios && pod install && cd ..
```

4. Create `.env` file:
```env
API_BASE_URL=http://localhost:3000/api
```

5. Start Metro bundler:
```bash
npm start
```

6. Run on Android:
```bash
npm run android
```

7. Run on iOS (Mac only):
```bash
npm run ios
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)
- `PUT /api/auth/profile` - Update user profile (requires auth)

### Health Check
- `GET /api/health` - Server health check

## 🎨 UI Design

The app features a modern, clean interface with:
- Smooth animations and transitions
- Gradient backgrounds
- Custom loading indicators
- Responsive design
- Intuitive navigation

## 🔮 Future Enhancements (Phase 2)

- [ ] Voice emotion detection integration
- [ ] Face emotion detection integration
- [ ] Real-time emotion analysis
- [ ] Personalized AI responses
- [ ] Conversation history
- [ ] Emotion analytics dashboard
- [ ] Multi-language support

## 👥 Team Roles

- **ML Team**: Voice and face emotion detection models
- **Full-stack Development**: Mobile app, backend API, database integration

## 📝 License

MIT License

## 🤝 Contributing

This is a team project. For contributions, please coordinate with the team lead.

---

Built with ❤️ for emotional intelligence
