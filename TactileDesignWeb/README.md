# TactileDesign Web

A web-based designer for creating LVGL UI layouts for Tactility apps.

## Features

- Drag and drop widgets (Label, Button, Container) onto the canvas
- Edit widget properties (position, size, text)
- Select and modify existing widgets
- Generate C++ code for LVGL
- Save and load designs locally

## Getting Started

1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Open your browser to the provided URL
4. Click on a widget type in the left sidebar, then click on the canvas to place it
5. Select widgets from the list to edit their properties
6. Generate C++ code for your design

## Building

To build for production: `npm run build`

## LVGL Integration

The app uses a WebAssembly build of LVGL to preview the UI in real-time.
