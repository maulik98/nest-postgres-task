import { UserSeeder } from './user.seed';
import datasourceConfig from '../../datasource.config';

async function runSeeders() {
  await datasourceConfig.initialize();

  console.log('Running UserSeeder...');
  await UserSeeder(datasourceConfig);

  console.log('Seeding complete!');
  await datasourceConfig.destroy();
}

runSeeders().catch((err) => console.error('Seeder failed:', err));
