var mouvementService = require('./mouvement.service');

exports.insertMouvement = async (req, res) => {
    try {
        const mouvement = req.body;
        const result = await mouvementService.insertMouvement(mouvement);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error inserting mouvement:', error);
        res.status(500).json({ error: error });
    }
};

exports.getUserMovementsByMonthYear = async (req, res) => {
    try {
        var month = "";
        if (req.body.month != "" && req.body.month != null) {
            month = req.body.month;
        }
        else {
            month = new Date().getMonth() + 1;
        }
        var year = "";
        if (req.body.year != "" && req.body.year != null) {
            year = req.body.year;
        }
        else {
            year = new Date().getFullYear();
        }
        const result = await mouvementService.getUserMovementsByMonthYear(month, year);
        return result;
        // res.status(200).json(result);
    } catch (error) {
        console.error('Error getting user movements:', error);
        res.status(500).json({ error: error });
    }
};

exports.getSingleUserMovement = async (req, res) => {
    try {
        var user_id = "";
        if (req.body.user_id != "" && req.body.user_id != null) {
            user_id = req.body.user_id;
        }
        else if (req.params.user_id != "" && req.params.user_id != null) {
            user_id = req.params.user_id;
        }
        else{
            return res.status(400).json({ error: "user_id is required" });
        }
        var year = "";
        if (req.body.year != "" && req.body.year != null) {
            year = req.body.year;
        }
        else {
            year = new Date().getFullYear();
        }
        const result = await mouvementService.getSingleUserMovements(user_id, year);
        return result;
    } catch (error) {
        console.error('Error getting single user movement:', error);
        res.status(500).json({ error: error });
    }
};