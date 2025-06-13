# Figma to XAML Plugin

This plugin converts Figma design files into **WinUI 3-compatible XAML code**, powered by **Azure OpenAI** and hosted on an **Azure Web App**.

## Features

- Converts Figma into clean, structured XAML code
- Converts Figma into clean, structured XAML code
- Supports WinUI 3 layout and control mapping
- Uses Azure OpenAI for intelligent code generation
- Handles most standard Figma components
- Hosted on a scalable Azure Web App backend

## How It Works

1. Select your Figma Design
2. The plugin sends the design JSON to an Azure Web App.
3. Azure OpenAI processes the design and returns XAML code.
4. The plugin displays or downloads the generated code.


## Setup

1. Clone this repo.

    ```git clone https://github.com/anupriyamicrosoft/figma-to-xaml.git```

2. install dependencies

  ```npm install```

3. Ensure your Azure OpenAI resource is active and accessible.
4. Configure the environment variables in your Azure Web App.

  ![image](https://github.com/user-attachments/assets/c7e22696-c0c8-450d-b8a3-79ede4e36355)

5. In the Figma App, import the plugin using your ```manifest.json```.

  ![image](https://github.com/user-attachments/assets/76cc7778-216d-48fe-a8a1-e87595ac4785)

6. Open a design file and run your plugin.

  ![image](https://github.com/user-attachments/assets/adeaea37-29b7-4e53-8909-ed1a07269ee2)

7. View or download the XAML directly from the plugin interface.

  ![image](https://github.com/user-attachments/assets/0c9b64d1-e412-4b41-bb09-163fb575fb23)



## ⚠️ Known Limitations

- Large JSON files (e.g., > 4000 lines) may result in incomplete XAML due to token or memory limits.
- Deeply nested or complex components may require manual adjustments.
- Currently does not support streaming or chunked processing.

## Roadmap

- Add support for chunked JSON processing
- Improve error handling and logging
- UI enhancements for previewing generated code
- Support for more Figma component types


