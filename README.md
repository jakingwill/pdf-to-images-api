# PDF to Images API

A fast, free API that converts PDF pages to images for n8n workflows.

## Quick Start

```bash
npm install
npm start
```

Server runs on port 3000 by default.

## API Usage

### Convert PDF to Images

**POST** `/convert-pdf`

```json
{
  "url": "https://example.com/document.pdf"
}
```

**Response:**
```json
{
  "success": true,
  "totalPages": 3,
  "images": [
    {
      "pageNumber": 1,
      "filename": "page-1.png", 
      "data": "base64-encoded-image-data",
      "mimeType": "image/png"
    }
  ]
}
```

### Health Check

**GET** `/health`

## n8n Integration

1. Use HTTP Request node
2. Method: POST
3. URL: `http://localhost:3000/convert-pdf`
4. Body: `{ "url": "your-pdf-url" }`
5. Process the returned base64 images as needed

## Requirements

- Node.js
- pdf-poppler requires poppler-utils to be installed:
  - macOS: `brew install poppler`
  - Ubuntu: `sudo apt-get install poppler-utils`
  - Windows: Download from poppler website