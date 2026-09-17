const API_BASE_URL = 'http://localhost:3001';

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

async function addMediaItem(item) {
  try {
    const response = await fetch(`${API_BASE_URL}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, created_by: 5 })
    });
    
    const text = await response.text();
    
    if (response.ok) {
      console.log(`✅ Added: ${item.title} (${item.type})`);
      return true;
    } else {
      console.error(`❌ Failed to add ${item.title}: Status ${response.status} - ${text}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Failed to add ${item.title}:`, error.message);
    return false;
  }
}

async function addAllDemoMedia() {
  console.log('\n🎬 Starting to add demo media...\n');
  
  let videosAdded = 0;
  let photosAdded = 0;

  console.log('📹 Adding 10 Videos...');
  for (const video of demoVideos) {
    const success = await addMediaItem(video);
    if (success) videosAdded++;
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n📷 Adding 10 Photos...');
  for (const photo of demoPhotos) {
    const success = await addMediaItem(photo);
    if (success) photosAdded++;
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n✨ Success! Added ${videosAdded} videos and ${photosAdded} photos\n`);
}

addAllDemoMedia().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
