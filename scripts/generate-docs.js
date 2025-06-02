import { swaggerSpec } from '../src/utils/swagger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Update the server URL for production
swaggerSpec.servers = [
    {
        url: 'https://your-api-url.com', // You'll need to update this with your actual API URL
        description: 'Production server'
    }
];

// Write the swagger.json file
const outputPath = path.resolve(__dirname, '../docs/swagger.json');
fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2), 'utf8');
console.log(`Swagger documentation generated at ${outputPath}`); 