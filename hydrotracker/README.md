# 🌱 HydroTracker

A comprehensive hydroponics grow management system built with SvelteKit 5 and DaisyUI, designed for growers managing multiple indoor and outdoor hydroponic setups.

## ✨ Features

### 🌿 Grow Management
- Track unlimited simultaneous grows
- Support for multiple system types (DWC, Bato Buckets, NFT, Ebb & Flow, etc.)
- Indoor, outdoor, and greenhouse tracking
- Different growing mediums (Coco coir, Rockwool, Clay pebbles, etc.)
- Growth stage tracking (Seed → Harvest)
- Expected harvest dates and yield tracking

### 📊 Daily Logging
- Comprehensive metric tracking:
  - Water metrics: pH, EC, PPM, water temperature, reservoir levels
  - Environment: Air temperature, humidity, light hours
  - Plant data: Growth stage, height, observations
  - Runoff metrics: pH and EC for drain-to-waste systems
- Notes and issue tracking
- Photo documentation support
- Historical data analysis

### ✅ Task Management
- Create custom tasks and reminders
- Recurring tasks (daily, weekly, bi-weekly, monthly)
- Priority levels (Low, Medium, High, Urgent)
- Link tasks to specific grows
- Auto-generated initial tasks for new grows

### 💧 Nutrient Management
- Nutrient library with pre-loaded GH Flora series
- Track brands, NPK ratios, and dosages
- Feeding schedule history per grow
- Nutrient change tracking

### 👥 Community Features (In Development)
- Share grows publicly
- Follow other growers
- Like and comment on grows
- Browse community grows
- Learn from successful setups

### 📈 Analytics & Reporting
- Average metrics per grow
- Growth timelines
- Data visualization
- Export to CSV for further analysis

## 🚀 Tech Stack

- **Framework**: SvelteKit 5 (with Svelte 5 runes)
- **Styling**: TailwindCSS + DaisyUI
- **State Management**: Svelte 5 stores with runes
- **Build Tool**: Vite
- **Deployment**: Static adapter for GitHub Pages

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm

### Setup

```bash
# Navigate to the project directory
cd hydrotracker

# Install dependencies
npm install

# Run development server
npm run dev

# Open browser to http://localhost:5173
```

## 🏗️ Project Structure

```
hydrotracker/
├── src/
│   ├── lib/
│   │   └── stores/          # Svelte 5 stores (grows, logs, tasks, nutrients, users)
│   ├── routes/
│   │   ├── +layout.svelte   # Main layout with navigation
│   │   ├── +page.svelte     # Dashboard
│   │   ├── grows/           # Grow management pages
│   │   │   ├── +page.svelte # Grows list
│   │   │   └── new/         # Create new grow
│   │   ├── log/             # Daily logging interface
│   │   ├── community/       # Community features
│   │   └── tasks/           # Task management (TBD)
│   ├── app.css              # Global styles (Tailwind)
│   └── app.html             # HTML template
├── static/                  # Static assets
├── package.json
├── svelte.config.js         # SvelteKit configuration
├── tailwind.config.js       # Tailwind + DaisyUI configuration
└── vite.config.js           # Vite configuration
```

## 🎨 Svelte 5 Features

This project uses the latest Svelte 5 features:

### Runes
- `$state` - Reactive state
- `$derived` - Computed values
- `$derived.by` - Complex computed values
- `$props` - Component props

### Example Store (Svelte 5 style)
```javascript
class GrowsStore {
	grows = $state([]);

	add(grow) {
		this.grows.push(grow);
	}

	getActive() {
		return this.grows.filter(g => g.status === 'active');
	}
}

export const growsStore = new GrowsStore();
```

### Example Component
```svelte
<script>
	import { growsStore } from '$lib/stores/grows.svelte.js';

	const activeGrows = $derived(growsStore.getActive());
	const growCount = $derived(activeGrows.length);
</script>

<div>Active Grows: {growCount}</div>
```

## 🎨 DaisyUI Themes

HydroTracker includes multiple themes:
- **hydrotracker** (custom green theme)
- light
- dark
- cupcake
- garden

Change themes using the selector in the sidebar.

## 💾 Data Storage

Currently uses **localStorage** for data persistence:
- `hydro_grows` - All grow data
- `hydro_logs` - Daily log entries
- `hydro_tasks` - Task/reminder data
- `hydro_nutrients` - Nutrient library
- `hydro_users` - User profiles (for community features)

### Future: Backend Integration

The app is structured to easily migrate to a backend:

```typescript
// Current (localStorage)
growsStore.add(grow);

// Future (with API)
async function addGrow(grow) {
	const response = await fetch('/api/grows', {
		method: 'POST',
		body: JSON.stringify(grow)
	});
	return response.json();
}
```

## 🌐 Deployment

### GitHub Pages

1. Build the app:
```bash
npm run build
```

2. The `build/` directory contains your static site

3. Push to GitHub and enable GitHub Pages:
   - Go to repository Settings → Pages
   - Select branch: `gh-pages` or `main`
   - Select folder: `/ (root)` or `/build`

### Netlify / Vercel

1. Connect your GitHub repository
2. Build command: `npm run build`
3. Publish directory: `build`
4. Deploy!

### Custom Server

```bash
# Build
npm run build

# Preview locally
npm run preview

# Serve the build/ directory with any static server
```

## 🔮 Roadmap

### Phase 1: Core Features (Current)
- [x] Grow management
- [x] Daily logging
- [x] Task management
- [x] Basic analytics
- [x] Community structure

### Phase 2: Enhanced Features
- [ ] Complete task management interface
- [ ] Full analytics dashboard with charts
- [ ] Timeline/calendar view
- [ ] Photo uploads and gallery
- [ ] Feeding schedule planner
- [ ] Nutrient calculator

### Phase 3: Community Platform
- [ ] User authentication
- [ ] Public grow journals
- [ ] Follow/follower system
- [ ] Likes and comments
- [ ] Discussion forums
- [ ] Recipe sharing

### Phase 4: Advanced Features
- [ ] Mobile app (React Native / Capacitor)
- [ ] Real-time sensor integration (pH, EC sensors)
- [ ] AI-powered recommendations
- [ ] Multi-user collaboration
- [ ] E-commerce integration (seeds, nutrients)
- [ ] Weather integration for outdoor grows

## 🤝 Contributing

This is currently a personal project, but contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📱 Mobile Responsiveness

HydroTracker is fully responsive and optimized for:
- Desktop (1920px+)
- Laptop (1024px - 1920px)
- Tablet (768px - 1024px)
- Mobile (320px - 768px)

## 🔒 Privacy

All data is stored locally in your browser by default. No data is sent to external servers unless you explicitly enable community features and share grows publicly.

## 🐛 Known Issues / Limitations

- No backend yet (localStorage only)
- Photo uploads prepare UI but need storage solution
- Community features are UI placeholders
- Some advanced analytics not yet implemented

## 📄 License

MIT License - feel free to use this for personal or commercial projects

## 💡 Inspiration

Built for hydroponics enthusiasts who need:
- Professional tracking tools
- Multi-grow management
- Data-driven insights
- Community knowledge sharing

## 🙏 Acknowledgments

- Built with [SvelteKit 5](https://kit.svelte.dev/)
- Styled with [DaisyUI](https://daisyui.com/)
- Icons and inspiration from the hydroponics community

---

**Happy Growing!** 🌱

For questions or support, open an issue on GitHub.
