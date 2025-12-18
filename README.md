# Australian CGT Calculator 🇦🇺

A privacy-focused web application for calculating Capital Gains Tax on Cryptocurrency and ASX Shares.

**🔒 100% Client-Side Processing** - Your financial data never leaves your browser.

## Features

- ✅ **Cryptocurrency CGT** - CoinSpot CSV format
- ✅ **ASX Shares CGT** - CommSec CSV format
- ✅ **FIFO Cost Basis** - First In, First Out method
- ✅ **50% CGT Discount** - Automatically applied for holdings > 12 months
- ✅ **Grouped by Financial Year** - Separate reports per FY
- ✅ **PDF Reports** - Professional reports ready for tax filing
- ✅ **No Data Upload** - All processing happens in your browser

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- A Firebase project created

### Installation

```bash
# Clone or download this project
cd cgt-calculator

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

## Supported CSV Formats

### Cryptocurrency (CoinSpot)

Export from CoinSpot → Orders → Export CSV

Expected columns:
- Transaction Date
- Type (Buy/Sell)
- Market (e.g., BTC/AUD)
- Amount
- Rate inc. fee
- Total AUD
- Fee AUD (inc GST)

### ASX Shares (CommSec)

Export from CommSec → Portfolio → Transaction History

Expected columns:
- Code
- Company
- Date
- Type (Buy/Sell)
- Quantity
- Unit Price ($)
- Trade Value ($)
- Brokerage+GST ($)
- Total Value ($)

## How CGT is Calculated

### FIFO Method

When you sell, the oldest purchases are matched first:

```
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
Discount: 50% × $22,000 = $11,000
Net CGT: $22,000 - $11,000 = $11,000
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

## Limitations

- Personal use asset exemption not calculated
- Crypto-to-crypto trades not supported (only AUD pairs)
- DeFi/staking rewards not supported
- Share splits/consolidations not supported

## Disclaimer

This tool is for informational purposes only. It is not financial or tax advice. Always consult a registered tax agent for professional advice on your specific situation.

## License

MIT License - Feel free to use, modify, and distribute.

## Support

If you find this useful, consider:
- ⭐ Starring the repo
- 🐛 Reporting bugs
- 💡 Suggesting features
