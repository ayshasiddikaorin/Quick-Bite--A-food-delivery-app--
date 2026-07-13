# Quick Bite

Quick Bite is a modern food delivery application designed to provide a smooth and engaging mobile experience for users to discover food, explore offers, manage cart items, and view their account details.

The current repository contains the frontend mobile application built with React Native and Expo. The project is structured to scale into a full-stack solution with a Node.js backend, MongoDB database, Firebase services, and other modern cloud technologies.

## ✨ Features

- Beautiful food discovery experience
- Home screen with featured meals, banners, and offers
- Category and recommendation browsing
- Cart and checkout flow
- Wallet, profile, and account management
- Responsive and modern UI design
- Built with TypeScript for better maintainability

## 🧰 Tech Stack

### Frontend

- React Native
- Expo
- TypeScript
- React Navigation
- Expo Vector Icons
- React Native Safe Area Context

### Backend (Planned / Upcoming)

- Node.js
- Express or Fastify
- MongoDB + Mongoose
- Firebase Authentication
- Firebase Cloud Messaging
- JWT Authentication
- REST APIs

## 🏗️ Architecture

The application is being designed around a modern full-stack architecture:

- Mobile frontend communicates with a Node.js backend API
- MongoDB stores user, restaurant, menu, order, and cart data
- Firebase handles authentication, real-time features, and notifications
- TypeScript ensures type safety across the app

## 📁 Project Structure

```bash
src/
  components/
  constants/
  data/
  navigation/
  screens/
```

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js 18 or higher
- npm or yarn
- Expo CLI

### Install dependencies

```bash
npm install
```

### Start the app

```bash
npm start
```

You can then run the app on:

- Android: `npm run android`
- iOS: `npm run ios`
- Web: `npm run web`

## 🔧 Environment Variables

For the full-stack version, the following environment variables will be used:

```env
EXPO_PUBLIC_API_URL=your_backend_api_url
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
```

## 📦 Roadmap

- Complete authentication flow
- Add restaurant and menu APIs
- Implement real-time order tracking
- Add payment integration
- Connect Firebase notifications
- Build admin dashboard
- Deploy frontend and backend to production

## 🤝 Contributing

Contributions are welcome. If you would like to improve the project:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

Built as a modern food delivery application project using React Native, Expo, and future-ready backend technologies.
