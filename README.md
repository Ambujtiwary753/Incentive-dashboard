# RM Incentive Calculator

A comprehensive three-pillar compensation calculator for Relationship Managers in the motor insurance sector. Build, test, and manage RM incentive models with real-time budget tracking.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-production-brightgreen)

---

## 📋 Features

### Core Calculation Engine
- **Pillar A**: APE Commission based on Annual Premium Equivalent with product mix boosters
- **Pillar B**: Activity Bonus tied to active and connected agent counts
- **Pillar C**: Renewal Bonus with tiered thresholds for renewal rates

### Interactive UI
- **Sidebar Controls**: Real-time adjustable sliders for all parameters
- **Quick Profiles**: Pre-configured templates (Struggling, Average, Star RM)
- **Instant Calculations**: Live results across all three pillars
- **Visual Breakdowns**: Percentage-based pill charts for each pillar

### Budget Management
- **Floor-Based Budgeting**: Track disbursements for 153 RMs across three profiles
- **Budget Health Indicator**: Visual progress bar with safe/warning/exceed thresholds
- **Comparison View**: See how different RM profiles compare side-by-side

### Multiple Versions
- **Pure HTML/Vanilla JS**: Zero dependencies, works offline
- **React Component**: Modern, scalable, easy to integrate
- **Mobile Responsive**: Works on desktop, tablet, and mobile

---

## 🚀 Quick Start

### Option 1: HTML (No Installation Required)
1. Download `RM_Incentive_Calculator.html`
2. Double-click to open in any web browser
3. Start adjusting sliders immediately

### Option 2: React Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/rm-incentive-calculator.git
cd rm-incentive-calculator

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

---

## 📊 How It Works

### Input Parameters
- **APE (₹ Lacs)**: Annual Premium Equivalent (5-120L range)
- **Private Mix (%)**: Percentage of private insurers (20-90%)
- **Product Mix**: Car Comprehensive, Car Other, TW/CV percentages
- **Agents**: Active agents (0-40) and Connected agents (0-60)
- **Renewal Rate**: Annual renewal percentage (30-95%)

### Calculation Formula

**Pillar A (APE Commission)**
```
= (Rate A / 100) × Weighted APE × Product Booster × 100,000

Weighted APE = (Private APE × 1.3) + (PSU APE × 1.0)
Product Booster = (CarComp × 1.8) + (CarOther × 1.3) + (TW/CV × 1.0)
```

**Pillar B (Activity Bonus)**
```
= (Active Agents × Rate) + (Connected Agents × Rate)
Default: ₹150/active, ₹40/connected
```

**Pillar C (Renewal Bonus)**
```
Tiered by renewal percentage:
- < 50%: ₹0
- 50-65%: ₹800
- 65-80%: ₹1,500
- > 80%: ₹2,500
```

**Total Monthly Incentive**
```
= Pillar A + Pillar B + Pillar C
```

---

## 📁 Project Structure

```
rm-incentive-calculator/
├── RM_Incentive_Calculator.html    # Standalone HTML version
├── src/
│   ├── index.jsx                   # React entry point
│   ├── App.jsx                     # Main React component
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── MainContent.jsx
│   │   ├── Slider.jsx
│   │   └── Card.jsx
│   ├── utils/
│   │   ├── calculations.js         # Core calculation logic
│   │   └── constants.js            # Default rates & profiles
│   └── styles/
│       └── index.css               # Tailwind + custom styles
├── public/
│   ├── index.html
│   └── favicon.ico
├── package.json
├── README.md                       # This file
├── LICENSE
└── .gitignore
```

---

## ⚙️ Default Configuration

### Base Rates
```javascript
{
  rateA: 0.12,           // 0.12% of weighted APE
  rateActive: 150,       // ₹150 per active agent
  rateConn: 40,          // ₹40 per connected agent
  renewalSlabs: [0, 800, 1500, 2500]
}
```

### RM Profiles
| Profile | APE | Private % | Car Comp | Active | Connected | Renewal % |
|---------|-----|-----------|----------|--------|-----------|-----------|
| Struggling | 15L | 40% | 20% | 5 | 10 | 42% |
| Average | 36.6L | 60% | 40% | 12 | 25 | 63% |
| Star | 80L | 75% | 60% | 22 | 45 | 83% |

---

## 💡 Use Cases

### For Managers
- ✓ Calibrate incentive rates to match budget constraints
- ✓ Simulate payouts across RM tiers before roll-out
- ✓ Monitor budget health in real-time
- ✓ Compare fair compensation across performance levels

### For RMs
- ✓ Calculate expected monthly incentives
- ✓ Understand pillar contributions to total pay
- ✓ Set performance targets based on calculations
- ✓ Quick profile comparisons

### For Finance Teams
- ✓ Project floor-based disbursements for 153 RMs
- ✓ Stay within budget caps (₹17L base, ₹18.7L max)
- ✓ Track rate changes and impact modeling
- ✓ Export data for reporting

---

## 🎨 Customization

### Change Default Rates
Edit `src/utils/constants.js`:
```javascript
export const DEFAULT_RATES = {
  rateA: 0.15,           // Adjust APE rate
  rateActive: 200,       // Adjust active agent bonus
  rateConn: 50,          // Adjust connected agent bonus
  renewalSlabs: [0, 1000, 2000, 3000]  // Adjust renewal tiers
};
```

### Add New RM Profiles
Edit `src/utils/constants.js`:
```javascript
export const PROFILES = [
  // ... existing profiles
  {
    label: "High Performer",
    color: "#8b5cf6",
    icon: "★",
    apeLacs: 100,
    privatePct: 80,
    productMix: { carComp: 70, carOther: 20, twCv: 10 },
    activeAgents: 30,
    connectedAgents: 60,
    renewalPct: 90,
  }
];
```

### Modify Budget Thresholds
Edit `src/utils/constants.js`:
```javascript
export const BUDGET_CONFIG = {
  baseFloor: 1700000,     // ₹17L
  maxCap: 1870000,        // ₹18.7L (10% over)
  rmCount: 153
};
```

---

## 🔄 Workflow

1. **Load Profile** → Click a profile button (Struggling, Average, Star)
2. **Adjust Inputs** → Use sidebar sliders to customize parameters
3. **View Results** → See real-time calculations on the right
4. **Monitor Budget** → Check if total disbursement is within limits
5. **Compare** → View side-by-side comparison of all profiles
6. **Export** → Copy results or save for reporting

---

## 📱 Responsive Design

- **Desktop (1200px+)**: Full sidebar + main content layout
- **Tablet (768px-1199px)**: Sidebar collapses, stacked cards
- **Mobile (< 768px)**: Single column, overlay controls

---

## 🐛 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 📝 License

MIT License - see LICENSE file for details

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Email: your-email@example.com
- Check the documentation above

---

## 🎯 Roadmap

- [ ] Excel export functionality
- [ ] Manager rate calibration UI
- [ ] Historical data tracking
- [ ] Multi-RM comparison tool
- [ ] Email report generation
- [ ] API for third-party integration
- [ ] Dark mode toggle
- [ ] Localization (Hindi, Marathi, etc.)

---

**Version**: 1.0.0  
**Last Updated**: March 2026  
**Sector**: Motor Insurance  
**Framework**: React 18.2 / Vanilla JS  
**License**: MIT
