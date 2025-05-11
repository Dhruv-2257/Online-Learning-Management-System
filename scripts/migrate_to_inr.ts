import { db } from "../db";
import * as schema from "../shared/schema";
import { eq } from "drizzle-orm";


async function migrateToINR() {
  try {
    console.log("Starting price migration from USD to INR...");

    // Get all courses
    const courses = await db.select().from(schema.courses);
    
    for (const course of courses) {
      if (course.price === "0") {
       
        console.log(`Course "${course.title}" is free, keeping as is.`);
        continue;
      }
      
      
      const priceString = typeof course.price === 'string' ? course.price : "0";
      const usdPrice = parseFloat(priceString);
     
      const inrPrice = Math.round(usdPrice * 84);
      
      
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