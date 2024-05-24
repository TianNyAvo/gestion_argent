var mouvementService = require('./mouvement.service');

exports.insertMouvement = async (req, res) => {
    try {
        const mouvement = req.body;
        const result = await mouvementService.insertMouvement(mouvement);
        return result;
    } catch (error) {
        console.error('Error inserting mouvement:', error);
        res.status(500).json({ error: error });
    }
};

exports.getById = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await mouvementService.getById(id);
        return result;
    } catch (error) {
        console.error('Error getting mouvement by id:', error);
        res.status(500).json({ error: error });
    }
};

exports.updateMouvement = async (req, res) => {
    try {
        const mouvement = req.body;
        const result = await mouvementService.UpdateMouvement(mouvement);
        return result;
    } catch (error) {
        console.error('Error updating mouvement:', error);
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

exports.getTotalInputsAndOutputs = async (req,res) => {
    try {
        const year = req.body.year;
        const result = await mouvementService.getTotalInputsAndOutputs(year);
        return result;
    }
    catch (error) {
        console.log('Error getting TotalInputsAndOutputs', error);
    }
};

exports.getTotalInputsOutputsByYear = async (req, res) => {
    try {
        const result = await mouvementService.getTotalInputsOutputsByYear();
        return result;
    }
    catch (error) {
        console.log('Error getting TotalInputsOutputsByYear', error);
    }
};

exports.getDepensesByYear = async (req, res) => {
    try {
        var year = "";
        if (req.body.year != "" && req.body.year != null) {
            year = req.body.year;
        }
        else {
            year = new Date().getFullYear();
        }
        const result = await mouvementService.getDepensesByYear(year);
        return result;
    }
    catch (error) {
        console.log('Error getting DepensesByYear', error);
    }
};

exports.getAllCotisationsByYear = async (req, res) => {
    try {
        var year = "";
        if (req.body.year != "" && req.body.year != null) {
            year = req.body.year;
        }
        else {
            year = new Date().getFullYear();
        }
        const result = await mouvementService.getAllCotisationsByYear(year);
        return result;
    }
    catch (error) {
        console.log('Error getting AllCotisationsByYear', error);
    }
};

exports.getAnnexesByYear = async (req, res) => {
    try {
        var year = "";
        if (req.body.year != "" && req.body.year != null) {
            year = req.body.year;
        }
        else {
            year = new Date().getFullYear();
        }
        const result = await mouvementService.getAnnexeByYear(year);
        return result;
    }
    catch (error) {
        console.log('Error getting AnnexesByYear', error);
    }
};