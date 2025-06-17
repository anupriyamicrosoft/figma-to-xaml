const express = require('express');
const cors = require('cors');
const { AzureOpenAI } = require('openai');
require('dotenv').config();

// Initialize Express app
const app = express();
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());

// Initialize Azure OpenAI client with environment variables
const client = new AzureOpenAI({
  azure_endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  api_key: process.env.AZURE_OPENAI_API_KEY,
  apiVersion: process.env.OPENAI_API_VERSION || '2025-01-01-preview'
});

// Endpoint to convert Figma JSON to XAML (with image support)
app.post('/convert', async (req, res) => {
  try {
    console.log('Received request body:', JSON.stringify(req.body, null, 2));
    const { json, image, className, xamlName } = req.body;
    // Prepare the image as a data URL for OpenAI (if present)
    let imageMessage = null;
    if (image) {
      imageMessage = {
        type: 'image_url',
        image_url: {
          url: `data:image/png;base64,${image}`
        }
      };
    }
    // Prepare the messages array for GPT-4o vision
    const messages = [
      { role: 'system', content: 'You are a helpful assistant that converts Figma JSON and a reference image to XAML for WinUI 3.' },
      imageMessage,
      { role: 'user', content: `Convert this Figma JSON to XAML. Take the image as reference. Ensure the XAML is compatible with WinUI 3. ONLY return the XAML code. Include the headers like xmls and class in the window tag. Don't include height and width in window tag. The main design elements must not be in window tag. It should be ready to paste into mainwindow.xaml as window tag. Don't include \`\`\` tags or any other text. ONLY COMPATIBLE WITH WINUI3.\nClass name: ${className || 'YourApp'}. XAML file name: ${xamlName || 'MainWindow'}.\nFigma JSON: ${JSON.stringify(json)}` }
    ].filter(Boolean); // Remove nulls if no image

    console.log('Sending messages to OpenAI:', JSON.stringify(messages, null, 2));
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.2,
      response_format: { type: 'text' }
    });
    console.log('OpenAI response:', JSON.stringify(response, null, 2));

    // Extract the XAML content from the response
    const xaml = response.choices[0].message.content;
    res.status(200).send(xaml);
  } catch (e) {
    console.error('Error in /convert:', e);
    res.status(500).json({ error: e.message, stack: e.stack, full: e });
  }
});

// starts the server on the specified port or defaults to 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
