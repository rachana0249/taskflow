# 🚀 FASTEST Railway Deploy - 5 Steps

## Step 1: Push to GitHub (2 min)
```bash
git init
git add .
git commit -m "TaskFlow"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/taskflow.git
git push -u origin main
```

## Step 2: MongoDB Atlas URI (2 min)
Visit: https://www.mongodb.com/cloud/atlas
1. Sign up
2. Create free M0 cluster
3. Create user (username/password)
4. Copy connection string: `mongodb+srv://user:pass@cluster0.xxx.mongodb.net/taskflow`

## Step 3: Deploy Backend (3 min)
Visit: https://railway.app
1. Login with GitHub
2. **New Project** → **Deploy from GitHub Repo**
3. Select `taskflow`
4. Click **Add Variables**:
   - `MONGO_URI`: `mongodb+srv://user:pass@cluster0.xxx.mongodb.net/taskflow`
   - `JWT_SECRET`: Run this in terminal: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - `PORT`: `3000`
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: Leave blank for now

5. **Deploy**
6. Wait 2-3 min for build ✓
7. Copy URL from Dashboard (format: `https://taskflow-xxx.railway.app`)

## Step 4: Deploy Frontend (2 min)
Visit: https://vercel.com
1. Login with GitHub
2. **Add New** → **Project**
3. **Import Git Repository** → Select `taskflow`
4. Root Directory: `frontend`
5. Framework: `Other`
6. **Add Environment Variables**:
   - `REACT_APP_API_URL`: `https://taskflow-xxx.railway.app/api`
   - `REACT_APP_SOCKET_URL`: `https://taskflow-xxx.railway.app`
   
7. **Deploy**
8. Wait 1-2 min ✓

**DONE!** Open your Vercel URL and start using TaskFlow.

---

## Test It (30 seconds)
1. Open frontend URL
2. Register account
3. Create project
4. Add task
5. Drag task → Done

**That's it! Live in 5 minutes!** 🎉
