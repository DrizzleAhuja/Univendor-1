import { db } from "../db";
import { orders, orderItems } from "@shared/schema";

async function clearOrders() {
  try {
    // First delete all order items
    await db.delete(orderItems);
    // Then delete all orders
    await db.delete(orders);
    console.log("Successfully cleared all orders and order items");
  } catch (error) {
    console.error("Error clearing orders:", error);
  } finally {
    process.exit();
  }
}

clearOrders(); 