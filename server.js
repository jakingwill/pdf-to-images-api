const express = require('express');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/convert-pdf', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'PDF URL is required' });
  }

  const tempDir = path.join(__dirname, 'temp');
  const sessionId = uuidv4();
  const sessionDir = path.join(tempDir, sessionId);
  
  try {
    await fs.ensureDir(sessionDir);
    
    const pdfPath = path.join(sessionDir, 'input.pdf');
    
    console.log('Downloading PDF from:', url);
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream'
    });
    
    const writer = fs.createWriteStream(pdfPath);
    response.data.pipe(writer);
    
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    
    console.log('PDF downloaded, converting to images...');
    
    await new Promise((resolve, reject) => {
      const cmd = `pdftoppm -png "${pdfPath}" "${path.join(sessionDir, 'page')}"`;
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error('pdftoppm error:', error);
          reject(error);
        } else {
          resolve();
        }
      });
    });
    
    const imageFiles = await fs.readdir(sessionDir);
    const pngFiles = imageFiles.filter(file => file.endsWith('.png')).sort();
    
    const results = [];
    for (let i = 0; i < pngFiles.length; i++) {
      const fileName = pngFiles[i];
      const filePath = path.join(sessionDir, fileName);
      const imageBuffer = await fs.readFile(filePath);
      const base64Image = imageBuffer.toString('base64');
      
      results.push({
        pageNumber: i + 1,
        filename: `page-${i + 1}.png`,
        data: base64Image,
        mimeType: 'image/png'
      });
    }
    
    await fs.remove(sessionDir);
    
    console.log(`Successfully converted ${results.length} pages`);
    
    res.json({
      success: true,
      totalPages: results.length,
      images: results
    });
    
  } catch (error) {
    console.error('Error:', error);
    
    try {
      await fs.remove(sessionDir);
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process PDF'
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`PDF to Images API running on port ${PORT}`);
});