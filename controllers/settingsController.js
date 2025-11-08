const Settings = require("../models/settingsSchema");

const getSettings = async (req, res) => {
    try {
        const currentSettings = await Settings.find({}, '-_id');
        res.status(200).json({ message: "Fetched successfully!", data: currentSettings});
    } catch (error) {
        console.error("Error fetching settings:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const putSettings = async (req, res) => {
    try {
        const { darkMode } = req.body;
        if (typeof darkMode !== "boolean") {
            return res.status(400).json({ message: "Invalid value for darkMode. Expected true or false." });
        }

        const editedSettings = await Settings.findOneAndUpdate(
            {}, 
            { darkMode: darkMode },
            { new: true } 
        );
    if (!editedSettings) {
        const newSettings = await Settings.create({ darkMode: darkMode });
        return res.status(201).json({ message: "Settings created successfully!", data: newSettings });
    }

    res.status(200).json({ message: "Settings updated successfully!", data: editedSettings });
    } catch (error) {
    console.error("Error editing settings:", error);
    res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = {
    getSettings,
    putSettings,
}