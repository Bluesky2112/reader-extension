# Read Aloud Lite: Instant Text-to-Speech

**Read Aloud Lite** is a minimalist, highly responsive browser extension designed to convert selected text into natural-sounding speech with a single click. 

Unlike heavy AI-based extensions that consume significant RAM and slow down your browser, this tool leverages the native Web Speech API built directly into your operating system. It provides a fast, seamless, and distraction-free reading experience without freezing the page.

## ✨ Key Features

- **Instant Playback:** Zero loading time. Click the "Read" button and the voice starts immediately. No heavy AI models or WASM files required.
- **Universal Compatibility:** Works seamlessly on virtually all websites, including social media platforms (like Facebook), news sites, and blogs.
- **Smart Language Detection:** Automatically prioritizes and selects native Vietnamese voices (such as Microsoft Hoài My or Nam Minh) if available on your system, ensuring accurate pronunciation.
- **Customizable Experience:** Open the extension popup to easily adjust the reading speed (from 0.5x to 2x) and choose your preferred voice from the available system voices.
- **Uninterrupted Browsing:** Runs completely in the background. It won't freeze your browser or interrupt your chat and scrolling experience.
- **Easy Controls:** A prominent floating "Stop" button appears while reading, allowing you to halt the speech instantly at any time.
- **Smart Text Handling:** Reads long paragraphs smoothly with natural pauses at punctuation marks. Includes a built-in workaround to prevent the known Chrome/Windows bug where the first word of the text is cut off.

## 🚀 How to Use

1. Select (highlight) any text on a webpage.
2. Click the blue **🔊 Read** button that appears near your cursor.
3. Click the red **⏹ Stop** button at the bottom right corner if you want to stop listening.
4. Click the extension icon in the browser toolbar to change the speed or select a different voice.

## 🔒 Privacy Note

This extension does not collect, store, or transmit any personal data or browsing history. All text processing is handled locally by your system's built-in speech synthesis engine.

## 🛠️ Installation (Developer Mode)

Since this extension is currently in development, you can load it manually:
1. Clone or download this repository to your local machine.
2. Open your browser and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top right corner).
4. Click **Load unpacked** and select the folder containing the extension files.
