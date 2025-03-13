const bcrypt = require('bcryptjs');

module.exports = async (db) => {
  try {
    const adminExists = await db.Admin.findOne({ where: { username: 'admin' } });
    
    if (!adminExists) {
      const password = 'admin123';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      await db.Admin.create({
        username: 'admin',
        password: hashedPassword,
      });
      
      console.log('Default admin account created');
    } else {
      console.log('Admin account already exists, skipping seed');
    }
  } catch (error) {
    console.error('Error seeding admin account:', error);
  }
};