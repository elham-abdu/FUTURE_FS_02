const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const sampleLeads = [
  {
    name: "John Smith",
    email: "john@company.com",
    phone: "555-0101",
    source: "Website",
    status: "new"
  },
  {
    name: "Sarah Johnson",
    email: "sarah@startup.io",
    phone: "555-0102",
    source: "LinkedIn",
    status: "contacted"
  },
  {
    name: "Mike Chen",
    email: "mike@agency.com",
    phone: "555-0103",
    source: "Referral",
    status: "converted",
    converted_at: new Date(),
    conversion_value: 5000
  },
  {
    name: "Emily Brown",
    email: "emily@design.com",
    phone: "555-0104",
    source: "Social Media",
    status: "new"
  },
  {
    name: "David Wilson",
    email: "david@tech.co",
    phone: "555-0105",
    source: "Website",
    status: "contacted"
  }
];

const sampleNotes = [
  { lead_id: 1, content: "Interested in enterprise plan" },
  { lead_id: 2, content: "Sent pricing info" },
  { lead_id: 2, content: "Follow up next week" },
  { lead_id: 3, content: "Signed contract for 6 months" },
  { lead_id: 4, content: "Asked about pricing" },
  { lead_id: 5, content: "Demo scheduled for next week" },
  { lead_id: 5, content: "Sent case studies" }
];

const seedDatabase = async () => {
  try {
    console.log('Seeding database...');

    // Clear existing data
    await pool.query('DELETE FROM notes');
    await pool.query('DELETE FROM leads');
    await pool.query('DELETE FROM users WHERE username != $1', ['admin']);
    console.log('Cleared existing data');

    // Insert sample leads
    for (const lead of sampleLeads) {
      const result = await pool.query(
        `INSERT INTO leads (name, email, phone, source, status, converted_at, conversion_value) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [lead.name, lead.email, lead.phone, lead.source, lead.status, lead.converted_at, lead.conversion_value]
      );
      
      // Add notes for this lead
      const leadId = result.rows[0].id;
      const leadNotes = sampleNotes.filter(note => note.lead_id === sampleLeads.indexOf(lead) + 1);
      
      for (const note of leadNotes) {
        await pool.query(
          'INSERT INTO notes (lead_id, content) VALUES ($1, $2)',
          [leadId, note.content]
        );
      }
    }
    
    console.log('Sample leads and notes created');

    // Check if admin exists
    const adminCheck = await pool.query("SELECT * FROM users WHERE username = 'admin'");
    
    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
        ['admin', 'admin@crm.com', hashedPassword]
      );
      console.log('Admin user created - Email: admin@crm.com, Password: admin123');
    }

    console.log('Database seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await pool.end();
  }
};

seedDatabase();