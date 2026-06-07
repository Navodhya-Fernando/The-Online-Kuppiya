const path = require('path');
const dotenv = require('dotenv');

let loaded = false;

const loadEnv = () => {
  if (loaded) {
    return;
  }

  dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
  loaded = true;
};

module.exports = loadEnv;