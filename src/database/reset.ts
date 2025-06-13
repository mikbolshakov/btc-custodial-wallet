import { dataSource } from './data-source';

async function resetDatabase() {
  try {
    await dataSource.initialize();
    await dataSource.dropDatabase();
    console.log('Can generate a fresh migration');
    await dataSource.destroy();
  } catch (err) {
    console.error('Error during reset:', err);
    process.exit(1);
  }
}

void resetDatabase();
