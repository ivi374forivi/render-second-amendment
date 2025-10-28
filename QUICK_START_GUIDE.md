<!--
═══════════════════════════════════════════════════════════════════════════
AI HANDOFF DOCUMENT HEADER
═══════════════════════════════════════════════════════════════════════════

DOCUMENT: Quick Start Guide for Non-Technical Users
VERSION: 1.0.0
LAST_UPDATED: 2025-10-28
MAINTAINED_BY: RenderOSArms Community Team
CONTEXT: Simple, step-by-step guide for launching and using RenderOSArms
         for users with minimal technical experience

PURPOSE:
This guide helps anyone launch and use RenderOSArms, even if you've never
used command-line tools before. Everything is explained in simple terms
with screenshots and troubleshooting tips.

AI AGENT INSTRUCTIONS:
- Keep language simple and jargon-free
- Explain every technical term when first used
- Include troubleshooting for common issues
- Provide visual aids where possible
- Assume minimal technical knowledge
- Offer alternative methods when possible

DEPENDENCIES:
- Node.js installation
- Web browser
- Internet connection
- Text editor (optional)

HANDOFF_PROTOCOL:
1. Identify user's operating system
2. Guide through prerequisites
3. Walk through setup step-by-step
4. Verify successful launch
5. Provide next steps for usage

═══════════════════════════════════════════════════════════════════════════
-->

# 🚀 Quick Start Guide for RenderOSArms

**For People Who Aren't Tech-Savvy**

Don't worry if you're not technical! This guide will walk you through everything step-by-step, explaining things in plain English.

---

## 📋 What You'll Need

Before we start, you'll need:

1. **A computer** (Windows, Mac, or Linux)
2. **Internet connection**
3. **About 15-30 minutes**
4. **Ability to download and install software**

That's it! No programming knowledge needed.

---

## 🎯 Two Ways to Use RenderOSArms

### Option 1: Just Browse Models (Easiest)
**Time**: 2 minutes
**Skill Level**: Anyone
**Best for**: Just looking at models, no setup needed

