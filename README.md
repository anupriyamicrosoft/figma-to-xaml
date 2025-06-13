# ✨ Figma to XAML Plugin

This plugin converts Figma design files into **WinUI 3-compatible XAML code**, powered by **Azure OpenAI** and hosted on an **Azure Web App**.

## 🚀 Features

- Converts Figma JSON into clean, structured XAML code
- Supports WinUI 3 layout and control mapping
- Uses Azure OpenAI for intelligent code generation
- Handles most standard Figma components
- Hosted on a scalable Azure Web App backend

## 🛠️ How It Works

1. Select your Figma Design
2. The plugin sends the design JSON to an Azure Web App.
3. Azure OpenAI processes the design and returns XAML code.
4. The plugin displays or downloads the generated code.


## 📦 Setup

1. Clone this repo.
2. install dependencies
3. Ensure your Azure OpenAI resource is active and accessible.
4. Configure the environment variables in your Azure Web App.
5. In the Figma App, import the plugin using your ```manifest.json```.
6. Open a design file and run your plugin.
7. View or download the XAML directly from the plugin interface.


## ⚠️ Known Limitations

- Large JSON files (e.g., > 4000 lines) may result in incomplete XAML due to token or memory limits.
- Deeply nested or complex components may require manual adjustments.
- Currently does not support streaming or chunked processing.

## 📈 Roadmap

- [ ] Add support for chunked JSON processing
- [ ] Improve error handling and logging
- [ ] UI enhancements for previewing generated code
- [ ] Support for more Figma component types

## 🙋‍♀️ Maintainer

Built by **Anupriya Pandey** — Software Engineer Intern 
