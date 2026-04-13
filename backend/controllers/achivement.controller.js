import * as achievementsModel from "../models/achivement.model.js";

export const achievementCreate = async (req, res) => {
    try {
        const {
            studentId,
            title,
            description,
            categoryId,
            achievementDate,
            awardedBy,
            isVisible = 'private',
            classId,
            academicYearId
        } = req.body;
        
      const imageUrl = req.file ? `/content/uploads/achievement/${req.file.filename}` : null;

        // Validate required fields
        if ( !studentId || !title || !description || !categoryId || !achievementDate) {
            return res.status(400).json({ 
                error: "Missing required fields: studentId, title, description, categoryId, achievementDate" 
            });
        }

        const achievement = await achievementsModel.achievementCreate({
            studentId,
            title,
            description,
            categoryId,
            achievementDate,
            awardedBy,
            imageUrl,
            isVisible,
            classId,
            academicYearId
        });

        res.status(201).json(achievement);
    } catch (error) {
        console.error('Achievement creation error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const achievementFindVisible = async (req, res) => {
    try {
        const user_type = req.user.usertype;
        const user_id = req.user.id;
        const { studentId } = req.query;
        //let studentId = null;

        // For students, get their ID from the authenticated user
        if (user_type === "Teacher") {
            //studentId = null; // Assuming user ID is stored in req.user.id
        }

        // For teachers and students, classId is required
        // if ((user_type === "Teacher" || user_type === "Student") && !classId) {
        //     return res.status(400).json({ 
        //         error: "Class ID is required for teachers and students" 
        //     });
        // }

        const achievement = await achievementsModel.achievementFindVisible(
            studentId,
            user_type,
            user_id
        );

        res.json(achievement);
    } catch (error) {
        console.error('Achievement fetch error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const achievementApprove = async (req, res) => {
    try {
        const { id } = req.params;
        const approved_by = req.user.id; // Assuming authenticated user ID

        // Check if user has admin privileges
        const allowedApprovers = ['admin', 'Staff Admin', 'Class Admin'];
        if (!allowedApprovers.includes(req.user.usertype)) {
            return res.status(403).json({ error: "Only admins can approve achievements" });
        }

        const achievement = await achievementsModel.achievementApprove(id, approved_by);
        
        if (!achievement) {
            return res.status(404).json({ error: 'Achievement not found' });
        }

        res.json(achievement);
    } catch (error) {
        console.error('Achievement approval error:', error);
        res.status(500).json({ error: error.message });
    }
}

export const achievementDelete = async (req, res) => {
    try {
        const { id } = req.params;
        const achievement = await achievementsModel.achievementDelete(id);
        
        if (!achievement) {
            return res.status(404).json({ error: 'Achievement not found' });
        }
        
        res.json({ 
            message: 'Achievement deleted successfully',
            deletedAchievement: achievement 
        });
    } catch (error) {
        console.error('Achievement deletion error:', error);
        res.status(500).json({ error: error.message });
    }
}
