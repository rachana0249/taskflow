# TaskFlow Deployment Quick Start (5 Minutes)

## 🚀 Option 1: Deploy to Railway (Easiest)

This is the **fastest and easiest** way to deploy TaskFlow.

### Step 1: Prepare Your Code (1 min)

```bash
# 1. Push code to GitHub
git init
git add .
git commit -m "TaskFlow ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/taskflow.git
git push -u origin main
```

### Step 2: Set Up MongoDB (1 min)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster (M0 free tier)
4. Create database user
5. Copy connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/taskflow
   ```

### Step 3: Deploy Backend on Railway (2 min)

1. **Go to https://railway.app**
2. Click "Login with GitHub"
3. Click "New Project"
4. Select "Deploy from GitHub Repo"
5. Choose your `taskflow` repository
6. Wait for Railway to detect the backend
7. Go to "Variables" tab
8. Add these environment variables:
   ```
   MONGO_URI = mongodb+srv://username:password@cluster.mongodb.net/taskflow
   JWT_SECRET = (copy from backend/.env)
   FRONTEND_URL = https://taskflow.vercel.app
   PORT = 3000
   NODE_ENV = production
   ```
9. Click "Deploy"
10. Copy your Railway URL (e.g., `https://taskflow-prod-xyz.railway.app`)

### Step 4: Deploy Frontend on Vercel (1 min)

1. **Go to https://vercel.com**
2. Click "Login with GitHub"
3. Click "New Project"
4. Select your `taskflow` repository
5. Change "Root Directory" to `frontend`
6. Go to Environment Variables
7. Add:
   ```
   REACT_APP_API_URL = https://YOUR_RAILWAY_URL/api
   REACT_APP_SOCKET_URL = https://YOUR_RAILWAY_URL
   ```
8. Click "Deploy"
9. Your frontend is live! 🎉

### Done! ✅

Your app is now deployed and accessible worldwide!

**Frontend URL**: https://your-project.vercel.app  
**Backend URL**: https://taskflow-prod-xyz.railway.app

---

## 🎯 Option 2: Deploy to Heroku (Alternative)

### Backend on Heroku

```bash
# Install Heroku CLI first: https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create taskflow-backend

# Set environment variables
heroku config:set MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/taskflow
heroku config:set JWT_SECRET=your_secret_key
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### Frontend on Netlify

1. Go to https://netlify.com
2. Click "Add New Site" → "Import an Existing Project"
3. Select GitHub repository
4. Set:
   - Base directory: `frontend`
   - Build command: (leave empty)
5. Add Environment Variable:
   ```
   REACT_APP_API_URL = https://your-heroku-url/api
   ```
6. Deploy!

---

## 📋 Checklist

After deployment, verify:

- [ ] Backend is running (visit your Railway URL)
- [ ] Frontend is loading (visit your Vercel URL)
- [ ] Can register a new account
- [ ] Can login successfully
- [ ] Can create a project
- [ ] Can add tasks
- [ ] Can drag tasks between columns
- [ ] Dark mode works
- [ ] No CORS errors in console

---

## 🛠️ Troubleshooting

### "Cannot connect to API" Error
- Check that `REACT_APP_API_URL` is correct
- Make sure backend is running on Railway
- Clear browser cache and reload

### "MongoDB connection failed"
- Verify MONGO_URI in Railway Variables
- Check IP whitelist in MongoDB Atlas
- Test connection string locally first

### "502 Bad Gateway"
- Check backend logs on Railway
- Verify MONGO_URI is correct
- Restart the deployment

### Dark page or blank
- Check browser console for errors (F12)
- Verify API URL in app.js
- Check that Bootstrap CDN is loading

---

## 🎯 Pro Tips

1. **Custom Domain** (Optional)
   - In Vercel: Settings → Domains
   - Add your custom domain
   - Update DNS records

2. **Monitor Your App**
   - Railway: Logs tab
   - Vercel: Analytics
   - Monitor for errors

3. **Auto Deploy Updates**
   - Both Railway and Vercel auto-deploy on git push
   - Just commit and push!

---

## 💰 Cost

| Service | Free Tier | Monthly Cost |
|---------|-----------|-------------|
| Railway | Yes | $5+/month |
| Vercel | Yes | $0 (free tier) |
| MongoDB | Yes | $0 (free tier) |
| **Total** | **YES** | **$0-5/month** |

---

## 📞 Need Help?

1. Check Railway logs: Click deployment → "Logs"
2. Check Vercel logs: Click project → "Deployments" → "Logs"
3. Check MongoDB: Connection Security Settings
4. See DEPLOYMENT.md for detailed guides

---

**Your TaskFlow app is now live! 🎉**

Share the link and start collaborating! 🚀
