# 🚀 Vercel Deployment Guide for Wrestle-Bet

## Why Vercel?

Vercel is the **best platform** for Next.js applications because:
- ✅ **Created Next.js** - Perfect compatibility
- ✅ **Automatic deployments** from Git
- ✅ **Built-in analytics** and performance monitoring
- ✅ **Global CDN** for fast loading
- ✅ **Serverless functions** for API routes
- ✅ **Free tier** available

## 🎯 **Quick Start (Recommended)**

### **Option 1: Deploy via Vercel Dashboard (Easiest)**

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up/Login** with GitHub, GitLab, or Bitbucket
3. **Click "New Project"**
4. **Import your Git repository**
5. **Vercel auto-detects Next.js** and configures everything
6. **Add environment variables** (see below)
7. **Click "Deploy"** 🎉

### **Option 2: Use Vercel CLI**

1. **Run the batch file**: `deploy-vercel.bat`
2. **Or manually**:
   ```bash
   npm install -g vercel
   vercel --prod
   ```

## 🔧 **Environment Variables Setup**

### **Required Variables in Vercel Dashboard:**

Go to your project → Settings → Environment Variables

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

### **How to Add Environment Variables:**

1. **Project Dashboard** → Settings tab
2. **Environment Variables** in left sidebar
3. **Add Variable** button
4. **Set Environment**: Production, Preview, Development
5. **Save** and redeploy

## 📁 **Project Structure for Vercel**

Your project is already perfectly structured for Vercel:

```
wrestle-bet/
├── app/                    # Next.js 13+ App Router
├── lib/                    # Utility functions
├── components/             # React components
├── contexts/               # React contexts
├── vercel.json            # Vercel configuration
├── package.json           # Dependencies
└── next.config.mjs        # Next.js config
```

## 🚀 **Deployment Process**

### **1. Automatic Deployment**
- **Push to main branch** → Auto-deploys to production
- **Create pull request** → Auto-deploys to preview
- **Every commit** → Auto-deploys to development

### **2. Manual Deployment**
- **Vercel Dashboard** → Deployments → Redeploy
- **CLI**: `vercel --prod`

## 🔍 **Post-Deployment Setup**

### **1. Update Clerk Dashboard**
- Go to [clerk.com](https://clerk.com)
- Add your Vercel domain: `https://your-app.vercel.app`
- Update allowed origins

### **2. Update Stripe Webhooks**
- Go to [stripe.com](https://stripe.com)
- Add webhook endpoint: `https://your-app.vercel.app/api/donations/webhook`
- Update webhook secret in Vercel

### **3. Update Supabase**
- Go to your [Supabase dashboard](https://supabase.com)
- Add Vercel domain to allowed origins
- Update redirect URLs if needed

## 🛠️ **Troubleshooting**

### **Build Errors**
- **Check environment variables** are set correctly
- **Verify Node.js version** (Vercel uses 18.x by default)
- **Check build logs** in Vercel dashboard

### **Runtime Errors**
- **Check browser console** for client-side errors
- **Check Vercel function logs** for API errors
- **Verify environment variables** are accessible

### **Common Issues**
- **Clerk not working**: Check domain is added to Clerk dashboard
- **Stripe errors**: Verify webhook endpoints and secrets
- **Database connection**: Check Supabase URL and keys

## 📊 **Vercel Features You Get**

### **Performance**
- **Global CDN** - Fast loading worldwide
- **Edge Functions** - Low-latency API calls
- **Image Optimization** - Automatic image compression

### **Analytics**
- **Web Vitals** - Core Web Vitals monitoring
- **Performance** - Page load times
- **Traffic** - Visitor analytics

### **Development**
- **Preview Deployments** - Test before production
- **Rollback** - Quick revert to previous version
- **Git Integration** - Automatic deployments

## 🔄 **Updating Your App**

### **Automatic Updates**
1. **Push to Git** → Auto-deploys
2. **Vercel builds** your app
3. **Deploys** to production
4. **Zero downtime** deployment

### **Manual Updates**
1. **Vercel Dashboard** → Deployments
2. **Redeploy** button
3. **Or use CLI**: `vercel --prod`

## 💰 **Pricing**

### **Free Tier (Hobby)**
- ✅ **Unlimited deployments**
- ✅ **100GB bandwidth/month**
- ✅ **100GB storage**
- ✅ **Custom domains**
- ✅ **HTTPS included**

### **Pro Plan ($20/month)**
- ✅ **Everything in Free**
- ✅ **Unlimited bandwidth**
- ✅ **Team collaboration**
- ✅ **Advanced analytics**

## 🎉 **You're Ready!**

Your Wrestle-Bet app is perfectly configured for Vercel deployment. The platform will handle all the Next.js complexity automatically, and you'll get:

- **Professional hosting** with global CDN
- **Automatic deployments** from Git
- **Built-in monitoring** and analytics
- **Scalable infrastructure** that grows with your app

**Next step**: Go to [vercel.com](https://vercel.com) and deploy! 🚀