### Option 2: Run Full App Locally (More Features)
**Time**: 15-30 minutes
**Skill Level**: Beginner (we'll guide you)
**Best for**: Testing features, contributing, development

---

## 🌐 Option 1: Browse Online (No Installation)

### Step 1: Open the Website

1. Open your web browser (Chrome, Firefox, Safari, or Edge)
2. Go to: **https://4-b100m.github.io/render-second-ammendment/**
3. Done! You can now browse models

### What You Can Do:
- ✅ Browse all models
- ✅ Search for specific models
- ✅ View model information
- ✅ See model images
- ❌ Cannot download models (GitHub login required)
- ❌ Cannot use AI assistant
- ❌ Cannot upload models

---

## 💻 Option 2: Run Locally (Full Features)

### Prerequisites

#### Step 1: Install Node.js

**What is Node.js?** It's free software that lets you run the RenderOSArms app on your computer.

**For Windows:**
1. Go to https://nodejs.org/
2. Click the big green button that says "LTS" (Long Term Support)
3. Download will start automatically
4. Double-click the downloaded file
5. Click "Next" through the installer (use default settings)
6. Wait for installation to complete
7. Click "Finish"

**For Mac:**
1. Go to https://nodejs.org/
2. Click the big green button that says "LTS"
3. Download will start automatically
4. Double-click the downloaded `.pkg` file
5. Follow the installation wizard
6. Enter your password when asked
7. Click "Install"

**For Linux:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# Fedora
sudo dnf install nodejs npm

# Arch Linux
sudo pacman -S nodejs npm
```

**Verify Installation:**
1. Open "Terminal" (Mac/Linux) or "Command Prompt" (Windows)
   - **Windows**: Press `Win + R`, type `cmd`, press Enter
   - **Mac**: Press `Cmd + Space`, type `Terminal`, press Enter
   - **Linux**: Press `Ctrl + Alt + T`

2. Type this and press Enter:
   ```
   node --version
   ```

3. You should see something like `v18.17.0` or similar
   - If you see an error, Node.js didn't install correctly - try again

---

### Step 2: Download RenderOSArms

**Method A: Download ZIP (Easier)**

1. Go to https://github.com/4-b100m/render-second-ammendment
2. Click the green "Code" button
3. Click "Download ZIP"
4. Wait for download to complete
5. Find the downloaded file (usually in Downloads folder)
6. Right-click the ZIP file
7. Choose "Extract All" (Windows) or "Unzip" (Mac/Linux)
8. Choose where to extract (Desktop is fine)
9. Wait for extraction to complete

**Method B: Using Git (More Advanced)**

If you have Git installed:
```bash
git clone https://github.com/4-b100m/render-second-ammendment.git
cd render-second-ammendment
```

---

### Step 3: Install Dependencies

**What are dependencies?** Think of them as puzzle pieces the app needs to work.

1. **Open Terminal/Command Prompt** (see Step 1 for how)

2. **Navigate to the folder**:
   - **Windows**:
     ```
     cd C:\Users\YourName\Desktop\render-second-ammendment
     ```
     (Replace `YourName` with your actual username)

   - **Mac**:
     ```
     cd ~/Desktop/render-second-ammendment
     ```

   - **Linux**:
     ```
     cd ~/Desktop/render-second-ammendment
     ```

3. **Install the pieces** (this will take 2-5 minutes):
   ```
   npm install
   ```

4. **What you'll see**:
   - Lots of text scrolling by (this is normal!)
   - Maybe some warnings (usually okay)
   - Eventually it will finish and return to the command prompt

5. **If you see errors**:
   - Make sure you're in the right folder
   - Make sure Node.js is installed (check with `node --version`)
   - Try running `npm install` again
   - Check your internet connection

---

### Step 4: Generate Model List

This creates a searchable list of all models:

```
npm run list
```

**What you'll see**: "Updating list..." and then it finishes

---

### Step 5: Start the App!

#### A) Just View Models (No Server)

1. **Open the folder** where you extracted RenderOSArms
2. **Go into the `docs` folder**
3. **Double-click `index.html`**
4. **Your browser will open** showing the model browser!

**What you can do:**
- Browse models
- Search models
- View 3D models (click "View 3D")
- Filter by tags

---

#### B) Run Full Server (Advanced Features)

**What's a server?** Think of it like turning your computer into a mini-website that only you can access.

1. **In your Terminal/Command Prompt**, type:
   ```
   npm run dev
   ```

2. **What you'll see**:
   ```
   ┌─────────────────────────────────────────┐
   │  RenderOSArms Server                    │
   │  Version: 2.0.0                         │
   │  Environment: development               │
   │  Port: 3000                             │
   │  URL: http://localhost:3000             │
   └─────────────────────────────────────────┘
   ```

3. **Open your browser** and go to:
   ```
   http://localhost:3000
   ```

4. **You should see** the RenderOSArms homepage!

**What you can do:**
- Everything from Option A, PLUS:
- Use AI assistant
- API access
- Upload models (with authentication)

---

### Step 6: Using the App

#### Browse Models

1. On the homepage, you'll see a search box
2. Type what you're looking for (e.g., "Glock", "AR-15")
3. Press Enter or click Search
4. Click on any model to see details

#### View 3D Models

1. Click "View 3D" on any model
2. **Controls**:
   - **Left mouse**: Rotate the model
   - **Right mouse**: Pan (move around)
   - **Scroll wheel**: Zoom in/out
   - **Spacebar**: Assembly/disassembly animation

#### Adjust 3D Viewer

Use the controls on the right side:
- **Assembly State**: Slider to explode/assemble
- **Material Color**: Change model color
- **Lighting**: Adjust brightness
- **Background**: Change background color

---

### Step 7: Stop the Server (When Done)

If you're running the server:

1. **Go back to Terminal/Command Prompt**
2. **Press `Ctrl + C`** (Windows/Linux) or `Cmd + C` (Mac)
3. **Type `Y`** if asked "Terminate batch job?"
4. **The server stops** and you see the command prompt again

You can close the terminal window now.

---

## ⚠️ Troubleshooting

### "command not found" or "npm is not recognized"

**Problem**: Node.js isn't installed correctly

**Solution**:
1. Re-install Node.js from https://nodejs.org/
2. Make sure to restart Terminal/Command Prompt after installing
3. Try the `node --version` check again

---

### "Cannot find module"

**Problem**: Dependencies not installed

**Solution**:
1. Make sure you ran `npm install`
2. Make sure you're in the correct folder
3. Try deleting `node_modules` folder and running `npm install` again

---

### "Port 3000 is already in use"

**Problem**: Something else is using port 3000

**Solution 1** - Stop whatever is using it:
- **Windows**: Open Task Manager, find Node.js, click "End Task"
- **Mac/Linux**: In Terminal: `lsof -i :3000` then `kill -9 <PID>`

**Solution 2** - Use a different port:
```
PORT=3001 npm run dev
```
Then go to http://localhost:3001 instead

---

### "404 Not Found" when viewing models

**Problem**: Models not indexed

**Solution**:
1. Run `npm run list` to regenerate the model index
2. Refresh your browser

---

### 3D Viewer is blank

**Problem**: Browser compatibility or file path issue

**Solution**:
1. Try a different browser (Chrome works best)
2. Make sure you're accessing via `http://localhost:3000` not `file://`
3. Check browser console for errors (F12 → Console tab)

---

### "Permission denied" errors

**Problem**: File permissions or admin rights needed

**Solution**:
- **Windows**: Run Command Prompt as Administrator
- **Mac/Linux**: Try adding `sudo` before the command (e.g., `sudo npm install`)

---

## 🎓 Next Steps

### Learn More
- Read [README.md](readme.md) for project overview
- Check [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) for all guides
- Read [CONTRIBUTING.md](CONTRIBUTING.md) if you want to help

### Get Help
- **GitHub Discussions**: Ask questions
- **GitHub Issues**: Report problems
- **Community**: Join Discord (coming soon)

### Advanced Usage
- **API Documentation**: See [API.md](API.md)
- **Development**: See [CONTRIBUTING.md](CONTRIBUTING.md)
- **AI Features**: See [AI_AGENTS.md](AI_AGENTS.md)

---

## 🎉 Success!

You're now running RenderOSArms!

**What next?**
- Explore the models
- Try the 3D viewer
- Search for what you're interested in
- Share with others
- Consider contributing

---

## 📱 Quick Reference Card

```
START SERVER:        npm run dev
STOP SERVER:         Ctrl+C (or Cmd+C on Mac)
UPDATE MODELS:       npm run list
INSTALL:             npm install
TEST:                npm test (when available)

ACCESS WEBSITE:      http://localhost:3000
VIEW MODELS:         http://localhost:3000/index.html
3D VIEWER:           http://localhost:3000/viewer.html
API:                 http://localhost:3000/api
API DOCS:            http://localhost:3000/api/docs (when available)
```

---

**Document Version**: 1.0.0
**Last Updated**: 2025-10-28
**For**: Non-technical users
**Difficulty**: Beginner

<!--
═══════════════════════════════════════════════════════════════════════════
AI HANDOFF DOCUMENT FOOTER
═══════════════════════════════════════════════════════════════════════════

COMPLETION_STATUS: ✅ Complete beginner-friendly guide
NEXT_REVIEW_DATE: 2026-01-28
VERSION_HISTORY:
  - v1.0.0 (2025-10-28): Initial quick start guide

RELATED_UPDATES_NEEDED:
- Add screenshots when available
- Update URLs when hosting is live
- Add video tutorial links when created
- Expand troubleshooting as issues are reported

AI_AGENT_NOTES:
- Use this guide for users asking "how do I start?"
- Direct technical users to CONTRIBUTING.md instead
- Simplify language - avoid jargon
- When users report issues, add to troubleshooting section
- Consider creating video tutorials for each section

COMMON_USER_QUESTIONS:
Q: Do I need to know programming?
A: No! Just follow the steps.

Q: Will this work on my computer?
A: Yes, if you have Windows, Mac, or Linux.

Q: Is it safe?
A: Yes, open-source and reviewed by community.

Q: How much does it cost?
A: Free! Open-source project.

Q: Can I use it offline?
A: Mostly yes, after initial install.

For tutorial improvements:
- Suggest in GitHub Discussions
- Note confusing parts in issues
- Contribute screenshots/videos
- Help other beginners in discussions

═══════════════════════════════════════════════════════════════════════════
-->
