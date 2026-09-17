import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

// Use the exact same pool configuration as server.js
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'test',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
});

const demoVideos = [
  { title: 'Homeopathy Treatment Success Story', description: 'Patient shares their transformation journey with homeopathic treatment', type: 'video', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', is_featured: 1, display_order: 1 },
  { title: 'Dr. Consultation Session', description: 'Watch a typical consultation with Dr. Shelke', type: 'video', url: 'https://www.youtube.com/embed/9bZkp7q19f0', is_featured: 1, display_order: 2 },
  { title: 'Chronic Pain Relief Case', description: 'Patient testimonial: Relief from chronic back pain through homeopathy', type: 'video', url: 'https://www.youtube.com/embed/jNQXAC9IVRw', is_featured: 0, display_order: 3 },
  { title: 'Skin Condition Improvement', description: 'Before and after: Eczema treatment results with natural remedies', type: 'video', url: 'https://www.youtube.com/embed/AyICrDYcwME', is_featured: 0, display_order: 4 },
  { title: 'Clinic Tour and Facilities', description: 'Take a virtual tour of our modern homeopathic clinic', type: 'video', url: 'https://www.youtube.com/embed/aqz-KE-bpKQ', is_featured: 0, display_order: 5 },
  { title: 'Women\'s Health Treatment', description: 'Success story: PCOS and hormonal balance management', type: 'video', url: 'https://www.youtube.com/embed/mPNWJjw7R98', is_featured: 0, display_order: 6 },
  { title: 'Allergy Management Session', description: 'How homeopathy helps manage seasonal allergies naturally', type: 'video', url: 'https://www.youtube.com/embed/OPf0YbXqDm0', is_featured: 0, display_order: 7 },
  { title: 'Child Immunity Boost Program', description: 'Strengthening children\'s immunity through homeopathic care', type: 'video', url: 'https://www.youtube.com/embed/xfbb_IvR6Ls', is_featured: 0, display_order: 8 },
  { title: 'Digestive Health Treatment', description: 'Natural solutions for IBS and digestive issues', type: 'video', url: 'https://www.youtube.com/embed/IZ_bWhDZd5I', is_featured: 0, display_order: 9 },
  { title: 'Patient Reviews and Testimonials', description: 'Compilation of patient experiences and success stories', type: 'video', url: 'https://www.youtube.com/embed/YQHsXMglC9A', is_featured: 0, display_order: 10 }
];

const demoPhotos = [
  { title: 'Modern Clinic Interior', description: 'Our welcoming and modern clinic reception area', type: 'image', url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop', is_featured: 1, display_order: 11 },
  { title: 'Treatment Room Setup', description: 'Comfortable and clean treatment consultation room', type: 'image', url: 'https://images.unsplash.com/photo-1631217314831-c6227db76b6e?w=600&h=400&fit=crop', is_featured: 1, display_order: 12 },
  { title: 'Homeopathic Medicines', description: 'Our collection of natural homeopathic remedies', type: 'image', url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde0e?w=600&h=400&fit=crop', is_featured: 0, display_order: 13 },
  { title: 'Patient Waiting Area', description: 'Relaxing and comfortable waiting space for patients', type: 'image', url: 'https://images.unsplash.com/photo-1534545695-c434040ba6cb?w=600&h=400&fit=crop', is_featured: 0, display_order: 14 },
  { title: 'Consultation Setup', description: 'Professional consultation desk with patient records', type: 'image', url: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=600&h=400&fit=crop', is_featured: 0, display_order: 15 },
  { title: 'Medical Equipment', description: 'Modern diagnostic equipment for patient assessment', type: 'image', url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop', is_featured: 0, display_order: 16 },
  { title: 'Clinic Exterior', description: 'Our professional clinic building in Pimple Saudagar', type: 'image', url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=400&fit=crop', is_featured: 0, display_order: 17 },
  { title: 'Health Records Storage', description: 'Secure and organized patient health documentation', type: 'image', url: 'https://images.unsplash.com/photo-1576091160629-112676835b3c?w=600&h=400&fit=crop', is_featured: 0, display_order: 18 },
  { title: 'Sterilization Station', description: 'Medical equipment sterilization and hygiene area', type: 'image', url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=400&fit=crop', is_featured: 0, display_order: 19 },
  { title: 'Doctor\'s Office', description: 'Dr. Shelke\'s professional consultation office', type: 'image', url: 'https://images.unsplash.com/photo-1631217314831-c6227db76b6e?w=600&h=400&fit=crop', is_featured: 0, display_order: 20 }
];

async function addDemoMedia() {
  const connection = await pool.getConnection();
  
  console.log('🎬 Starting to add demo media directly to database...\n');
  
  try {
    console.log('📹 Adding 10 Videos...');
    for (const video of demoVideos) {
      await connection.execute(
        `INSERT INTO media (title, description, type, url, is_featured, display_order, created_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [video.title, video.description, video.type, video.url, video.is_featured, video.display_order, 5]
      );
      console.log(`  ✅ Added: ${video.title}`);
    }
    
    console.log('\n📷 Adding 10 Photos...');
    for (const photo of demoPhotos) {
      await connection.execute(
        `INSERT INTO media (title, description, type, url, is_featured, display_order, created_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [photo.title, photo.description, photo.type, photo.url, photo.is_featured, photo.display_order, 5]
      );
      console.log(`  ✅ Added: ${photo.title}`);
    }
    
    console.log('\n✨ Success! Added 10 videos and 10 photos to the database');
    
    // Verify the data was inserted
    const [result] = await connection.execute('SELECT COUNT(*) as count FROM media');
    console.log(`\n📊 Total media items in database: ${result[0].count}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('💾 DB Connection details:');
    console.error(`  Host: ${process.env.DB_HOST}`);
    console.error(`  User: ${process.env.DB_USER}`);
    console.error(`  Database: ${process.env.DB_NAME}`);
    process.exit(1);
  } finally {
    connection.release();
    pool.end();
    process.exit(0);
  }
}

addDemoMedia();
