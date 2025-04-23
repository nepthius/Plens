### Plens

### Overview

Plens is a web application designed to help users analyze the ingredients of skincare products. It scrapes product information, assesses potential ingredient risks based on predefined criteria, and stores these results. Users can search for products, view their risk analysis, save products to their profile, and find potentially safer alternatives.

The project consists of:

*   **Frontend:** A Next.js/React application providing the user interface.
*   **Backend:** A Node.js/Express API server handling user authentication, data requests, and interaction with the database and scraper.
*   **Scraper:** Python `scraper.py` responsible for fetching and analyzing product ingredient information, while `risk_ingredients.py` is responsible for holding all at risk ingredients to compare against.
*   **Database:** MongoDB is used to store user data and scraped product results.

### Prerequisites

*   Node.js (v18 or later)
*   npm (for frontend dependencies and backend server)
*   Python 3.x
*   MongoDB

### Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret_key>


### Installation

1.  **Backend:**
    ```bash
    cd backend
    npm install 
    ```
2.  **Frontend:**
    ```bash
    cd ./frontend
    npm install --legacy-peer-deps
    ```
3.  **Scraper:** (Ensure Python 3 is installed. Dependencies might be needed, check `scraper/` scripts if issues arise - `requests`, `beautifulsoup4` are common for scraping).

### Running the Application

1.  **Start the Backend Server:**
    ```bash
    cd ./backend
    node ./server.js
    ```
    The backend will typically run on `http://localhost:3001`.

2.  **Start the Frontend Development Server:**
    ```bash
    cd ./frontend
    npm run dev
    ```
    The frontend will typically be available at `http://localhost:3000`.

## Coding Standards

To ensure consistency and maintainability across the codebase, our team adopts widely recognized, published coding standards for the languages utilized in this project.

*   **Python (`scraper/`):** We adhere to the **PEP 8 – Style Guide for Python Code**. This standard dictates conventions such as 4-space indentation, snake_case for functions and variables, PascalCase for classes, line length limitations, import ordering, and documentation string formats.
*   **JavaScript/TypeScript (Frontend & Backend):** We follow the **Airbnb JavaScript Style Guide**, including its specific rules for React. This guide enforces conventions like 2-space indentation, the use of single quotes for strings (except in JSX), semicolon usage, camelCase for variables and functions, PascalCase for components, and specific rules for JSX formatting and structure.

By committing to these established standards, we promote code readability, reduce errors, and facilitate collaboration. Adherence can be verified by consulting the official documentation for PEP 8 and the Airbnb JavaScript Style Guide.
