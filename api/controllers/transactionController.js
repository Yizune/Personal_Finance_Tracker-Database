const Transaction = require("../models/transactionSchema");

const getSortingFilter = async (req, res) => {
    try {
        const { sort } = req.query;

        let sortOption;
        if (sort === 'asc') {
            sortOption = { amount: -1 };
        } else if (sort === 'desc') {
            sortOption = { amount: 1 }; 
        }

        const transactions = await Transaction.find({}, '-_id').sort(sortOption);

        // Return empty array instead of 404 when no transactions exist
        res.status(200).json({ message: "Fetched successfully!", data: transactions || [] });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



// Fetching the entire transactions database
const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({}, '-_id'); // Excludes the _id field
        res.status(200).json({ message: "Fetched successfully!", data: transactions || []});
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getSingleTransaction = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const singleTransaction = await Transaction.findOne({ id: id }, '-_id'); // Excludes the _id field
        res.status(200).json({ message: "Fetched successfully!", data: singleTransaction});

        if (!singleTransaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getFilteredTransactions = async (req, res) => {
    try {
        const { type, category } = req.query;

        if (!type && !category) {
            return res.status(400).json({ message: "At least one filter parameter must be provided" });
        }

        if (type && type !== 'income' && type !== 'expense') {
            return res.status(400).json({ message: "Invalid." });
        }

        const filter = {};
        if (type) filter.type = type;
        if (category) filter.category = category;

        const transactions = await Transaction.find(filter, '-_id');

        // Return empty array instead of 404 when no transactions match filters
        res.status(200).json({ message: "Fetched successfully!", data: transactions || [] });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const postTransaction = async (req, res) => {
    try {
        const { type, amount, category, date, description } = req.body;
        if (!type || !amount || !category || !date) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const lastTransaction = await Transaction.findOne().sort({ id: -1 })
        console.log("Last transaction:", lastTransaction);

        const newTransaction = new Transaction({
            id: lastTransaction ? lastTransaction.id + 1 : 1,
            type,
            amount,
            category,
            date,
            description,
        });

        console.log("New transaction to save:", newTransaction);

        const savedTransaction = await newTransaction.save();

        const configuredTransaction = await Transaction.findById(savedTransaction._id, '-_id'); // To exclude _id from being added into the table

        res.status(200).json({ message: "Posted successfully!", data: configuredTransaction });
    } catch (error) {
        console.error("Error posting a transaction:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const putTransaction = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { type, amount, category, date, description } = req.body;

        if (!id || !type || !amount || !category || !date || !description) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const updatedTransaction = await Transaction.findOneAndUpdate(
            { 
                id: parseInt(id) 
            },
            { 
                type, 
                amount, 
                category, 
                date, 
                description 
            },
            { new: true }
        );

        if (!updatedTransaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        res.status(200).json({ message: "Transaction updated successfully!", data: updatedTransaction });
    } catch (error) {
        console.error("Error editing a transaction:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const deleteTransaction = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }

        const deletedTransactions = await Transaction.deleteMany({ id: { $in: ids } });

        if (deletedTransactions.deletedCount === 0) {
            return res.status(404).json({ message: "No transactions found to delete." });
        }
        res.status(200).json({ message: "Transaction(s) deleted successfully!", data: deletedTransactions });
    } catch (error) {
        console.error("Error deleting a transaction:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = {
    getTransactions,
    getFilteredTransactions,
    getSortingFilter,
    getSingleTransaction,
    postTransaction,
    putTransaction,
    deleteTransaction,
};