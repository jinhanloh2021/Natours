const mongoose = require('mongoose');
const dotenv = require('dotenv');

//final safety net for syncrhonous uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('Uncaught exception.');
  console.log(err.message, err.name);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Database connected.');
  });

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});

//final safety net for errors from async functions.
process.on('unhandledRejection', (err) => {
  console.log('Unhandled rejection.');
  console.log(err);

  server.close(() => {
    process.exit(1); //end application. Exit with code 1 means error.
  });
});
