import { storage } from './storage';

async function seedTestUser() {
  try {
    // Check if test user already exists
    const existingUser = await storage.getUserByEmail('test@example.com');
    
    if (!existingUser) {
      console.log('Creating test user...');
      
      // Create a test user
      const testUser = await storage.createUser({
        email: "test@example.com",
        password: "password", // In a real app, this would be hashed
        stageName: "DJ Blaze",
        phone: "(555) 123-4567",
        location: "Los Angeles, CA",
        businessName: "Blaze Entertainment LLC",
        taxId: "XX-XXXXXXX",
        businessAddress: "123 Music Lane, Los Angeles, CA 90001",
        website: "https://djblaze.com",
        paymentTerms: "Net 14 days",
        paymentMethod: "Bank Transfer",
        paymentInstructions: "Please transfer the full amount to:\nAccount Name: Blaze Entertainment LLC\nBank: First National Bank\nAccount: XXXX-XXXX-XXXX-1234\nRouting: XXXXXXXXX"
      });
      
      console.log('Test user created successfully:', testUser.id);
      
      // Create a sample client for test user
      const sampleClient = await storage.createClient({
        userId: testUser.id,
        name: "Groove Lounge",
        email: "bookings@groovelounge.com",
        phone: "(555) 987-6543",
        type: "Nightclub",
        notes: "Regular weekly gig every Friday. Contact manager Lucy for setup details.",
        tags: ["nightclub", "regular", "friday"]
      });
      
      console.log('Sample client created successfully:', sampleClient.id);
      
      // Create a sample gig for test user
      const nextFriday = new Date();
      nextFriday.setDate(nextFriday.getDate() + (5 + 7 - nextFriday.getDay()) % 7);
      
      const sampleGig = await storage.createGig({
        userId: testUser.id,
        clientId: sampleClient.id,
        title: "Friday Night at Groove Lounge",
        date: nextFriday,
        startTime: "21:00",
        endTime: "02:00",
        location: "123 Beat Street, Downtown",
        fee: 350,
        notes: "Bring extra controller. VIP event - dress code is black attire.",
        reminderSet: true
      });
      
      console.log('Sample gig created successfully:', sampleGig.id);
    } else {
      console.log('Test user already exists, skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding test user:', error);
  }
}

export { seedTestUser };