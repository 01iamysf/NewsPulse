const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const ADMIN_USER = {
  name: 'Admin',
  email: 'admin@newspulse.com',
  password: 'Admin@123456',
  role: 'admin'
};

async function seedAdmin() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/newspulse';
    
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const existingAdmin = await User.findOne({ email: ADMIN_USER.email });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log('\n💡 To reset the admin password, delete the user and run this script again.');
    } else {
      const hashedPassword = await bcrypt.hash(ADMIN_USER.password, 12);
      
      const admin = new User({
        name: ADMIN_USER.name,
        email: ADMIN_USER.email,
        password: hashedPassword,
        role: ADMIN_USER.role
      });

      await admin.save();
      console.log('✅ Admin user created successfully!');
      console.log('\n📋 Admin Credentials:');
      console.log(`   Email:    ${ADMIN_USER.email}`);
      console.log(`   Password: ${ADMIN_USER.password}`);
      console.log('\n⚠️  Please change the password after first login!');
    }

    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
    process.exit(1);
  }
}

seedAdmin();
