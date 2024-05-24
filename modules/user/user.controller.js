var userServices = require('./user.service')

exports.insertUser = async (req, res) => {
    try {
        const user = req.body;
        const result = await userServices.insertUser(user);
        return result;
        // res.status(200).json(result);
    } catch (error) {
        console.error('Error inserting user:', error);
        res.status(500).json({ error: error });
    }
}

exports.loginUser = async (req, res) => {
    try {
        const user = req.body;
        const result = await userServices.loginUser(user);
        // console.log('Result:', result);
        // return result;
        res.status(200).json(result);
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: error });
    }
}

exports.getAllUserCotisation = async (req, res) => {
    try {
        var year = "";
        if (req.body.year != "" && req.body.year != null) {
            year = Number.parseInt(req.body.year);
            console.log("year", year);
        }
        else {
            year = new Date().getFullYear();
            console.log("year", year);
        }
        const result = await userServices.getAllUserCotisation(year);
        return result;
    } catch (error) {
        console.error('Error getting all user cotisation:', error);
        res.status(500).json({ error: error });
    }
};

exports.getUserMovementsByYear = async (req, res) => {
    try {
        var year = "";
        if (req.body.year != "" && req.body.year != null) {
            year = req.body.year;
        }
        else {
            year = new Date().getFullYear();
        }
        const result = await userServices.getUserMovementsByYear(year); 
        return result;
        // res.status(200).json(result);
    } catch (error) {
        console.error('Error getting user movements by year controller:', error);
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
        const result = await userServices.getUserMovementsByMonthYear(month, year);
        return result;
    } catch (error) {
        console.error('Error getting user movements by year controller:', error);
        res.status(500).json({ error: error });
    }
};

exports.getUnpaidUserMovementsByMonthYear = async (req, res) => {
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
        const result = await userServices.getUnpaidUserMovementsByMonthYear(month, year);
        return result;
    } catch (error) {
        console.error('Error getting user movements by year controller:', error);
        res.status(500).json({ error: error });
    }
};