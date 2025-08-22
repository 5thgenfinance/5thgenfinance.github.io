# Rick Rule Stock Analysis Viewer

🔗 **Live Demo**: [https://your-username.github.io/rick-rule-viewer](https://your-username.github.io/rick-rule-viewer)

A web application for viewing and searching Rick Rule's stock recommendations and commentary from various interviews. The application automatically updates daily with the latest data from MongoDB and is hosted for free on GitHub Pages.

## ✨ Features

- **🔍 Smart Search**: Search by ticker symbol or company name using dropdown menus
- **📊 Company Cards**: Detailed view showing ratings, ownership status, and comments
- **🔗 Source Attribution**: Direct links to original YouTube interview sources
- **📱 Responsive Design**: Works perfectly on desktop and mobile devices
- **🌙 Dark Theme**: Professional dark interface using your custom 5gdark.css
- **🔄 Auto Updates**: Data refreshes daily at 6 AM UTC via GitHub Actions
- **⚡ Fast Loading**: Static site with no server costs

## 🎯 How It Works

1. **Data Collection**: MongoDB stores Rick Rule interview data with company analysis
2. **Daily Updates**: GitHub Actions exports fresh data every morning
3. **Static Hosting**: GitHub Pages serves the website for free
4. **Smart Search**: Frontend JavaScript provides instant search and filtering

## 🚀 Live Features

### Search Interface
- **Ticker Dropdown**: Select from all available stock tickers
- **Company Dropdown**: Search by full company names
- **Show All**: Display all companies at once
- **Clear Search**: Reset search form

### Company Display
- **Rating System**: 1-10 scale where 1 is best (Rick's ranking system)
- **Ownership Status**: Shows if Rick owns, doesn't own, or unknown
- **Comments**: Positive and negative commentary side-by-side
- **Source Links**: Click through to original YouTube interviews
- **Date Information**: When the interview was published

## 📋 Data Sources

The application pulls from Rick Rule interviews on these channels:
- Rule Investment Media
- Triangle Investor  
- Palisades Gold
- Wealtheon
- CapitalCosm
- In It to Win It
- The Deep Dive

## 🛠️ Technical Stack

- **Frontend**: Vanilla JavaScript, CSS3, HTML5
- **Database**: MongoDB Atlas (read-only access)
- **Hosting**: GitHub Pages (free)
- **CI/CD**: GitHub Actions
- **Styling**: Custom 5gdark.css theme

## 📊 Sample Data

The viewer displays information like:

```
CCO - Cameco
Rating: N/A | Ownership: Owns
Positive: "Way long Cameco - only uranium stock didn't sell..."
Negative: "Previous concern about Westinghouse acquisition..."
Source: Rule Investment Media (2025-08-21)
```

## 🔄 Update Schedule

- **Automatic**: Daily at 6:00 AM UTC
- **Manual**: Can be triggered anytime via GitHub Actions
- **On Push**: Updates whenever code is pushed to main branch

## 📱 Responsive Design

- **Desktop**: Full-width layout with side-by-side comments
- **Tablet**: Responsive grid that adapts to screen size
- **Mobile**: Single-column layout with stacked elements
- **Touch-Friendly**: Large buttons and easy navigation

## 🎨 Visual Design

- **Color Scheme**: Dark theme with green accents (#4a9723, #92cf43)
- **Typography**: Clean, readable fonts with proper hierarchy
- **Cards**: Modern card layout with subtle shadows and borders
- **Status Indicators**: Color-coded ownership and rating badges

## ⚡ Performance

- **Fast Loading**: Static files load instantly
- **Local Search**: No server calls for filtering
- **Cached Data**: Browser caches data for offline viewing
- **Optimized Images**: No heavy assets, text-based interface

## 🔐 Security

- **Read-Only Access**: MongoDB connection uses read-only credentials
- **No Authentication**: Public data, no user accounts needed
- **HTTPS**: Served over secure GitHub Pages HTTPS
- **No Data Collection**: No user tracking or analytics

## 📈 Future Enhancements

Potential additions could include:
- Historical rating changes over time
- Portfolio tracking features  
- Email alerts for new interviews
- Advanced filtering options
- Export functionality

## 🤝 Contributing

This is a personal project, but suggestions are welcome:
1. Open an issue with your idea
2. Fork the repository  
3. Create a feature branch
4. Submit a pull request

## 📄 License

MIT License - Feel free to use this code for your own projects.

## 🆘 Support

If the site isn't working:
1. Check if GitHub Actions completed successfully
2. Wait a few minutes for GitHub Pages to update
3. Clear your browser cache
4. Check if the data file exists in the repository

## 📊 Data Update Status

Data last updated: *Shown on the website*
Total companies tracked: *Automatically displayed*

---

**Built with ❤️ for Rick Rule interview analysis**

Visit the live site: **https://your-username.github.io/rick-rule-viewer/**