import { db } from "../db";
import * as schema from "../shared/schema";
import { eq } from "drizzle-orm";

/**
 * This script updates all course prices from USD to INR
 * Uses an approximate conversion rate of 1 USD = 84 INR
 */
async function migrateToINR() {
  try {
    console.log("Starting price migration from USD to INR...");

    // Get all courses
    const courses = await db.select().from(schema.courses);
    
    for (const course of courses) {
      if (course.price === "0") {
        // Keep free courses as is
        console.log(`Course "${course.title}" is free, keeping as is.`);
        continue;
      }
      
      // Make sure price is a string and never null
      const priceString = typeof course.price === 'string' ? course.price : "0";
      const usdPrice = parseFloat(priceString);
      // Convert to INR (approximate rate: 1 USD = 84 INR)
      const inrPrice = Math.round(usdPrice * 84);
      
      // Update the price in the database
      await db.update(schema.courses)
        .set({ price: inrPrice.toString() })
        .where(eq(schema.courses.id, course.id));
      
      console.log(`Updated course "${course.title}" from $${usdPrice} to ₹${inrPrice}`);
    }

    console.log("Price migration completed successfully!");
  } catch (error) {
    console.error("Error migrating prices:", error);
  }
}

migrateToINR();