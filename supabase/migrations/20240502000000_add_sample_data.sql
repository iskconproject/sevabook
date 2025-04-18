-- Insert sample inventory data
INSERT INTO public.inventory (
  name,
  category,
  language,
  price,
  stock,
  description
) VALUES 
  (
    'Bhagavad Gita As It Is',
    'books',
    'english',
    250.00,
    45,
    'The Bhagavad Gita As It Is is a translation and commentary of the Bhagavad Gita by A. C. Bhaktivedanta Swami Prabhupada, founder of the International Society for Krishna Consciousness (ISKCON).'
  ),
  (
    'Bhagavad Gita As It Is',
    'books',
    'bengali',
    220.00,
    32,
    'The Bhagavad Gita As It Is is a translation and commentary of the Bhagavad Gita by A. C. Bhaktivedanta Swami Prabhupada, founder of the International Society for Krishna Consciousness (ISKCON).'
  ),
  (
    'Bhagavad Gita As It Is',
    'books',
    'hindi',
    230.00,
    28,
    'The Bhagavad Gita As It Is is a translation and commentary of the Bhagavad Gita by A. C. Bhaktivedanta Swami Prabhupada, founder of the International Society for Krishna Consciousness (ISKCON).'
  ),
  (
    'Sri Chaitanya Charitamrita',
    'books',
    'english',
    450.00,
    15,
    'Sri Chaitanya Charitamrita is a biography of Chaitanya Mahaprabhu written by Krishna das Kaviraja Goswami in the late 16th century.'
  ),
  (
    'Incense Sticks (Sandalwood)',
    'incense',
    'none',
    50.00,
    120,
    'High-quality sandalwood incense sticks for temple offerings and home worship.'
  ),
  (
    'Deity Dress (Small)',
    'clothing',
    'none',
    350.00,
    8,
    'Beautiful handcrafted dress for small deities, made with high-quality materials.'
  ),
  (
    'Tulasi Mala',
    'jewelry',
    'none',
    150.00,
    25,
    'Sacred Tulasi wood prayer beads used for japa meditation.'
  ),
  (
    'Srimad Bhagavatam (Set)',
    'books',
    'english',
    3500.00,
    5,
    'Complete set of Srimad Bhagavatam translated by A. C. Bhaktivedanta Swami Prabhupada.'
  ),
  (
    'Ghee Lamp (Brass)',
    'puja',
    'none',
    250.00,
    15,
    'Traditional brass lamp for offering ghee during puja ceremonies.'
  ),
  (
    'Krishna Murti (8 inch)',
    'deities',
    'none',
    1200.00,
    7,
    'Beautiful brass murti of Lord Krishna in His tribhanga pose.'
  );
