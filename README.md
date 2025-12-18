# Australian CGT Calculator 🇦🇺

A privacy-focused web application for calculating Capital Gains Tax on Cryptocurrency and ASX Shares.

**🔒 100% Client-Side Processing** - Your financial data never leaves your browser.

**🔗 Live Demo**: [https://au-cgt-calc.web.app](https://au-cgt-calc.web.app)

## ✨ Features

- ✅ **Multi-File Upload** - Upload multiple CSV files at once for cross-year CGT calculation
- ✅ **Cryptocurrency CGT** - CoinSpot CSV format
- ✅ **ASX Shares CGT** - CommSec CSV format
- ✅ **FIFO Cost Basis** - First In, First Out method
- ✅ **50% CGT Discount** - Automatically applied for holdings > 12 months
- ✅ **Cross-Year Transactions** - Handles shares bought in one FY and sold in another
- ✅ **Grouped by Financial Year** - Separate reports per FY
- ✅ **PDF Reports** - Professional reports ready for tax filing
- ✅ **No Data Upload** - All processing happens in your browser

## 🚀 Quick Start

### Using the Live App

Visit [https://au-cgt-calc.web.app](https://au-cgt-calc.web.app)

1. Enter your name (optional - used in PDF reports)
2. Upload your CSV file(s):
   - For cross-year calculations, upload all your financial year CSV files together
   - Example: Upload FY2020, FY2021, FY2022, FY2023, FY2024, FY2025 files at once
3. Review your CGT report
4. Download PDF reports for each financial year

### Local Development

#### Prerequisites

- Node.js 18+ installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- A Firebase project created

#### Installation

```bash
# Clone the repository
git clone https://github.com/zotikossoft-star/au-cgt-calc.git
cd au-cgt-calc

# Install dependencies
npm install

# Run development server
npm run dev
```

Open http://localhost:5173 in your browser.

### Build for Production

```bash
npm run build
```

This creates a `dist` folder with optimized production files.

## Firebase Deployment

### 1. Login to Firebase

```bash
firebase login
```

### 2. Create a Firebase Project

If you haven't already:
- Go to [Firebase Console](https://console.firebase.google.com)
- Click "Create Project"
- Name it (e.g., `cgt-calculator-au`)
- Disable Google Analytics (optional)

### 3. Initialize Firebase

```bash
firebase init hosting
```

When prompted:
- Select your project
- Public directory: `dist`
- Single-page app: `Yes`
- Don't overwrite index.html

### 4. Deploy

```bash
# Build and deploy in one command
npm run deploy

# Or separately
npm run build
firebase deploy --only hosting
```

Your app will be live at: `https://your-project-id.web.app`

### 5. Custom Domain (Optional)

In Firebase Console:
1. Go to Hosting
2. Click "Add custom domain"
3. Follow DNS verification steps

## Project Structure

```
cgt-calculator/
├── src/
│   ├── components/       # React components
│   │   ├── FileUpload.tsx
│   │   ├── Results.tsx
│   │   ├── Header.tsx
│   │   └── OwnerInput.tsx
│   ├── utils/           # Core logic
│   │   ├── csvParser.ts      # CSV parsing
│   │   ├── cgtCalculator.ts  # FIFO & CGT calculation
│   │   ├── pdfGenerator.ts   # PDF report generation
│   │   └── fileDetector.ts   # File type detection
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Tailwind styles
├── public/
│   └── favicon.svg
├── firebase.json        # Firebase config
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 📊 Supported CSV Formats

### Cryptocurrency (CoinSpot)

**How to Export:**
1. Login to CoinSpot
2. Go to Orders → Order History
3. Click "Export CSV"
4. Download the file

**Expected columns:**
- Transaction Date
- Type (Buy/Sell)
- Market (e.g., BTC/AUD)
- Amount
- Rate inc. fee
- Total AUD
- Fee AUD (inc GST)

### ASX Shares (CommSec)

**How to Export:**
1. Login to CommSec
2. Go to Portfolio → Transaction History
3. Select date range for your financial year (July 1 - June 30)
4. Click "Download Transaction History"
5. Repeat for each financial year you need

**💡 Tip:** For accurate cross-year calculations, export and upload all your financial years together (e.g., FY2020-2025).

**Expected columns:**
- Code
- Company
- Date
- Type (Buy/Sell)
- Quantity
- Unit Price ($)
- Trade Value ($)
- Brokerage+GST ($)
- Total Value ($)

## 🧮 How CGT is Calculated

### FIFO Method (First In, First Out)

When you sell, the oldest purchases are matched first:

```
Example:
Buy 10 BTC @ $1,000 (Jan 2023)
Buy 5 BTC @ $2,000 (Jun 2023)
Sell 12 BTC @ $3,000 (Jan 2024)

Cost base:
- 10 BTC from first lot = 10 × $1,000 = $10,000
- 2 BTC from second lot = 2 × $2,000 = $4,000
- Total cost base = $14,000

Proceeds = 12 × $3,000 = $36,000
Gross gain = $36,000 - $14,000 = $22,000
```

### 50% CGT Discount

For assets held > 12 months (individuals only):

```
Gross gain: $22,000
Holding period: > 12 months ✅
Discount: 50% × $22,000 = $11,000
Net CGT: $22,000 - $11,000 = $11,000
```

### Cross-Year Transaction Handling

**v1.0.0 Feature:** The calculator now correctly handles shares bought in one financial year and sold in another.

```
Example:
FY2020: Buy 100 CBA @ $50.00 (Total: $5,000)
FY2025: Sell 100 CBA @ $120.00 (Total: $12,000)

✅ Upload both FY2020 and FY2025 CSV files together
✅ Calculator matches the buy from FY2020 with sell from FY2025
✅ Holding period: ~5 years (50% CGT discount applies)
✅ Net CGT: ($12,000 - $5,000) × 50% = $3,500

Report shows:
- FY2020: No CGT events (only purchases)
- FY2025: Capital gain of $3,500 (with 50% discount applied)
```

## Security & Privacy

- **No server processing** - Everything runs in JavaScript in your browser
- **No data upload** - Your CSV file is never sent anywhere
- **No tracking** - No analytics, no cookies, no third-party scripts
- **Open source** - Audit the code yourself

## ATO Compliance

This calculator implements:
- Australian Financial Year (1 July - 30 June)
- FIFO cost basis method
- 50% CGT discount for long-term holdings
- Separate short-term and long-term gains

Report the "Net Capital Gain (Item 18)" in your tax return.

## ⚠️ Limitations

- Personal use asset exemption not calculated
- Crypto-to-crypto trades not supported (only AUD pairs)
- DeFi/staking rewards not supported
- Share splits/consolidations not supported
- Dividend reinvestment plans (DRPs) not supported
- Corporate actions (mergers, takeovers) not supported

## 📝 Changelog

### v1.0.0 (2025-12-18)

**Major Features:**
- ✨ Multi-file CSV upload support
- ✨ Cross-year CGT calculation (handles shares bought in one FY and sold in another)
- ✨ Handles empty CommSec transaction files gracefully
- 🎨 Professional PDF reports with color-coded gains/losses
- 🔒 100% client-side processing for complete privacy

**Supported Formats:**
- CoinSpot cryptocurrency transactions
- CommSec ASX share transactions

**Technical:**
- React 18 + TypeScript + Vite
- TailwindCSS for styling
- jsPDF for PDF generation
- PapaParse for CSV parsing
- Firebase Hosting

## ⚖️ Disclaimer

This tool is for informational purposes only. It is **not financial or tax advice**.

The calculator implements Australian Tax Office (ATO) guidelines to the best of our knowledge, but:
- Tax laws change frequently
- Individual circumstances vary
- Complex transactions may not be accurately represented

**Always consult a registered tax agent** for professional advice on your specific situation.

## 📄 License

MIT License - Feel free to use, modify, and distribute.

## 🤝 Contributing

Contributions are welcome! If you'd like to improve the calculator:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 💬 Support

If you find this useful, consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs via [GitHub Issues](https://github.com/zotikossoft-star/au-cgt-calc/issues)
- 💡 Suggesting features
- 📢 Sharing with others who might benefit

## 🔗 Links

- **Live App**: [https://au-cgt-calc.web.app](https://au-cgt-calc.web.app)
- **GitHub**: [https://github.com/zotikossoft-star/au-cgt-calc](https://github.com/zotikossoft-star/au-cgt-calc)
- **Issues**: [https://github.com/zotikossoft-star/au-cgt-calc/issues](https://github.com/zotikossoft-star/au-cgt-calc/issues)

---

**Made with ❤️ for the Australian crypto and share trading community**
