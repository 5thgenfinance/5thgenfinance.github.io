# CRVM Reserve Calculator - Deployment Checklist

## Pre-Deployment Checklist

### Files to Prepare
- [ ] **index.html** - Main calculator file (rename from current HTML file)
- [ ] **README.md** - Project documentation ✅ (downloaded)
- [ ] **DEPLOYMENT.md** - Deployment guide ✅ (downloaded)
- [ ] **.gitignore** - Git ignore file ✅ (downloaded)
- [ ] **4 Mortality JSON files** in `mortality/` folder:
  - [ ] 2017_CSO_Unisex_Male_NonSmoker.json
  - [ ] 2017_CSO_Unisex_Male_Smoker.json
  - [ ] 2017_CSO_Unisex_Female_NonSmoker.json
  - [ ] 2017_CSO_Unisex_Female_Smoker.json

---

## GitHub Repository Setup

### Step 1: Create Repository
- [ ] Go to https://github.com/new
- [ ] Repository name: `crvm-calculator` (or your choice)
- [ ] Visibility: **Public** (required for free GitHub Pages)
- [ ] Do NOT initialize with README, .gitignore, or license
- [ ] Click "Create repository"

### Step 2: Upload Files

**Option A: Web Interface** (Easiest)
- [ ] Click "Add file" → "Upload files"
- [ ] Upload: index.html, README.md, DEPLOYMENT.md, .gitignore
- [ ] Create folder: Click "Add file" → "Create new file" → Name: `mortality/.gitkeep`
- [ ] Navigate to `mortality/` folder
- [ ] Upload 4 mortality JSON files
- [ ] Commit changes: "Initial deployment"

**Option B: Git Command Line**
```bash
# Clone repository
git clone https://github.com/<username>/crvm-calculator.git
cd crvm-calculator

# Copy files
cp /path/to/index.html .
cp /path/to/README.md .
cp /path/to/DEPLOYMENT.md .
cp /path/to/.gitignore .
mkdir mortality
cp /path/to/mortality/*.json mortality/

# Commit and push
git add .
git commit -m "Initial deployment"
git push origin main
```

### Step 3: Enable GitHub Pages
- [ ] Go to repository Settings
- [ ] Click "Pages" in left sidebar
- [ ] Source: Deploy from a branch
- [ ] Branch: `main` (or `master`)
- [ ] Folder: `/ (root)`
- [ ] Click "Save"
- [ ] Wait 1-2 minutes for deployment

---

## Post-Deployment Verification

### Step 4: Verify Deployment
- [ ] GitHub Pages shows: "Your site is live at https://&lt;username&gt;.github.io/crvm-calculator/"
- [ ] Visit the URL
- [ ] Page loads without 404 error
- [ ] Calculator interface displays correctly

### Step 5: Test Functionality
- [ ] Open browser console (F12 → Console)
- [ ] Check for message: "✓ All 4 mortality tables loaded successfully from /mortality/ folder"
- [ ] No errors in console
- [ ] Calculate button is enabled (not disabled)

### Step 6: Run Test Calculation
- [ ] Enter test policy:
  - Issue Age: 40
  - Gender: Male
  - Smoker: Non-Smoker
  - Term: 5 years
  - Face Amount: $100,000
  - Issue Date: 5 years ago
  - Valuation Date: Today
  - Interest Rate: 3.5%
- [ ] Click "Calculate Reserve"
- [ ] Results display within 1 second
- [ ] CRVM Reserve value shown
- [ ] Audit trail sections expandable
- [ ] Year-by-year table populated with 5 rows

### Step 7: Test All Features
- [ ] Expand all 7 audit trail sections
- [ ] Verify mortality rate lookup details
- [ ] Check year-by-year table has correct columns
- [ ] Test with different age (e.g., 25, 60, 95)
- [ ] Test with different term (e.g., 1, 20, 40 years)
- [ ] Test gender/smoker combinations
- [ ] Verify deficiency reserve check works

---

## Quality Assurance

