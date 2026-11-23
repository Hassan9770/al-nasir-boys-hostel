import { env, assertEnv } from './config/env.js';
assertEnv();
const { connectDB } = await import('./config/db.js');
const { default: app } = await import('./app.js');
await connectDB();
app.listen(env.port, () => console.log(`API running on http://localhost:${env.port}`));
