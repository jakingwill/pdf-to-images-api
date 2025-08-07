const axios = require('axios');
const fs = require('fs');

async function testPdfConversion() {
  try {
    console.log('Testing PDF conversion...');
    
    const response = await axios({
      method: 'POST',
      url: 'http://localhost:3001/convert-pdf',
      data: {
        url: 'https://storage-cdn.weweb.io/8c9f22cb-87ee-4c8d-8204-39bde1a09bb3/users-storage/42c0d664/CamScanner__2025-06-23_11.11_.pdf'
      },
      timeout: 30000
    });
    
    if (response.data.success) {
      console.log(`Success! Converted ${response.data.totalPages} pages`);
      
      // Save first page as test
      const firstPage = response.data.images[0];
      const buffer = Buffer.from(firstPage.data, 'base64');
      fs.writeFileSync('test-page-1.png', buffer);
      console.log('First page saved as test-page-1.png');
    } else {
      console.log('Error:', response.data.error);
    }
  } catch (error) {
    console.log('Request error:', error.message);
  }
}

testPdfConversion();