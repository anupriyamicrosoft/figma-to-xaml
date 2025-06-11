const express = require('express');
const cors = require('cors');
const { AzureOpenAI } = require('openai');
require('dotenv').config();

const app = express();
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());

const client = new AzureOpenAI({
  azure_endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  api_key: process.env.AZURE_OPENAI_API_KEY,
  apiVersion: process.env.OPENAI_API_VERSION || '2025-01-01-preview'
});

app.post('/convert', async (req, res) => {
  try {
    const figma_json = req.body;
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that converts Figma JSON to XAML for WinUI 3.' },
        { role: 'user', content: `Convert this Figma JSON to XAML for WinUI 3 ONLY. 
            Do NOT generate WPF, UWP, or any other XAML dialect. 
            The output MUST be valid and directly usable in a WinUI 3 project (MainWindow.xaml). 
            Include only the necessary WinUI 3 namespaces and class in the Window tag. 
            Do NOT include height or width in the Window tag. 
            The main design elements must NOT be in the Window tag. 
            Do NOT include \`\`\` tags or any extra text. 
            If you are unsure, prefer WinUI 3 syntax and structure. 
            Here is the Figma JSON:\n${JSON.stringify(figma_json)}`
        }      ],
      temperature: 0.2,
      response_format: { type: 'text' }
    });
    const xaml = response.choices[0].message.content;
    res.status(200).send(xaml);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
