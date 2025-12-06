## How to Run the Web App

### Step 1: Download the Project

**Option A: Use Git (if installed)**
1. Open **Git Bash** or **Command Prompt**.
2. Run:
    ```bash
    cd Downloads
    git clone https://github.com/vercel/next.js.git
    ```

**OR IF YOU DONT HAVE GIT INSTALLED:**

**Option B: Download ZIP**
1. Go to the [GitHub repository](https://github.com/vercel/next.js) (or your project link).
2. Click the green **Code** button, then **Download ZIP**.
3. Find the ZIP file in your Downloads folder.
4. Right-click the ZIP file and choose **Extract All**. Pick a folder to unzip.

---

### Step 2: Open the Web App Folder in VS Code

1. Open **Visual Studio Code**.
2. Click **File > Open Folder**.
3. Select the **apps/web** folder inside the project directory you just unzipped or cloned.

---

### Step 3: Install Project Dependencies

In the VS Code terminal, run:
```bash
pnpm install
```

---

### Step 4: Start the App

In the VS Code terminal, run:
```bash
pnpm dev
```
If asked about firewall, click **Allow Access**.

---

### Step 5: View the App

Open your browser and go to:  
[http://localhost:3000](http://localhost:3000)

---

### Edit the App

Change files in `app/page.tsx` to update the page. Save changes and see them automatically.

---

### Learn More

- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Deployment](https://nextjs.org/docs/app/building-your-application/deploying)
- [Next.js GitHub](https://github.com/vercel/next.js)

---

### Common Issues

- **pnpm not found:** If you see an error about `pnpm` not being found, install it by running:
    ```bash
    npm install -g pnpm
    ```
    (Requires [Node.js](https://nodejs.org/) to be installed.)
- **Port in use:** Close other apps using port 3000.
- **Folder not found:** Double-check you opened the **apps/web** folder in VS Code.

