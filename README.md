# Birdie

A concise social media application built with React Native (Expo) and the MERN stack. Allows users to post tweets, follow others, and interact in a real-time feed environment.

## Overview

* **Frontend:** React Native (Expo), React Navigation
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (Mongoose)
* **Storage:** Cloudinary (Image hosting)
* **Auth:** JWT (JSON Web Tokens)

## Setup & Configuration

### Prerequisites

* Node.js installed
* MongoDB Atlas account
* Cloudinary account

### Environment Variables

Create a `.env` file in the `server/` directory:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

```

### Installation

**1. Backend**

```bash
cd server
npm install
npm run dev

```

**2. Frontend**

```bash
cd client
npm install
npx expo start -c

```

## Features

* **Authentication:** Secure Signup and Login with JWT persistence.
* **Feed Algorithm:** Prioritizes followed users, sorted chronologically.
* **Media Support:** Post tweets with text and images (Base64 to Cloudinary).
* **Search:** Find users by partial username matching.
* **Profile System:** View user stats, tweet history, and Follow/Unfollow actions.
* **Interactions:** Like tweets and reply with comments.
* **State Management:** Context API for global user state and authentication.

## Implementation Details

### Tech Stack Choices

* **Base64 Image Upload:** Used for rapid implementation without complex multipart/form-data handling.
* **Context API:** Selected over Redux to keep the frontend lightweight and manageable.
* **Aggregation Pipelines:** Used MongoDB aggregations to efficiently sort feeds by "Following" status in a single query.

### Backend Structure (Key Endpoints)

**Auth Routes** (`/api/auth`)

* `POST /signup` - Register new user
* `POST /login` - Authenticate user
* `GET /search?q=` - Search profiles
* `POST /follow/:id` - Toggle follow status

**Tweet Routes** (`/api/tweets`)

* `GET /` - Fetch personalized feed
* `POST /` - Create tweet (supports image payload)
* `PATCH /:id/like` - Toggle like
* `POST /:id/comments` - Add reply

### Frontend Structure

* `screens/` - Individual page logic (Home, Profile, Search, Create Tweet).
* `components/` - Reusable UI (TweetCard, Input fields).
* `context/` - AuthContext for session management.
* `api/` - Axios instance with centralized configuration.

## Future Improvements

* **Real-time updates:** Implement Socket.io for instant notifications and feed updates.
* **Direct Messaging:** Private 1-on-1 chat functionality.
* **Video Support:** Allow video uploads in tweets.
* **Social Login:** Integration with Google/Apple auth.