const dotenv = require('dotenv');

dotenv.config({ path: './config.env' }); //sets environment variables
const app = require('./app');

const PORT = process.env.PORT;
// console.log(process.env);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
