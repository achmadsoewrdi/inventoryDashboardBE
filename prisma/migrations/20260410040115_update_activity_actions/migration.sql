/*
  Warnings:

  - The values [STOCK_ADJUSTED,PRODUCT_ADDED,PRODUCT_UPDATED,ORDER_MARKED,LOCATION_UPDATED] on the enum `ActivityLog_action` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `activitylog` MODIFY `action` ENUM('CREATE_PRODUCT', 'UPDATE_PRODUCT', 'DELETE_PRODUCT', 'ADJUST_STOCK') NOT NULL;
