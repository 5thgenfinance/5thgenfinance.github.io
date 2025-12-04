# Deployment Guide - CRVM Reserve Calculator

## Prerequisites

- GitHub account
- 2017 CSO mortality JSON files (4 files)
- Git installed (optional, can use GitHub web interface)

## Step-by-Step Deployment

### Option 1: GitHub Web Interface (Easiest)

#### Step 1: Create Repository

1. Go to [github.com/new](https://github.com/new)
2. Repository settings:
   - **Repository name**: `crvm-calculator` (or your choice)
   - **Visibility**: Public (required for free GitHub Pages)
   - **Initialize**: Do NOT add README, .gitignore, or license
3. Click **"Create repository"**

#### Step 2: Upload Files

1. In your new repository, click **"Add file"** → **"Upload files"**
2. Upload these files to the root directory:
   - `index.html` (your calculator file)
   - `README.md`
   - `DEPLOYMENT.md` (this file)
   - `.gitignore`
3. Click **"Add file"** → **"Create new file"**
   - Name: `mortality/.gitkeep`
   - This creates the mortality folder
   - Commit the file
4. Navigate to `mortality/` folder
5. Upload the 4 JSON files:
   - `2017_CSO_Unisex_Male_NonSmoker.json`
   - `2017_CSO_Unisex_Male_Smoker.json`
   - `2017_CSO_Unisex_Female_NonSmoker.json`
   - `2017_CSO_Unisex_Female_Smoker.json`
6. Commit all changes with message: "Initial deployment"

#### Step 3: Enable GitHub Pages

1. Go to repository **Settings** (top menu)
2. Scroll down to **"Pages"** section (left sidebar)
3. Under **"Source"**:
   - Branch: Select `main` (or `master`)
   - Folder: Select `/ (root)`
4. Click **"Save"**
5. Wait 1-2 minutes for deployment

#### Step 4: Access Your Site

1. GitHub will show: "Your site is live at https://&lt;username&gt;.github.io/crvm-calculator/"
2. Click the link or visit manually
3. Verify calculator loads and works properly

---

### Option 2: Git Command Line

#### Prerequisites
- Git installed on your computer
- GitHub account configured with SSH or HTTPS

#### Steps

```bash
# 1. Create local directory
mkdir crvm-calculator
cd crvm-calculator

# 2. Initialize Git repository
git init
git branch -M main

# 3. Copy your files to this directory
cp /path/to/index.html .
cp /path/to/README.md .
cp /path/to/DEPLOYMENT.md .
cp /path/to/.gitignore .

# 4. Create mortality folder and add files
mkdir mortality
cp /path/to/mortality/*.json mortality/

# 5. Add files to Git
git add .
git status  # Verify all files are staged

# 6. Commit files
git commit -m "Initial deployment of CRVM calculator"

# 7. Connect to GitHub repository
# (Replace <username> with your GitHub username)
git remote add origin https://github.com/<username>/crvm-calculator.git

# 8. Push to GitHub
git push -u origin main

# 9. Enable GitHub Pages
# Go to repository Settings → Pages on GitHub
# Select branch: main, folder: / (root)
# Click Save
```

---

## Verification Checklist

After deployment, verify:

- [ ] **Repository Structure**
  ```
  crvm-calculator/
  ├── index.html
  ├── README.md
  ├── DEPLOYMENT.md
  ├── .gitignore
  └── mortality/
      ├── 2017_CSO_Unisex_Male_NonSmoker.json
      ├── 2017_CSO_Unisex_Male_Smoker.json
      ├── 2017_CSO_Unisex_Female_NonSmoker.json
      └── 2017_CSO_Unisex_Female_Smoker.json
  ```

- [ ] **GitHub Pages Enabled**
  - Settings → Pages shows "Your site is published"
  - Green checkmark next to URL

- [ ] **Site Accessible**
  - Visit: `https://<username>.github.io/crvm-calculator/`
  - Page loads without 404 error

- [ ] **Calculator Functional**
  - Form inputs work
  - Calculate button enabled
  - Console shows: "✓ All 4 mortality tables loaded successfully"

- [ ] **Test Calculation**
  - Enter test policy (Age 40, Male, Non-Smoker, 5-year term, $100K)
  - Click "Calculate Reserve"
  - Results display with audit trail
  - Year-by-year table populates

---

## Troubleshooting

### Problem: 404 Error on Site

**Solution:**
- Wait 1-2 minutes after enabling Pages
- Check Settings → Pages for deployment status
- Verify branch is set to `main` (not `master`)
- Ensure `index.html` is in root directory (not subfolder)

### Problem: "Mortality data is still loading"

**Solution:**
- Check browser console (F12 → Console)
- Verify mortality folder exists with 4 JSON files
- Check file names match exactly (case-sensitive):
  - `2017_CSO_Unisex_Male_NonSmoker.json`
  - `2017_CSO_Unisex_Male_Smoker.json`
  - `2017_CSO_Unisex_Female_NonSmoker.json`
  - `2017_CSO_Unisex_Female_Smoker.json`
- Check file paths in network tab (F12 → Network)

### Problem: Console shows "Failed to load mortality data"

**Solution:**
- Verify files are in `./mortality/` folder (relative to index.html)
- Check JSON files are valid (open in text editor)
- Ensure files uploaded completely (check file sizes)
- Clear browser cache and reload

### Problem: Calculation errors or incorrect results

**Solution:**
- Open browser console (F12) for error messages
- Verify mortality data loaded: Look for "✓ All 4 mortality tables loaded"
- Check input validation messages
- Compare results with known test cases

### Problem: Site works locally but not on GitHub Pages

**Solution:**
- File paths must be relative (`./mortality/...` not `/mortality/...`)
- File names are case-sensitive on GitHub
- Clear browser cache
- Check GitHub Pages deployment log (Settings → Pages)

---

## Custom Domain (Optional)

To use a custom domain like `calculator.yourdomain.com`:

### Step 1: Add CNAME File

Create file `CNAME` in repository root:
```
calculator.yourdomain.com
```

### Step 2: Configure DNS

Add DNS records with your domain provider:

**Option A: Subdomain (calculator.yourdomain.com)**
```
Type: CNAME
Name: calculator
Value: <username>.github.io
```

**Option B: Apex domain (yourdomain.com)**
```
Type: A
Name: @
Value: 185.199.108.153
Value: 185.199.109.153
Value: 185.199.110.153
Value: 185.199.111.153
```

### Step 3: Enable HTTPS

1. Go to Settings → Pages
2. Check "Enforce HTTPS"
3. Wait for SSL certificate provisioning (up to 24 hours)

More info: [GitHub Docs - Custom Domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)

---

## Updating the Calculator

### Method 1: GitHub Web Interface

1. Navigate to file in repository
2. Click pencil icon (Edit)
3. Make changes
4. Commit changes
5. Wait 1-2 minutes for auto-deployment

### Method 2: Git Command Line

```bash
# Make changes to files locally
nano index.html  # or your editor

# Commit and push
git add .
git commit -m "Update calculator logic"
git push origin main

# Auto-deploys in 1-2 minutes
```

---

## Security Considerations

### Public Repository
- Do NOT commit sensitive data
- Do NOT include API keys or credentials
- Mortality data is public (SOA published tables)

### HTTPS
- Enable "Enforce HTTPS" in Settings → Pages
- GitHub provides free SSL certificates

### Content Security
- Calculator runs client-side only
- No server-side processing
- No data sent to external servers

---

## Performance Optimization

### Current Performance
- Initial load: < 2 seconds
- Mortality data load: < 1 second
- Single calculation: < 300ms
- Year-by-year (40 years): < 400ms

### Tips for Faster Loading
- Minimize JSON files (remove whitespace)
- Enable compression in GitHub Pages (automatic)
- Use browser caching (automatic)

---

## Monitoring & Analytics

### GitHub Pages Built-in
- Settings → Pages shows deployment status
- View deployment history in Actions tab

### Add Google Analytics (Optional)

Add to `<head>` section of index.html:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## Support & Resources

### Documentation
- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [Creating a Site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
- [Custom Domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)

### Community
- [GitHub Community](https://github.community/)
- [Stack Overflow - GitHub Pages](https://stackoverflow.com/questions/tagged/github-pages)

### Issues
For calculator-specific issues, create an issue in your repository.

---

## Backup & Recovery

### Backup Repository
```bash
# Clone entire repository
git clone https://github.com/<username>/crvm-calculator.git crvm-backup

# Or download ZIP from GitHub
# Repository page → Code → Download ZIP
```

### Restore from Backup
```bash
# Push backup to new repository
cd crvm-backup
git remote set-url origin https://github.com/<username>/crvm-calculator-restored.git
git push -u origin main
```

---

## Version Control Best Practices

### Commit Messages
- Use clear, descriptive messages
- Examples:
  - "Fix deficiency reserve calculation"
  - "Add mortality data validation"
  - "Update UI styling for dark mode"

### Branching (Optional)
```bash
# Create feature branch
git checkout -b feature/new-calculation

# Make changes and commit
git add .
git commit -m "Add new calculation feature"

# Merge back to main
git checkout main
git merge feature/new-calculation
git push origin main
```

### Tags for Releases
```bash
# Create version tag
git tag -a v1.0 -m "Version 1.0 - Initial release"
git push origin v1.0

# List tags
git tag -l
```

---

**Last Updated**: December 4, 2025  
**Version**: 1.0  
**Authors**: QA-Shirley (QTCS) & DevPro Enterprise IT Team