# 3D UI/UX Architecture & Character Showcase

The frontend visual design is styled as a **cinematic 3D character showcase and interactive voting arena**, avoiding generic SaaS gradients, flashing neon colors, or corporate dashboards.

---

## 1. Visual Hierarchy & Design Philosophy

1. **Restrained Color Palette**:
   - The stage uses sophisticated neutral foundations (deep warm charcoal, graphite `#141312` and `#0e0d0c`) allowing the 3D Cat and Dog to supply the primary visual personality.
   - **Cat Character Palette**: Warm ginger fur (`#e29d62`), creamy chest patch (`#fdf8f0`), soft pink inner ears (`#e8a598`), brass bell (`#d4af37`), and emerald eyes (`#387a5c`).
   - **Dog Character Palette**: Warm caramel fur (`#ba7843`), accent tan ears and tail (`#854d24`), soft cream muzzle (`#fcf3e8`), brass bone tag (`#d4af37`), and warm chocolate eyes (`#4a2e18`).

2. **Cinematic 3D Lighting Setup**:
   - **Soft Key Light**: Directional warm sunlight casting realistic contact shadows on the studio floor.
   - **Rim Light**: Cool fill from behind the characters to accentuate silhouette definition and depth.
   - **Warm Fill Points**: Positioned around the characters to simulate physical studio floor bounce.
   - **Ambient Studio Motes**: Subtle floating gold-tinted dust motes drifting gently through the stage lighting.

3. **Dynamic Camera Parallax**:
   - As the user glides the mouse across the screen, the camera gently pans and tilts using linear interpolation (`THREE.MathUtils.lerp`).
   - Both characters track the cursor with their heads, creating a responsive living experience before any click occurs.

---

## 2. Interactive Character Mechanics

### Cat Character (`CatCharacter.tsx`)
- Handcrafted procedural Three.js geometry: capsule body, spherical head, dual-layer pointed ears with inner ear geometry, almond eyes with gloss catchlights, whisker lines, leather collar, and curved tail.
- Idle animations: rhythmic breathing bob, tail swish, and cursor tracking.
- Vote reaction: celebratory hop arc with expressive head tilt.

### Dog Character (`DogCharacter.tsx`)
- Handcrafted procedural Three.js geometry: capsule body, spherical head, snout, dark button nose, cute tongue, floppy ears, round canine eyes, and bushy tail.
- Idle animations: breathing bob, active tail wag, floppy ear bounce, and cursor tracking.
- Vote reaction: joyful bounce and tail wag acceleration.

---

## 3. Responsive Layout Strategy

- **Desktop (>= 768px)**:
  - Cat on left pedestal (`position: [-2.2, 0, 0]`), Dog on right pedestal (`position: [2.2, 0, 0]`).
  - Wide-angle camera with expansive stage visibility.
- **Mobile (< 768px)**:
  - Adaptive camera perspective (`fov: 42`, distance adjusted to `5.2`).
  - Tactile voting buttons stacked cleanly below characters.
  - Automatically reduces particle count to 18 to preserve battery and 60 FPS performance on mobile GPUs.

---

## 4. Accessibility & Reduced Motion

- The application automatically queries `window.matchMedia('(prefers-reduced-motion: reduce)')`.
- A manual toggle in the footer allows users to freeze continuous camera parallax and tail oscillations while retaining full voting capability.
