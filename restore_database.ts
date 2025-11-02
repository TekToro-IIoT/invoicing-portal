import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcrypt';
import fs from 'fs';

async function restoreDatabase() {
  const sql = neon(process.env.DATABASE_URL!);
  
  console.log('Starting database restoration...\n');
  
  // 1. Create/Update Admin User
  console.log('1. Creating admin user...');
  const hashedPassword = await bcrypt.hash('!Tektoro5263add@', 10);
  
  await sql`
    INSERT INTO users (id, email, username, password, role, "first_name", "last_name", regular_rate, overtime_rate)
    VALUES ('masteradmin', 'al.doucet@tektoro.com', 'aldoucet', ${hashedPassword}, 'admin', 'Al', 'Doucet', '125', '187.50')
    ON CONFLICT (id) DO UPDATE SET
      email = 'al.doucet@tektoro.com',
      username = 'aldoucet',
      password = ${hashedPassword},
      role = 'admin',
      first_name = 'Al',
      last_name = 'Doucet'
  `;
  console.log('✓ Admin user created/updated\n');
  
  // 2. Create TekToro Company with Logo
  console.log('2. Creating TekToro company...');
  const logoData = fs.readFileSync('attached_assets/Tektoro 512x512_1760028106196.png');
  const base64Logo = `data:image/png;base64,${logoData.toString('base64')}`;
  
  await sql`
    INSERT INTO companies (id, name, address, city, state, zip_code, country, phone, email, website, logo, user_id)
    VALUES (
      1,
      'TekToro Digital Solutions Inc',
      '71 Fort Street PO Box 1569',
      'George Town',
      'Grand Cayman',
      'KY1-1110',
      'Cayman Islands',
      '18558358676',
      'al.doucet@tektoro.com',
      'https://tektoro.com/',
      ${base64Logo},
      'masteradmin'
    )
    ON CONFLICT (id) DO UPDATE SET
      name = 'TekToro Digital Solutions Inc',
      address = '71 Fort Street PO Box 1569',
      city = 'George Town',
      state = 'Grand Cayman',
      zip_code = 'KY1-1110',
      country = 'Cayman Islands',
      phone = '18558358676',
      email = 'al.doucet@tektoro.com',
      website = 'https://tektoro.com/',
      logo = ${base64Logo}
  `;
  console.log('✓ TekToro company created/updated\n');
  
  // 3. Create Sample Clients
  console.log('3. Creating sample clients...');
  
  // Headington Energy Partners
  await sql`
    INSERT INTO clients (id, name, email, phone, address, city, state, zip_code, country, contact_person, company_id, user_id)
    VALUES (
      1,
      'Headington Energy Partners LLC',
      'billing@headingtonenergy.com',
      '4325702800',
      '600 North Marienfeld Street',
      'Midland',
      'TX',
      '79701',
      'United States',
      'Tim Welch',
      1,
      'masteradmin'
    )
    ON CONFLICT (id) DO UPDATE SET
      name = 'Headington Energy Partners LLC',
      email = 'billing@headingtonenergy.com',
      phone = '4325702800',
      address = '600 North Marienfeld Street',
      city = 'Midland',
      state = 'TX',
      zip_code = '79701',
      contact_person = 'Tim Welch'
  `;
  
  // Blueflare Energy Solutions
  await sql`
    INSERT INTO clients (id, name, email, phone, address, city, state, zip_code, country, contact_person, company_id, user_id)
    VALUES (
      5,
      'Blueflare Energy Solutions Inc',
      'landon@goblueflare.com',
      '',
      'Unit 102 - 15302 94 Street',
      'Grande Prairie',
      'Alberta',
      'T8X OL2',
      'Canada',
      'Landon',
      1,
      'masteradmin'
    )
    ON CONFLICT (id) DO UPDATE SET
      name = 'Blueflare Energy Solutions Inc',
      email = 'landon@goblueflare.com',
      address = 'Unit 102 - 15302 94 Street',
      city = 'Grande Prairie',
      state = 'Alberta',
      zip_code = 'T8X OL2',
      country = 'Canada',
      contact_person = 'Landon'
  `;
  
  console.log('✓ Sample clients created\n');
  
  // 4. Reset sequences to proper values
  console.log('4. Resetting sequences...');
  await sql`SELECT setval('clients_id_seq', (SELECT COALESCE(MAX(id), 1) FROM clients), true)`;
  await sql`SELECT setval('companies_id_seq', (SELECT COALESCE(MAX(id), 1) FROM companies), true)`;
  await sql`SELECT setval('invoices_id_seq', (SELECT COALESCE(MAX(id), 1) FROM invoices), true)`;
  console.log('✓ Sequences reset\n');
  
  console.log('✅ Database restoration complete!\n');
  
  // Show summary
  const userCount = await sql`SELECT COUNT(*) as count FROM users`;
  const companyCount = await sql`SELECT COUNT(*) as count FROM companies`;
  const clientCount = await sql`SELECT COUNT(*) as count FROM clients`;
  
  console.log('Summary:');
  console.log(`- Users: ${userCount[0].count}`);
  console.log(`- Companies: ${companyCount[0].count}`);
  console.log(`- Clients: ${clientCount[0].count}`);
}

restoreDatabase().catch(console.error);
