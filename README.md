# Plens - Microplastic Checker

Plens is a web application that helps users identify microplastics and potentially harmful ingredients in personal care products. The application features user authentication, product search history, and real-time ingredient analysis.

## Project Structure

```
plens/
├── frontend/           # Next.js frontend application
├── backend/           # Express.js backend server
├── scraper/           # Python web scraper for product ingredients
└── README.md
```

## Features

- **Product Search**: Search for personal care products and analyze their ingredients
- **Risk Analysis**: Categorize ingredients into high and medium risk levels
- **User Authentication**: Register, login, and manage user profiles
- **Search History**: Track and view previous product searches
- **Responsive Design**: Modern, mobile-friendly interface

## Tech Stack

- **Frontend**:
  - Next.js 14 (React)
  - TypeScript
  - Axios for API calls
  - Context API for state management

- **Backend**:
  - Express.js
  - MongoDB with Mongoose
  - JWT for authentication
  - bcrypt for password hashing

- **Scraper**:
  - Python
  - BeautifulSoup4 for web scraping

## Prerequisites

- Node.js (v16 or higher)
- Python 3.x
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/plens.git
   cd plens
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

4. Install Python dependencies:
   ```bash
   cd ../scraper
   pip install beautifulsoup4 requests
   ```

5. Set up environment variables:
   Create a `.env` file in the backend directory:
   ```
   MONGO_URI=mongodbconnection_string
   JWT_SECRET=jwt_secret
   ```

## Running the Application

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```
   The server will run on http://localhost:3000

2. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on http://localhost:3001
