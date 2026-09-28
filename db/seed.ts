import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';
import sampleData from './sample-data';

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  // Clear existing records in the database
  await prisma.product.deleteMany();

  // Seed sample products into the product table
  await prisma.product.createMany({
    data: sampleData.products,
  });

  console.log('Database seeded successfully!');
}

main();