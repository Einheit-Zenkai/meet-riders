# Meet-Riders

## About

Meet-Riders is a mobile application (currently) designed exclusively for university students, transforming the daily commute into a social and collaborative experience. More than just a carpooling app, Meet-Riders is a travel-sharing platform that allows students to connect with peers heading in the same direction, regardless of their mode of transport. Whether you're driving, taking the bus, riding your bike, or even walking, you can create or join a "party" to travel together.

The core idea is to create a trusted community where students can easily find and vet fellow travelers, making their journeys to and from campus, or anywhere else, safer, more enjoyable, and more economical. By leveraging the power of community, Meet-Riders aims to reduce traffic congestion, promote eco-friendly travel options, save money and foster new friendships within the university ecosystem.

## Features

Meet-Riders is packed with features designed to provide a seamless and secure travel-sharing experience for students:

### Core Functionality

*   **Create & Discover Parties:**
    *   **Post a Trip:** As a host, you can create a "party" detailing your destination, preferred mode of transport (car, bus, bike, walking, etc.), and the ideal number of companions.
    *   **Find a Trip:** Browse a real-time map or a list of active parties to find one that matches your destination and travel preferences.
    *   **Request to Join:** See a party you like? Simply send a request to the host to join their travel group.

*   **Flexible Travel Options:**
    *   **Not Just for Cars:** Unlike traditional carpooling apps, Meet-Riders supports a variety of transportation methods, making it inclusive for all students.

### User Profiles & Verification

*   **Student-Verified Community:** To ensure a safe and trusted environment, users are required to sign up and verify their accounts using their official university email address (.edu).
*   **Detailed Profiles:** Get to know your fellow riders through profiles that include their name, major, and a short bio of them.

### Group & Communication

*   **(Planned) In-App Chat:** Communicate with your party members through a dedicated in-app group chat to coordinate meet-up points, and timing, and share any last-minute updates without sharing personal contact information.
*   **Party Management:** The party host has control over accepting or declining requests to join, ensuring they feel comfortable with their travel companions.

### Cost Sharing & Payments

*   **Automated Cost Splitting:** For carpooling parties, the app can automatically calculate and split the cost of gas and tolls among the passengers, eliminating awkward conversations about money.

## Getting Started
The app is still in development, but you can set up the dev server to see how it works.
The frontend is built with Next.js and the backend is built with Supabase.
You must run frontend and have a supabase backend with simmilar schema to test it out.

Make sure you have the following installed:
- [Git](https://git-scm.com/) (optional, for cloning the repo)
- [Node.js](https://nodejs.org/) (v18 or later)
- [pnpm](https://pnpm.io/) (v8 or later) 
- [Visual Studio Code](https://code.visualstudio.com/)

### Step 1: Clone or Download the Project
1. Open your terminal or command prompt.
2. Navigate to the directory where you want to clone the project. 
   For example:
   ```bash
   cd Desktop
   ```
3. Run the following command to clone the repository:
4. ```bash
    git clone https://github.com/Einheit-Zenkai/meet-riders.git
    ```
5. If you don't have Git installed, you can download the project as a ZIP file from the [GitHub repository](https://github.com/Einheit-Zenkai/meet-riders/archive/refs/heads/main.zip).

### Step 2: Open the Project in Visual Studio Code

1. Open **Visual Studio Code**.
2. Click **File > Open Folder**.
3. Select the folder where you cloned or extracted the project.
4. Click **Open**.

### Step 3: Install Project Dependencies and Start the Project
 1. From the VS Code terminal, navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
 2. Install the project dependencies using:
    ```bash
    pnpm install
    ```
3. Start the frontend server:
    ```bash
    pnpm dev
    ```
