# TactileDesign

  A web designer for Tactility external apps, making the creation/customization of the UI for these apps much easier. 
  Intended for ESP32-powered devices running [Tactility OS](https://github.com/ByteWelder/Tactility). 

## Overview

TactileDesign is a web-based visual editor that lets developers and designers build, preview, and export UIs for Tactility apps.

- **Design visually:** Drag, drop, and configure tactile UI elements from a browser.
- **Export for deployment:** Generate app layouts and assets ready for use in TactilityApps and compatible with Tactility OS.
- **Cross-platform:** Works with Tactility apps written in C++ with C support coming soon!

## Related Projects

- [Tactility OS](https://github.com/ByteWelder/Tactility): An operating system for ESP32 devices.
- [TactilityApps](https://github.com/ByteWelder/TactilityApps): Official Tactility applications.
- [Tactile Browser](https://github.com/NellowTCS/TactileBrowser): My web browser that supports Tactility.
- [TactilityClock](https://github.com/NellowTCS/TactilityClock): A simple clock app I made for Tactility.

## Features

- **Web-based editor:** No installation required—design from any modern browser.
- **Live preview:** See the UI as you build.
- **Joystick:** Move stuff around using a joystick. Need I say more?
- **Export options:** Compatible with the TactilityApps repository.

## Getting Started

### Online
Open <https://nellowtcs.me/TactileDesign> in your browser

### Local Build
1. **Clone the repository:**
   ```bash
   git clone https://github.com/NellowTCS/TactileDesign.git
   ```
2. **Build LVGL using the included buildscript**
   ```bash
   ./build.sh
   ```
4. **Install dependencies:**
   ```bash
   cd TactileDesignWeb
   npm install
   ```
5. **Run the development server:**
   ```bash
   npm run dev
   ```
6. **Open your browser:** Navigate to `http://localhost:5173` to start designing.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to help improve TactileDesign.

## License

See [LICENSE](LICENSE) for details.
