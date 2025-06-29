const express = require('express');
const cors = require('cors');
const { AzureOpenAI } = require('openai');
require('dotenv').config();

// Initialize Express app
const app = express();
app.use(cors({ credentials: true, origin: true }));
app.use(express.json({limit: '10mb'})); // Increased limit for larger JSON payloads

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
    const { json, className, xamlName } = req.body;
    // Prepare the messages array for GPT-4o (JSON only, no image)
    const messages = [
      { role: 'system', content: `You are a helpful assistant that converts Figma JSON to XAML for WinUI 3.` },
      { role: 'user', content: `Convert this Figma JSON to XAML:\n${JSON.stringify(json)}. Use object element syntax. Don't include \`\`\` tags or any other text. Ensure the XAML is compatible with WinUI 3. ONLY return the XAML code. include the headers like xmls and class in the window tag. don't include height and width in window tag. Include properties of elements like height, width, background etc. The main design elements must not be in window tag. Add functionalities like input , date , links where required. Add a ScrollViewer. It should be ready to paste into mainwindow.xaml as window tag. Add appropriate tags for < , > , & , etc.` }
    ];

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
