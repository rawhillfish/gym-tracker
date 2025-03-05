const mongoose = require('mongoose');
const CompletedWorkout = require('./models/CompletedWorkout');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/gym-tracker')
  .then(async () => {
    console.log('MongoDB Connected');
    
    try {
      // Get the old collection
      const oldCollection = mongoose.connection.db.collection('workouts');
      
      // Find all documents in the old collection
      const oldWorkouts = await oldCollection.find({}).toArray();
      console.log(`Found ${oldWorkouts.length} workouts in the old collection`);
      
      if (oldWorkouts.length > 0) {
        // Insert the documents into the new collection
        const result = await mongoose.connection.db.collection('completedworkouts').insertMany(oldWorkouts);
        console.log(`Migrated ${result.insertedCount} workouts to the new collection`);
      }
      
      // Optionally, drop the old collection
      // Uncomment the next line if you want to drop the old collection
      // await mongoose.connection.db.dropCollection('workouts');
      // console.log('Dropped the old workouts collection');
      
      console.log('Migration completed successfully');
    } catch (error) {
      console.error('Error during migration:', error);
    } finally {
      mongoose.connection.close();
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
