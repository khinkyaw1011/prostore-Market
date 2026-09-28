'use server'
import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg";
import { convertToPlainObject } from "../utils";
import { LATEST_PRODUCTS_LIMIT } from "../constants";
//get latest products

export async function getLatestProducts() {
   
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

    const data=await prisma.product.findMany({
        take :LATEST_PRODUCTS_LIMIT,
        orderBy:{createdAt:'desc'}
    });
    return convertToPlainObject(data);
}