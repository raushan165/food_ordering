const mongoose = require('mongoose');

async function fix() {
  await mongoose.connect('mongodb://localhost:27017/food_ordering');
  const collection = mongoose.connection.collection('fooditems');
  await collection.updateOne(
    { name: 'Masala Dosa' },
    { $set: { imageUrl: '/masala_dosa.png' } }
  );
  console.log('Fixed DB image for Dosa');
  process.exit(0);
}

fix();
