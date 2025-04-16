// This is a mock implementation of the AI image recognition service
// In a real application, this would integrate with Google Gemini 2.0 or another AI service

export interface RecognizedItem {
  name: string;
  category: string;
  language?: string;
  price?: number;
  description?: string;
  confidence: number;
}

// Mock database of items that the AI can "recognize"
const knownItems: RecognizedItem[] = [
  {
    name: 'Bhagavad Gita As It Is',
    category: 'books',
    language: 'english',
    price: 250,
    description: 'The Bhagavad Gita As It Is is a translation and commentary of the Bhagavad Gita by A. C. Bhaktivedanta Swami Prabhupada, founder of the International Society for Krishna Consciousness (ISKCON).',
    confidence: 0.95
  },
  {
    name: 'Bhagavad Gita As It Is',
    category: 'books',
    language: 'bengali',
    price: 220,
    description: 'The Bhagavad Gita As It Is is a translation and commentary of the Bhagavad Gita by A. C. Bhaktivedanta Swami Prabhupada, founder of the International Society for Krishna Consciousness (ISKCON).',
    confidence: 0.92
  },
  {
    name: 'Sri Chaitanya Charitamrita',
    category: 'books',
    language: 'english',
    price: 450,
    description: 'Sri Chaitanya-charitamrita is the biography of Chaitanya Mahaprabhu written by Krishna das Kaviraja Goswami in the late 16th century.',
    confidence: 0.88
  },
  {
    name: 'Incense Sticks (Sandalwood)',
    category: 'incense',
    price: 50,
    description: 'High-quality sandalwood incense sticks for temple offerings and home worship.',
    confidence: 0.85
  },
  {
    name: 'Japa Mala',
    category: 'puja',
    price: 180,
    description: 'Traditional prayer beads made from Tulsi wood, used for chanting the Hare Krishna mantra.',
    confidence: 0.90
  }
];

// Simulate AI image recognition
export async function recognizeItemFromImage(imageData: string | File): Promise<RecognizedItem | null> {
  // In a real implementation, this would send the image to an AI service
  // For this mock, we'll randomly select an item from our known items
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Randomly select an item (or return null to simulate failure)
  const randomIndex = Math.floor(Math.random() * (knownItems.length + 1));
  
  if (randomIndex === knownItems.length) {
    // Simulate recognition failure
    return null;
  }
  
  return knownItems[randomIndex];
}

// Function to capture image from camera
export async function captureImageFromCamera(): Promise<string | null> {
  // In a real implementation, this would access the device camera
  // For this mock, we'll just return a dummy base64 string
  
  // Simulate camera access delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return a dummy base64 string (in a real app, this would be the actual image data)
  return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKAP/2Q==';
}

// Function to upload an image file
export async function uploadImageFile(file: File): Promise<string | null> {
  // In a real implementation, this would process the uploaded file
  // For this mock, we'll just return a dummy base64 string
  
  // Simulate file processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return a dummy base64 string (in a real app, this would be the actual image data)
  return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKAP/2Q==';
}