### Browser Testing
- [ ] Chrome - Works correctly
- [ ] Firefox - Works correctly
- [ ] Safari - Works correctly
- [ ] Edge - Works correctly

### Mobile Testing
- [ ] Responsive design on mobile
- [ ] Forms usable on touch devices
- [ ] Results readable on small screens

### Performance Testing
- [ ] Initial load < 3 seconds
- [ ] Calculation completes < 1 second
- [ ] No memory leaks (test multiple calculations)

### Data Validation
- [ ] Age 17 rejected with error
- [ ] Age 96 rejected with error
- [ ] Term 0 rejected
- [ ] Term 41 rejected
- [ ] Face amount $0 rejected
- [ ] Valuation date before issue date rejected

---

## Documentation Review

### README.md
- [ ] Project description clear
- [ ] Live demo URL correct (update with your username)
- [ ] Installation instructions accurate
- [ ] Usage guide complete
- [ ] License/disclaimer present

### DEPLOYMENT.md
- [ ] Deployment steps clear and tested
- [ ] Troubleshooting section helpful
- [ ] Links to GitHub docs work
- [ ] Custom domain info (if applicable)

---

## Optional Enhancements

### Custom Domain (Optional)
- [ ] Purchase domain name
- [ ] Create CNAME file
- [ ] Configure DNS records
- [ ] Enable HTTPS in GitHub Pages
- [ ] Verify SSL certificate

### Analytics (Optional)
- [ ] Set up Google Analytics
- [ ] Add tracking code to index.html
- [ ] Verify data collection

### SEO (Optional)
- [ ] Add meta description to index.html
- [ ] Add meta keywords
- [ ] Add Open Graph tags
- [ ] Create sitemap.xml
- [ ] Submit to Google Search Console

---

## Maintenance Plan

### Regular Checks
- [ ] Weekly: Verify site is still live
- [ ] Monthly: Check for GitHub Pages changes
- [ ] Quarterly: Review mortality data for updates
- [ ] Annually: Update copyright year

### Update Process
1. Make changes locally or on GitHub
2. Test changes thoroughly
3. Commit with clear message
4. Push to main branch
5. Verify auto-deployment (1-2 minutes)
6. Test live site

---

## Rollback Plan

### If Deployment Fails
1. Check GitHub Pages deployment log
2. Review commit history
3. Revert to last working commit:
   ```bash
   git revert HEAD
   git push origin main
   ```
4. Or reset to specific commit:
   ```bash
   git reset --hard <commit-hash>
   git push --force origin main
   ```

### Backup Strategy
- [ ] Clone repository to local machine
- [ ] Download ZIP backup monthly
- [ ] Keep copy of mortality JSON files
- [ ] Document all customizations

---

## Success Criteria

✅ **Deployment is successful when:**
- Repository is public on GitHub
- All files uploaded and organized correctly
- GitHub Pages enabled and live
- Site accessible at github.io URL
- Console shows mortality data loaded
- Test calculation completes successfully
- All 7 audit trail sections display
- Year-by-year table populates correctly
- No errors in browser console
- Works on multiple browsers
- Mobile responsive

---

## Support Resources

### GitHub
- **Documentation**: https://docs.github.com/en/pages
- **Community**: https://github.community/
- **Support**: https://support.github.com/

### Calculator Issues
- Create issue in your repository
- Include browser console errors
- Describe steps to reproduce
- Attach screenshots if helpful

### Actuarial Questions
- Consult CRVM-Test-Case-Matrix.md for test cases
- Review CRVM-Comprehensive-Test-Plan.md for methodology
- Contact qualified actuary for validation

---

## Sign-Off

**Deployment completed by**: ___________________  
**Date**: ___________________  
**Live URL**: https://_____________________.github.io/crvm-calculator/  
**Status**: ⬜ Development | ⬜ Testing | ⬜ Production  

**Verified by**: ___________________  
**Date**: ___________________  
**Notes**: 
___________________________________________________
___________________________________________________
___________________________________________________

---

**Version**: 1.0  
**Last Updated**: December 4, 2025  
**Authors**: QA-Shirley (QTCS) & DevPro Enterprise IT Team