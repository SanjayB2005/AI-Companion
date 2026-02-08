# Emotion Companion - Mobile App

React Native mobile application for the Emotion-Aware AI Companion.

## Features

- ✅ Modern, glassmorphism UI design
- ✅ Smooth animations and transitions
- ✅ User authentication (Login/Signup)
- ✅ JWT token management
- ✅ Dark theme with purple/violet accents
- ✅ Responsive design
- ⏳ Emotion detection (Phase 2)

## Tech Stack

- **React Native 0.73** - Mobile framework
- **React Navigation** - Navigation
- **Axios** - HTTP client
- **AsyncStorage** - Local storage
- **React Native Linear Gradient** - Gradient effects
- **React Native Vector Icons** - Icons

## Prerequisites

- Node.js 18+
- npm or yarn
- React Native development environment
- Android Studio (for Android)
- Xcode (for iOS - Mac only)

## Setup Instructions

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Install iOS Dependencies (Mac only)

```bash
cd ios
pod install
cd ..
```

### 3. Configure API URL

Update the API base URL in `.env`:

```env
# For Android Emulator
API_BASE_URL=http://10.0.2.2:8000/api

# For iOS Simulator
# API_BASE_URL=http://localhost:8000/api

# For Physical Device (use your computer's IP)
# API_BASE_URL=http://192.168.x.x:8000/api
```

You can also update the URL directly in [src/services/api.js](src/services/api.js)

### 4. Start Metro Bundler

```bash
npm start
```

### 5. Run on Android

```bash
# Make sure Android emulator is running or device is connected
npm run android
```

### 6. Run on iOS (Mac only)

```bash
# Make sure iOS simulator is available
npm run ios
```

## Project Structure

```
mobile/
├── src/
│   ├── screens/
│   │   ├── SplashScreen.js      # Animated splash screen
│   │   ├── LoginScreen.js       # Login UI
│   │   ├── SignupScreen.js      # Registration UI
│   │   └── HomeScreen.js        # Dashboard
│   ├── services/
│   │   └── api.js               # API service & auth
│   └── constants/
│       └── theme.js             # Colors, sizes, fonts
├── App.js                        # Root component
├── package.json
└── .env
```

## UI Design

### Color Palette

- **Primary**: #7C3AED (Vibrant Purple)
- **Accent**: #EC4899 (Pink)
- **Background**: #0F172A (Deep Navy)
- **Surface**: #1E293B (Slate)
- **Text**: #F8FAFC (Almost White)

### Design Features

- Glassmorphism effects
- Smooth gradient backgrounds
- Animated transitions
- Custom input fields with icons
- Modern card layouts
- Glow effects

## API Integration

The app connects to the Django backend at `http://localhost:8000/api`

### Available Endpoints

- `POST /auth/register/` - User registration
- `POST /auth/login/` - User login
- `GET /auth/profile/` - Get user profile
- `PUT /auth/profile/` - Update profile
- `POST /auth/logout/` - Logout

See [src/services/api.js](src/services/api.js) for implementation.

## Screens

### 1. Splash Screen
- Animated logo and loading indicator
- Auto-navigates to Login or Home

### 2. Login Screen
- Email and password inputs
- Remember me functionality
- Forgot password link
- Sign up navigation

### 3. Signup Screen
- Complete registration form
- Password strength validation
- Terms acceptance
- Account creation

### 4. Home Screen
- User greeting
- Emotion detection card (Phase 2)
- Quick emotion selection
- Feature cards
- Profile access

## Storage

The app uses AsyncStorage to persist:

- `userToken` - JWT access token
- `refreshToken` - JWT refresh token
- `userData` - User profile data

## Error Handling

- Network errors with retry option
- Form validation errors
- Auth token expiration handling
- User-friendly error messages

## Debugging

### Android

```bash
# View logs
npx react-native log-android

# Clear cache
npm start -- --reset-cache
```

### iOS

```bash
# View logs
npx react-native log-ios

# Clean build
cd ios && xcodebuild clean && cd ..
```

### Common Issues

#### Metro Bundler Won't Start
```bash
# Kill any running Metro instances
npx react-native start --reset-cache
```

#### Android Build Failed
```bash
cd android
./gradlew clean
cd ..
npm run android
```

#### Cannot Connect to API

1. Check backend is running: `http://localhost:8000/api/health/`
2. For Android emulator, use `10.0.2.2` instead of `localhost`
3. For physical device, use your computer's IP address
4. Ensure firewall allows connections

## Phase 2 Features (Coming Soon)

- [ ] Voice emotion detection UI
- [ ] Camera integration for face detection
- [ ] Real-time emotion analysis
- [ ] Conversation interface
- [ ] Emotion history
- [ ] Analytics dashboard
- [ ] Notifications
- [ ] Profile customization

## Development

### Adding New Screens

1. Create screen file in `src/screens/`
2. Import in `App.js`
3. Add to Stack Navigator

### Modifying Theme

Edit [src/constants/theme.js](src/constants/theme.js) to change:
- Colors
- Font sizes
- Spacing
- Shadows

### API Calls

Use the `authAPI` object from [src/services/api.js](src/services/api.js):

```javascript
import { authAPI } from '../services/api';

const response = await authAPI.login({ email, password });
```

## Build for Production

### Android

```bash
cd android
./gradlew assembleRelease
```

APK location: `android/app/build/outputs/apk/release/app-release.apk`

### iOS

1. Open `ios/EmotionCompanion.xcworkspace` in Xcode
2. Select "Product" > "Archive"
3. Follow App Store submission process

## Testing

```bash
npm test
```

## License

MIT License

## Support

For issues, check:
1. Backend server is running
2. API URL is correct
3. Device/emulator has network access
4. Check React Native logs for errors
