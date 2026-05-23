# Walkthrough - Cognitive Degradation UI Experiment

I have successfully completed the implementation of the Cognitive Degradation UI Simulator. Below is a detailed walkthrough of the changes, design decisions, and verification results.

## Key Changes

### 1. Project Scaffolding & Tailwind CSS Config
- Scaffolded a standard React + TypeScript project with Vite.
- Set up **Tailwind CSS v3** and **PostCSS** to allow custom style extensions.
- Modified [tailwind.config.js](file:///d:/Codebase/Flo/tailwind.config.js) to configure:
  - Fonts: `Outfit` (clean geometric body), `Space Grotesk` (spatial titles), and `JetBrains Mono` (cold technical diagnostic fonts).
  - Animations: CRT scanline movement and slow breathing base cycles.
- Modified [postcss.config.js](file:///d:/Codebase/Flo/postcss.config.js) to process Tailwind directive compilations.

### 2. Base Document & Custom Fonts
- Modified [index.html](file:///d:/Codebase/Flo/index.html):
  - Changed title to `System Neural Monitor v1.0.4`.
  - Loaded custom font weights from Google Fonts.

### 3. Core CSS Design System
- Overwrote [src/index.css](file:///d:/Codebase/Flo/src/index.css) to add spatial, dark, and analog terminal effects:
  - `.spatial-grid`: A subtle, glowing coordinate background.
  - `.noise-overlay`: An animated sub-perceptual white noise film (using a SVG fractal noise generator URI) that flickers at high stimulation.
  - `.crt-overlay`: Scanning CRT scanline filters that cover the screen when stimulation exceeds 80%.
  - `.chromatic-glow-1/2/3`: Splitted text-shadow offsets in crimson and cyan to emulate physical chromatic aberration.
  - Custom range input thumb overrides for the slider.

### 4. Interactive Simulator Component
- Created [src/CognitiveSimulator.tsx](file:///d:/Codebase/Flo/src/CognitiveSimulator.tsx):
  - **Synapse Initialization Overlay**: Forces a user gesture requirement before booting the interface. This provides a narrative hook and satisfies browser security requirements for audio activation.
  - **Dynamic Background Grid Warping**: As stimulation goes beyond 50, the grid background begins to slowly rotate and scale up.
  - **Visual Neural Orb**: Located behind the text, it rotates, pulses, and oscillates erratically. Its color changes from a soft, calm violet to a pulsating amber and finally to a jagged, glitching crimson storm at high levels.
  - **Identity Paragraph Dissolution**:
    - **Letter Spacing**: Expands dynamically up to `14px` based on the slider value.
    - **Blur**: Incorporates subtle blurring (up to `3.2px`) at high levels, giving a dizzying, suffocating visual strain.
    - **Framer Motion Word-Level Jitter**: Words are split and wiggled individually. The wiggles are set to uncoordinated, asynchronous periodic curves where the wiggle radius increases with stimulation.
    - **Text Scrambling (Glyph Substitution)**: Individual letters (excluding punctuation) are dynamically replaced by code blocks, greek letters, and matrix glyphs based on a probability calculation.
    - **Entropy/Fade**: Random words fade in/out at high levels, representing memory dropouts.
  - **Web Audio API Sound Synthesizer**:
    - Plays a low 55Hz base hum that pitches upwards to 170Hz.
    - Adds a secondary triangle oscillator that detunes wider and wider (generating nauseating acoustic beating).
    - Blends in high-frequency bandpass-filtered static noise that swells in volume.
    - Cracks the filter frequency erratically at high stimulation levels.
  - **Reboot / Flash Degauss**:
    - Clicking the "Reset" button triggers a screen flash using CSS mix-blend-difference, triggers an audio static swell/fade-out, resets stimulation to 1, and reconstitutes the glitched text character-by-character.
  - **HUD Diagnostics Sidebar**:
    - Telemetry metrics that tick down or up (Neural Integrity, Memetic Drift, Dopaminergic Flux).
    - Warning readouts explaining current heuristic symptoms.
    - A scrolling console terminal listing system events, which also degrade into glyph noise as stimulation increases.

### 5. Application Linkage
- Simplified [src/App.tsx](file:///d:/Codebase/Flo/src/App.tsx) to render `<CognitiveSimulator />` in place of default templates.
- Emptied [src/App.css](file:///d:/Codebase/Flo/src/App.css).

### 6. Attention Fragmentation Map (<AttentionGraph />)
- Created [src/AttentionGraph.tsx](file:///d:/Codebase/Flo/src/AttentionGraph.tsx):
  - **Dynamic Topology**: Defines 9 nodes modeled in polar coordinates (radius, angle) around a center point `(200, 200)` inside a responsive SVG canvas.
  - **3D Marble Aesthetics**: Uses custom offset radial gradients (`marble-node-grad`, `stone-node-grad`) and reflection shadows (`reflection-glow`) to simulate 3D spheres floating above a dark, highly reflective polished marble surface.
  - **Coherence Phase (0-20)**: Nodes tightly cluster (dispersion scale = 0.55), share a unified slow orbit movement (perfect stable constellation), and are connected by thin, low-opacity white lines.
  - **Fragmentation Phase (40-70)**: Dispersion factor expands dynamically from 0.55 to 1.45. Links fade linearly in opacity and "snap" (pop out of existence) individually at predefined thresholds (e.g., link snaps at 35, 40, etc.). Synchronization is lost as nodes begin independent low-frequency wobbling and speed drift.
  - **Overdrive Phase (75-100)**: Links are completely gone. Nodes micro-jitter aggressively using pure high-frequency trigonometric functions. Horizontal chromatic aberration (splitting into cyan and red channels) is applied to nodes, with the split distance expanding linearly up to 4px.
  - **React 19 Purity Check**: Designed using deterministic mathematics of `time` and `node.id` rather than impure `Math.random()`, ensuring flawless compilation and zero React 19 linter warnings.

### 7. Split-Screen Layout Restructuring
- Restructured [src/CognitiveSimulator.tsx](file:///d:/Codebase/Flo/src/CognitiveSimulator.tsx):
  - Expanded desktop layout width to `max-w-[90rem]` (1440px) and updated the grid system from `lg:grid-cols-4` to `lg:grid-cols-6` to provide massive breathing room.
  - Assigned Left diagnostics and Right logs panels to `lg:col-span-1`.
  - Assigned Center core workspace to `lg:col-span-4` (doubling its available space).
  - Split the center panel into a side-by-side grid (`grid-cols-1 md:grid-cols-2 gap-8 items-center`):
    - Left half: Identity text block, now left-aligned (`text-left`) with its custom word jitter, blur, character scrambling, and fade-outs.
    - Right half: The floating `<AttentionGraph />` component.

### 8. Interdependent Load Logic (Sleep Debt)
- Introduced a second input dimension `sleepDebt` (0-100) stacked cleanly underneath the stimulation slider in the bottom controls area.
- Implemented fragility multiplier math:
  - `vulnerabilityMultiplier = 1 + (sleepDebt * 0.015)`
  - `nervousSystemLoad = Math.min(100, stimulationLevel * vulnerabilityMultiplier)`
- Re-routed all UI degradation effects (blur, tracking, jitter, text scrambled probability, audio frequency, telemetry, and attention fragmentation graph state) to be driven by `nervousSystemLoad` instead of raw `stimulationLevel` directly.
- Added a low-opacity monospace telemetry readout at the very bottom: `STIMULATION: X | SLEEP DEBT: Y | TRUE LOAD: Z` to help with numerical verification.
- Resetting the buffer restores both states (`stimulationLevel = 1` and `sleepDebt = 0`).

### 9. Volumetric Identity Core Plaque (<IdentityCore />)
- Created [src/IdentityCore.tsx](file:///d:/Codebase/Flo/src/IdentityCore.tsx):
  - **Sacred Geometry Crest**: Renders a classical geometric stone emblem comprising an outer circular border, an intersecting diamond frame, and a central solid marble plaque.
  - **Background Integration**: Embedded absolutely behind the left-aligned identity text block, using `relative z-10` on the text container and `pointer-events-none` on the SVG to allow uninterrupted cursor interactions.
  - **LERP transition**: Uses frame-rate independent exponential smoothing (LERP) via `useAnimationFrame` to slow down transitions organically to 3-5 seconds.
  - **Derived logic mapped to `identityCoherence`**:
    - **Solid State (80-100)**: Emblem layers are unified, stable, and perfectly sharp with 85% solid polished stone fill.
    - **Splintered State (40-79)**: Splinters into 3 concentric layers shifting up-left, up-right, and downward. Opacity drops to 40%, applying `mix-blend-mode: exclusion`. The layers asynchronously rotate clockwise/counter-clockwise to trace separate orbital paths.
    - **Hollow State (0-39)**: Emblem fills disappear completely. The lines become thin 1px wireframe strokes drifting up to 130px in opposite peripheral directions, leaving the center of the screen visibly empty.
- Added a third **Synthetic Interaction** slider (0-100) stacked in the controls area and updated the diagnostic text to print full metrics: `STIMULATION | SLEEP DEBT | TRUE LOAD | SYNTHETIC | COHERENCE`.

### 10. Dynamic Cognitive State Matrix & Ethereal Headings Crossfade
- Declared a `cognitiveState` matrix evaluating `nervousSystemLoad` and `identityCoherence` into 4 quadrants:
  - **Quadrant 1 (Calm clarity)**: *Synaptic Harmony* — "The mind rests in calibrated precision. Neuronal pathways fire in perfect, quiet consensus."
  - **Quadrant 2 (Frantic holding on)**: *Hyper-Stimulated Coexistence* — "The synapses are flooded, yet the boundaries hold. We are racing to keep the shape from splintering."
  - **Quadrant 3 (Dissociative void)**: *Dissociative Void* — "The signals are silent, yet we are no longer here. The anchor has slipped, and we drift through grey space."
  - **Quadrant 4 (Mental collapse)**: *Complete Dissolution* — "Total collapse achieved. The syntax of existence fractures into white noise. There is nothing left to retrieve."
- Integrated `h1` and `p` headings inside the left split-screen column above the identity paragraph text.
- Wrapped headings in `<AnimatePresence mode="wait">` driving an ethereal blur and fade crossfade (opacity from 0 to 1, filter blur 10px to 0px) over 1.5 seconds. The key parameter is bound to the state key (`cognitiveState.key`) triggering the transition smoothly whenever a quadrant boundary is crossed.

---

## Diagnostic Report Reflection Modal & Analysis Upgrades

### 11. ReflectionModal Correction
- **Nervous System Score Inversion**: Corrected raw load score handling in [src/ReflectionModal.tsx](file:///d:/Codebase/Flo/src/ReflectionModal.tsx). Inverted the incoming `score` via `const nervousWellness = 100 - score` within `nervousDescriptor` to align raw load (high = bad) with standard wellness metrics (high = good) and thresholds.
- **Insight Sorting Logic**: Modified `generateInsight` to sort the nervous system based on `100 - scores.nervous`, ensuring a high load properly triggers diagnostic insights for nervous system degradation.

### 12. Time Compression Telemetry Tracking & Narrative Engine
- **Tick-Synchronized Logging**: Refactored [src/TimeCompressionEngine.ts](file:///d:/Codebase/Flo/src/TimeCompressionEngine.ts) to record peaks and troughs inside the frame-rate dependent animation frame loop (`tick`) rather than a low-frequency 50ms `setInterval` to eliminate time compression drift.
- **Narrative Selection Fix**: Rewrote `s3` paragraph selection to evaluate actual peak load during the compression timeline (`peaks.load`):
  - `peaks.load > 70` → severe template
  - `peaks.load >= 30` → moderate template
  - `peaks.load < 30` → calm template
- **Narrative Formatting**: Wrapped all interpolated values in `Math.round()` to prevent unformatted floating decimals. Added a minimum threshold checking if `Math.abs(change) < 2` to replace small deltas (like `+0%` or `-1%`) with the grammatical phrase `"remaining stable"`.

### 13. Agency Meter State & Monologue Upgrades
- **React State Transition Binding**: In [src/AgencyMeter.tsx](file:///d:/Codebase/Flo/src/AgencyMeter.tsx), subscribed to the `agencyScore` MotionValue stream to track state boundaries (`initiating` | `stalling` | `paralysis`) via local state.
- **Framer Motion Crossfade**: Removed manual imperative status text and monologue DOM manipulation from `useAnimationFrame` to prevent layout reflow conflicts. Rendered the monologue using `<AnimatePresence mode="wait">` with a `1.5s` blur/opacity crossfade transition.
- **State Label and Monologue Layout**:
  - Displayed the color-coded state label above the momentum bar:
    - Score > 70 → `"INITIATING"` (Amber `#EF9F27`)
    - Score 30-70 → `"STALLING"` (Muted white `rgba(255,255,255,0.4)`)
    - Score < 30 → `"PARALYSIS"` (Red `#E24B4A`)
  - Displayed the internal monologue below the bar (JetBrains Mono, opacity `0.5`, italic).

### 14. Load-Based Console Monitor Degradation
- **Load-Based Message Pools**: In [src/CognitiveSimulator.tsx](file:///d:/Codebase/Flo/src/CognitiveSimulator.tsx), expanded warning logs generator messages:
  - **Calm (< 30)**: System diagnostic scan logs.
  - **Degrading (30-70)**: Appended cortisol, working memory, and focus lock warnings.
  - **Overdrive (> 70)**: Clean `[err]` prefixing with all calm/degrading messages mapped to error status and merged with lowercased `WARNING_POOL` items.
- **Console Log Glitching**: Overdrive messages are passed through `scrambleLogMessage` at generation time, applying character-level glyph substitution using the central text engine scrambler at identical load-based probabilities.

---

## HUD Layout Shift, Time Compression Speed & Cognitive Weather Upgrades

### 15. Decoupled Time Compression Clock & Speeds
- **Duration Rebalance**: In [TimeCompressionEngine.ts](file:///d:/Codebase/Flo/src/TimeCompressionEngine.ts), rebalanced compression mode lengths to keep runs highly engaging:
  - 1 DAY = 20 seconds
  - 1 MONTH = 90 seconds
  - 1 YEAR = 4 minutes (240 seconds)
- **Decoupled Interval Ticker**: Shifted simulated hours counting to a 100ms `setInterval` loop. This decouples numerical simulation progression from the visual rendering refresh loop (requestAnimationFrame), eliminating simulation jitter and lag.
- **Speed Multipliers**: Created a user-selectable `compressionSpeed` prop (`'fast' | 'normal' | 'slow'`) mapped to speed scaling factors `1.0`, `2.0`, and `4.0`. The simulation step drift scales proportionally by dividing the active drift step rate by the speed multiplier. Added a toggle button in the bottom HUD Timeline Scrubber controls.

### 16. Concentric Circle SVG Weather Visualizer
- **Visual Integration**: Replaced the previous `NeuralOrb` placeholder in the center dashboard with `CognitiveWeather`. It renders pure Concentric Circles SVG vector shapes morphing in diameter, scale, and opacity using Framer Motion animations.
- **Cognitive Weather State Mapping**:
  - **CLEAR**: Soft indigo circles pulsating slowly at a wide, stable baseline radius.
  - **OVERCAST**: Muted amber waves with narrow diameters and higher frequency oscillations.
  - **STORM**: Crimson circles with high-frequency scaling, jitter, and high opacities.
  - **VOID**: Concentric geometry fades away entirely into a single dim, translucent center dot representing dissociation.

### 17. Live HUD Telemetry & Layout Splitting
- **Props Resolution**: Hooked up all active `MotionValue` scoring hooks (`identityCoherence`, `agencyScore`, `meaningScore`) and `systemStartScores` to the `<HudTelemetry />` sidebar instantiation inside [src/CognitiveSimulator.tsx](file:///d:/Codebase/Flo/src/CognitiveSimulator.tsx), fixing previous typecheck warnings.
- **Symmetrical Column Balancing**: Slipped the center panel layout columns into a symmetrical 3-column configuration (`md:col-span-6` for Text Block, `md:col-span-3` for Agency, and `md:col-span-3` for Existential Depth), occupying the full 12-column grid. The redundant duplicate instance of `<AttentionGraph />` was removed from the center panel, keeping its compact rendering clean in the right diagnostic sidebar.
- **ReflectionModal Prop Connections**: Connected `firedEvents` and `peakLoad` telemetry tracking states to `<ReflectionModal />` from the parent simulator.

---

## Verification Results

### TypeScript Compiler Check
- Ran `npx tsc --noEmit -p tsconfig.app.json`.
- **Clean output**: Zero errors or type warnings found.

### Vite Production Build
- Ran `npm run build`.
- Production bundle successfully generated:
  - `dist/index.html` (0.83 kB)
  - `dist/assets/index-BFBYbmJ9.css` (31.75 kB)
  - `dist/assets/index-G1S1p8dC.js` (421.59 kB)
  - Build execution time: **989ms**
