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

## Telemetry Balancing, Report Thresholds & Layout Shifts

### 18. Cognitive Score Balancing Formulas
- **meaningScore**: Rewrote the derivation math in [src/CognitiveSimulator.tsx](file:///d:/Codebase/Flo/src/CognitiveSimulator.tsx) to prioritize physical movement and prevent degradation in recovery cabins:
  `meaningScore = 15 + (movement * 0.40) - (stimulation * 0.25) + (100 - synthetic) * 0.15 - (economicStress * 0.15) - (sleepDebt * 0.10)`
- **agencyScore**: Replaced the agency formula in the drift loop to properly integrate nervousSystemLoad and fatigue freezes:
  `agencyScore = 20 + (movement * 0.30) - (economicStress * 0.30) - (sleepDebt * 0.25) - (nervousSystemLoad * 0.15) + 10`

### 19. Diagnostic Report Event Thresholds
- Refactored `buildEnvironmentReport` in [src/ReflectionModal.tsx](file:///d:/Codebase/Flo/src/ReflectionModal.tsx) to enforce strict event triggers:
  - **Recovery events**: Only fires if stabilizers count is `>= 2` AND at least one system wellness dropped `> 15pts`.
  - **Multiple destabilizers**: Only fires if destabilizers count is `>= 2` AND `peakLoad > 50`.
  - **Critical peak load**: Only fires if `peakLoad > 70`.
  - **Alternating cycles**: Only fires if destabilizers `>= 1` AND stabilizers `>= 1`.
  - **Exposure duration scale**: Corrected brief/sustained/extended duration bounds: Brief is strictly `< 90s`, Sustained is `90s to 300s`, and Extended is `> 300s`.

### 20. CognitiveWeather Circle Upgrades
- Re-coded `<CognitiveWeather />` circles visualizer. Removed static grey placeholders.
- Concentric circle strokes now morph dynamically:
  - **CLEAR**: 3 indigo `#6B8FE8` circles, opacity `0.3-0.6`, slow pulsing scale staggered per ring.
  - **OVERCAST**: Compresses radius (`[22, 40, 58]`), shifts stroke to amber `#EF9F27`, and doubles pulse speed.
  - **STORM**: Jitters offset horizontally/vertically per frame, shifts to crimson `#E24B4A`, scale oscillates rapidly at 0.3s intervals, and applies double offset ±3px cyan channels simulating chromatic aberration.
  - **VOID**: Fades rings to 0 opacity over 2s and renders a single `4px` dim white dot at center.

### 21. Symmetrical Layout Restructuring
- Removed `"AGENCY CORE"` and `"MEANING CORE"` text labels from [src/AgencyMeter.tsx](file:///d:/Codebase/Flo/src/AgencyMeter.tsx) and [src/ExistentialDepth.tsx](file:///d:/Codebase/Flo/src/ExistentialDepth.tsx) to clear floating empty space.
- Moved `<AgencyMeter />` to the LEFT panel, rendering it inside `<HudTelemetry />` below system status bars.
- Moved `<ExistentialDepth />` to the RIGHT panel, rendering it inside `<RealtimeLogs />` stacked above the attention graph.
- Transformed the CENTER panel into a single unified column, centering the large `<CognitiveWeather />` canvas above the text block and sacred geometry emblem.

### 22. Autopsy resilience calculations
- Updated the "Highest Core Resilience" calculation in [src/CognitiveSimulator.tsx](file:///d:/Codebase/Flo/src/CognitiveSimulator.tsx). The metric now shows absolute peak-to-trough variance (`Math.abs(peak - trough)`) formatted with `±` prefixing.
- If Identity Coherence remained at 100%, displays `"Held stable throughout."`. If resilience variance was `<= 5%`, displays `"No significant variance recorded."` instead of mathematical zeroes.

### 23. TypeScript Compilation Fixes
- Removed unused prop `sessionDuration` from the `EnvironmentalPrescriptionProps` interface and destructuring arguments in [src/EnvironmentalPrescription.tsx](file:///d:/Codebase/Flo/src/EnvironmentalPrescription.tsx).
- Removed the unused `sessionDuration` attribute pass from the `<EnvironmentalPrescription>` instantiation block in [src/CognitiveSimulator.tsx](file:///d:/Codebase/Flo/src/CognitiveSimulator.tsx).
- Removed the unused `nearestArchetype` state declaration and its associated `setNearestArchetype` state update statement in [src/OnboardingQuestionnaire.tsx](file:///d:/Codebase/Flo/src/OnboardingQuestionnaire.tsx) to prevent TS6133 compiler errors.

---

## Onboarding Persistence, ExistentialDepth SVG, Telemetry Upgrades

### 24. Onboarding LocalStorage Persistence
- Modified [src/OnboardingQuestionnaire.tsx](file:///d:/Codebase/Flo/src/OnboardingQuestionnaire.tsx) `handleFinish` to persist both `snm_onboarded: 'true'` and `snm_profile: JSON.stringify({...})` to `localStorage` upon questionnaire completion. The profile object includes `sleepDebt`, `stimulationLevel`, `economicStress`, `physicalMovement`, `syntheticInteraction`, `socialPressure`, and a `timestamp` for future session-age tracking.

### 25. Mount-Time Profile Loading & RECALIBRATE Link
- Modified [src/CognitiveSimulator.tsx](file:///d:/Codebase/Flo/src/CognitiveSimulator.tsx):
  - Added `currentInsight` state to capture the insight string from `ReflectionModal` and relay it to `EnvironmentalPrescription`.
  - Added `profileLoaded` state that triggers a `"SUBJECT PROFILE LOADED"` emerald banner in the top header HUD for exactly 3 seconds on mount when a saved profile is found.
  - Added a mount-time `useEffect` that, if `snm_onboarded` is set, reads `snm_profile` from `localStorage`, parses it, pre-populates all 6 MotionValue sliders (`stimulationLevel`, `sleepDebt`, `socialPressure`, `economicStress`, `physicalMovement`, `syntheticInteraction`), and derives initial system start scores (`attention`, `nervous`, `identity`, `agency`, `meaning`) from the loaded slider values.
  - Extended `HeaderStatusProps` interface with `onRecalibrate: () => void` and `profileLoaded: boolean`.
  - Added a hidden `"RECALIBRATE"` button to the top header bar (`opacity: 0.3`, full opacity on hover, `text-[8px]` monospace). Clicking it clears both `snm_onboarded` and `snm_profile` from `localStorage` and triggers `window.location.reload()`.
  - Removed unused `generateInsight` import from the `ReflectionModal` import statement.

### 26. ExistentialDepth SVG Well Rendering Fix
- Rewrote [src/ExistentialDepth.tsx](file:///d:/Codebase/Flo/src/ExistentialDepth.tsx) completely:
  - Set explicit container dimensions: `style={{ width: '100%', minHeight: '120px' }}`.
  - Updated SVG attributes to `viewBox="0 0 200 160"` with explicit `width="100%"` and `height="160"`.
  - Added a `<rect>` element with a `shaftRef` for the depth shaft. Width and x-position are derived values updated each `useAnimationFrame` tick:
    - `shaftWidth = 40 + (smoothedMeaning / 100) * 100`
    - `shaftX = 100 - shaftWidth / 2`
  - Applied explicit fill/stroke colors: shaft fill `rgba(255,255,255,0.05)`, stroke `rgba(255,255,255,0.15)`.
  - Radial gradient glow uses `rgba(239,159,39,0.4)` center transitioning to transparent.
  - Removed the monologue text (`"What lies ahead?"`) and the `"QUESTIONING"` label entirely. Replaced with a single status word below the SVG:
    - `meaningScore > 60` → `"GROUNDED"` (bold zinc)
    - `meaningScore 30-60` → `"DRIFTING"` (amber)
    - `meaningScore < 30` → `"VOID"` (pulsing rose)

### 27. ArchetypeSelector Flow Probability Calculation Fix
- Replaced `getFlowProbability` helper in [src/ArchetypeSelector.tsx](file:///d:/Codebase/Flo/src/ArchetypeSelector.tsx) with `calcFlowProbability`, a pure function that calculates flow probability strictly from each archetype's own target slider values:
  - `nervousLoad = Math.min(100, config.stimulation * (1 + config.sleepDebt / 100 * 0.8))`
  - `attention = Math.max(0, 100 - nervousLoad * 0.8)`
  - `agency = Math.max(0, 30 + config.movement * 0.30 - config.economic * 0.30 - config.sleepDebt * 0.25)`
  - `meaning = Math.max(0, 15 + config.movement * 0.40 - config.stimulation * 0.25)`
  - Flow channel entrance: `attention > 75 && agency > 70 && 35 <= nervousLoad <= 65 && meaning > 60 && social < 40`.
  - Depth scored as `min(100, ((attention - 75) / 25 * 30) + ((agency - 70) / 30 * 30) + (1 - abs(nervousLoad - 50) / 15) * 40)`.
  - Expected results: Deep Flow ~65-75%, Sustainable High Performance ~45-55%, Recovery Cabin ~20-30%, high-load profiles 0%.

### 28. Console Monitor Word-Wrap Fixes
- Added `.console-monitor-entry` CSS class to [src/index.css](file:///d:/Codebase/Flo/src/index.css):
  - `word-break: break-word` (prevents mid-word breaks unlike `break-all`).
  - `overflow-wrap: break-word` for cross-browser safety.
  - `white-space: pre-wrap` preserves whitespace while wrapping.
  - `max-width: 100%` prevents overflow.
- Modified `RealtimeLogs` in [src/CognitiveSimulator.tsx](file:///d:/Codebase/Flo/src/CognitiveSimulator.tsx):
  - Increased console font size from `text-[9px]` to `text-[11px]` for improved readability.
  - Changed `break-all` class on log entries to `console-monitor-entry`.
  - Added `overflow-x-hidden` on the console container to clip horizontal overflow at the column edge.

### 29. Environmental Prescription Diagnosis Insight Propagation
- Modified [src/ReflectionModal.tsx](file:///d:/Codebase/Flo/src/ReflectionModal.tsx):
  - Changed `onClose` callback prop type from `() => void` to `(insight: string) => void`.
  - Updated the "UNDERSTOOD" button and backdrop click handlers to pass the computed `insight` string: `onClose(insight)`.
- Modified [src/EnvironmentalPrescription.tsx](file:///d:/Codebase/Flo/src/EnvironmentalPrescription.tsx):
  - Renamed `diagnosis: string` prop to `insight: string` in the interface and destructuring.
  - Removed quotation marks wrapping the Section 1 text (it's system-generated analysis, not a citation).
  - Text is styled in italics via existing `fontStyle: 'italic'`.
- Modified [src/CognitiveSimulator.tsx](file:///d:/Codebase/Flo/src/CognitiveSimulator.tsx):
  - Added `currentInsight` state variable.
  - `ReflectionModal` `onClose` callback now captures `insightStr` from the modal and saves it to `currentInsight` state before opening the prescription.
  - `EnvironmentalPrescription` receives `insight={currentInsight}` instead of recalculating `generateInsight(...)` inline.
  - Removed the now-unused `generateInsight` import.

---

## Onboarding Skip Logic, ExistentialDepth Rewrite & State Refactoring

### 30. Onboarding Visibility & State Refactoring
- Modified [src/OnboardingQuestionnaire.tsx](file:///d:/Codebase/Flo/src/OnboardingQuestionnaire.tsx) to ensure `localStorage.setItem('snm_onboarded', 'true')` and `localStorage.setItem('snm_profile', ...)` are set strictly before executing the `onComplete` callback.
- Modified [src/CognitiveSimulator.tsx](file:///d:/Codebase/Flo/src/CognitiveSimulator.tsx):
  - Refactored `isOnboarded` state variable to `showOnboarding` (inverting its boolean polarity, where `true` means show onboarding) and initialized it to `true` by default to ensure the onboarding questions are shown every time the website is loaded or refreshed:
    `const [showOnboarding, setShowOnboarding] = useState(true);`
  - Replaced the previous model's mount-time profile loading `useEffect` with a clean, decoupled mount effect at the top of the body that reads `snm_profile` from `localStorage` and sets each slider MotionValue if defined in the profile object.
  - Subscribed to `meaningScore` changes inside the `RealtimeLogs` sub-component and stored the number value in a `currentMeaning` React state to pass it down cleanly to the rewritten `<ExistentialDepth>` component as a `number`.

### 31. ExistentialDepth Component Rewrite
- Completely rewrote [src/ExistentialDepth.tsx](file:///d:/Codebase/Flo/src/ExistentialDepth.tsx):
  - Updated props to accept `meaningScore` as a `number` instead of a `MotionValue<number>`.
  - Replaced Framer Motion complex direct DOM updates with standard state and inline styles with CSS transitions.
  - Added a `<VoidTextCycle>` child component using Framer Motion (`motion.span`) to cyclically fade and rotate through distress/void words (`'emptiness'`, `'drift'`, `'nothing'`, `'later'`, `'eventually'`) when `meaningScore < 20`.
  - Rendered status labels (`GROUNDED`, `DRIFTING`, `VOID`) in corresponding colors dynamically.

---

## Verification Results

### TypeScript Compiler Check
- Ran `npx tsc --noEmit -p tsconfig.app.json` and `npx tsc --noEmit`.
- **Clean output**: Zero errors or warnings found in the workspace.
