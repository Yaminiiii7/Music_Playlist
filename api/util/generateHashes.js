
import { hash } from './auth.js'; // adjust path if needed

const run = async () => {
  const plainPasswords = ['password123', 'password123'];
  
  for (let password of plainPasswords) {
    const hashed = await hash(password);
    console.log(`${password} -> ${hashed}`);
  }
};

run();
