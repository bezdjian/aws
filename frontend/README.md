# EightyTwenty | Consultant Finance Terminal

A modern, high-fidelity financial modeling dashboard for independent consultants. Built with a focus on the **80/20
Consultancy Model**, helping you automate buffers, handle Swedish employer fees, and know exactly what remains for gross
salary.

## 🚀 Tech Stack

- **React 19**: The latest React features for a reactive UI.
- **Vite**: Ultra-fast development server and build tool.
- **Tailwind CSS v4**: Utility-first styling with the new CSS-first configuration engine.
- **Lucide React**: Clean, consistent financial iconography.
- **State-Driven Modeling**: Real-time financial calculations using a decoupled logic layer.

## ✨ Key Features

- **80/20 Salary Model**
- **Swedish Localization**:
    - Currency formatting for `sv-SE` (SEK).
    - Employer fee calculations (31.42%).
    - Pension SLP tax modeling (24.26%).
- **Split-Screen Experience**:
    - **Left**: Branding and secure Google OAuth entry point.
    - **Right**: High-precision "Guest Mode" calculator for immediate financial insight.
- **Decoupled Logic**: Financial formulas are centralized in `CalculationUtils` for maintainability and testing.

## 🛠️ Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm or yarn

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### Development

To start the development server:

```bash
npm run dev
# OR from the root directory:
make frontend
```

## 📐 Project Structure

- `src/App.jsx`: Main UI layout and state management.
- `src/utils/CalculationUtils.jsx`: Centralized financial formulas and constants.
- `src/index.css`: Tailwind v4 global theme and custom utility classes.
- `index.html`: Optimized viewport and brand typography.

---

_By EightyTwenty AB._
