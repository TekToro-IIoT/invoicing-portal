import fs from 'fs';
import { neon } from '@neondatabase/serverless';

async function updateLogo() {
  const sql = neon(process.env.DATABASE_URL!);
  
  // Read the logo file
  const logoData = fs.readFileSync('attached_assets/Tektoro 512x512_1760028106196.png');
  const base64Logo = `data:image/png;base64,${logoData.toString('base64')}`;
  
  // Update the company logo
  await sql`UPDATE companies SET logo = ${base64Logo} WHERE id = 1`;
  
  console.log('Logo updated successfully!');
}

updateLogo().catch(console.error);
