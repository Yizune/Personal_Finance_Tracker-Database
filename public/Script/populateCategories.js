const mongoose = require("mongoose");
const Transaction = require('../../models/transactionSchema'); 
const Category = require('../../models/categoriesSchema'); 
const connectDB = require('../../config/connection');

(async () => {
  try {
    await connectDB();

    console.log("Connected to the database!");

    const uniqueCategories = await Transaction.distinct("category");
    console.log("Unique Categories Found:", uniqueCategories);

    const categoriesWithIds = uniqueCategories.map((category, index) => ({
      id: index + 1,
      category,
    }));

    console.log("Categories with IDs:", categoriesWithIds);

    await Category.insertMany(categoriesWithIds, { ordered: true });
    console.log("Categories populated successfully!");

    mongoose.connection.close();
  } catch (error) {
    console.error("Error populating categories:", error);
    mongoose.connection.close();
  }
})();