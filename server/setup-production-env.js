const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Create a production environment file
console.log('Setting up production environment file...');

rl.question('Enter your MongoDB Atlas connection string: ', (mongoUri) => {
  const envContent = `MONGODB_URI=${mongoUri}
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://gym-tracker-rawhillfish.netlify.app
`;

  fs.writeFileSync(path.join(__dirname, '.env.production'), envContent);
  console.log('Production environment file created successfully!');
  rl.close();
});
