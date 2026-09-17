-- Insert 10 demo videos
INSERT INTO media (title, description, type, url, thumbnail_url, is_featured, display_order, created_by, created_at, updated_at) VALUES
('Homeopathy Treatment Success Story', 'Patient shares their transformation journey with homeopathic treatment', 'video', 'https://www.youtube.com/embed/dQw4w9WgXcQ', NULL, 1, 1, 5, NOW(), NOW()),
('Dr. Consultation Session', 'Watch a typical consultation with Dr. Shelke', 'video', 'https://www.youtube.com/embed/9bZkp7q19f0', NULL, 1, 2, 5, NOW(), NOW()),
('Chronic Pain Relief Case', 'Patient testimonial: Relief from chronic back pain through homeopathy', 'video', 'https://www.youtube.com/embed/jNQXAC9IVRw', NULL, 0, 3, 5, NOW(), NOW()),
('Skin Condition Improvement', 'Before and after: Eczema treatment results with natural remedies', 'video', 'https://www.youtube.com/embed/AyICrDYcwME', NULL, 0, 4, 5, NOW(), NOW()),
('Clinic Tour and Facilities', 'Take a virtual tour of our modern homeopathic clinic', 'video', 'https://www.youtube.com/embed/aqz-KE-bpKQ', NULL, 0, 5, 5, NOW(), NOW()),
('Women''s Health Treatment', 'Success story: PCOS and hormonal balance management', 'video', 'https://www.youtube.com/embed/mPNWJjw7R98', NULL, 0, 6, 5, NOW(), NOW()),
('Allergy Management Session', 'How homeopathy helps manage seasonal allergies naturally', 'video', 'https://www.youtube.com/embed/OPf0YbXqDm0', NULL, 0, 7, 5, NOW(), NOW()),
('Child Immunity Boost Program', 'Strengthening children''s immunity through homeopathic care', 'video', 'https://www.youtube.com/embed/xfbb_IvR6Ls', NULL, 0, 8, 5, NOW(), NOW()),
('Digestive Health Treatment', 'Natural solutions for IBS and digestive issues', 'video', 'https://www.youtube.com/embed/IZ_bWhDZd5I', NULL, 0, 9, 5, NOW(), NOW()),
('Patient Reviews and Testimonials', 'Compilation of patient experiences and success stories', 'video', 'https://www.youtube.com/embed/YQHsXMglC9A', NULL, 0, 10, 5, NOW(), NOW());

-- Insert 10 demo photos
INSERT INTO media (title, description, type, url, thumbnail_url, is_featured, display_order, created_by, created_at, updated_at) VALUES
('Modern Clinic Interior', 'Our welcoming and modern clinic reception area', 'image', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop', NULL, 1, 11, 5, NOW(), NOW()),
('Treatment Room Setup', 'Comfortable and clean treatment consultation room', 'image', 'https://images.unsplash.com/photo-1631217314831-c6227db76b6e?w=600&h=400&fit=crop', NULL, 1, 12, 5, NOW(), NOW()),
('Homeopathic Medicines', 'Our collection of natural homeopathic remedies', 'image', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde0e?w=600&h=400&fit=crop', NULL, 0, 13, 5, NOW(), NOW()),
('Patient Waiting Area', 'Relaxing and comfortable waiting space for patients', 'image', 'https://images.unsplash.com/photo-1534545695-c434040ba6cb?w=600&h=400&fit=crop', NULL, 0, 14, 5, NOW(), NOW()),
('Consultation Setup', 'Professional consultation desk with patient records', 'image', 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=600&h=400&fit=crop', NULL, 0, 15, 5, NOW(), NOW()),
('Medical Equipment', 'Modern diagnostic equipment for patient assessment', 'image', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop', NULL, 0, 16, 5, NOW(), NOW()),
('Clinic Exterior', 'Our professional clinic building in Pimple Saudagar', 'image', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=400&fit=crop', NULL, 0, 17, 5, NOW(), NOW()),
('Health Records Storage', 'Secure and organized patient health documentation', 'image', 'https://images.unsplash.com/photo-1576091160629-112676835b3c?w=600&h=400&fit=crop', NULL, 0, 18, 5, NOW(), NOW()),
('Sterilization Station', 'Medical equipment sterilization and hygiene area', 'image', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=400&fit=crop', NULL, 0, 19, 5, NOW(), NOW()),
('Doctor''s Office', 'Dr. Shelke''s professional consultation office', 'image', 'https://images.unsplash.com/photo-1631217314831-c6227db76b6e?w=600&h=400&fit=crop', NULL, 0, 20, 5, NOW(), NOW());
