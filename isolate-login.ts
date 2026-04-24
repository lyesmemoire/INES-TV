import { prisma } from './server/services/db';
import bcrypt from 'bcryptjs';

async function test() {
  console.time('findUnique');
  const user = await prisma.user.findUnique({ where: { email: "test@streamperf.com" } });
  console.timeEnd('findUnique');
  
  if (!user) return console.log('user not found');
  
  console.time('bcrypt');
  const match = await bcrypt.compare('testpassword123', user.passwordHash!);
  console.timeEnd('bcrypt');
  
  console.log('Match?', match);
}
test().catch(e => console.error(e)).finally(() => process.exit());
