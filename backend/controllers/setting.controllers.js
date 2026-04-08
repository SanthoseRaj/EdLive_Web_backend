import * as setting from "../models/setting.model.js";


export const getDashBoardElements = async (req, res) => {
    try {
        const getDashBoardElements = await setting.getDashBoardElements();
        res.json(getDashBoardElements);
    } catch (error) {
        res.status(500).json({ error: 'DashBoard Element error' });
    }
}
export const getUserDashBoard = async (req, res) => {
    try {
        const getUserDashBoard = await setting.getUserDashBoard(req.user.id);
        res.json(getUserDashBoard);
    } catch (error) {
        res.status(500).json({ error: 'User DashBoard Error' });
    }    
}
export const updateUserDashBoard = async(req, res)=> {
    try {
        const userId = req.user.id;
        const { element_key, is_enabled } = req.body;
        //const delUserDashBoard = setting.delUserDashBoard(userId);
        if (!element_key || typeof is_enabled !== 'boolean') {
            return res.status(400).json({ error: 'Invalid request body. Requires element_key and is_enabled' });
        }
        const updatedSetting = await setting.updateUserDashBoard(
            userId,
            element_key,
            is_enabled,
            // If you need to maintain position, you might want to fetch current position first
            // For now assuming position remains unchanged
            null // or pass current position if needed
        );
        res.json({
            success: true,
            message: 'Setting updated successfully',
            data: updatedSetting
        });

    } catch (err) {
        console.error('Error updating dashboard setting:', err);
        res.status(500).json({ 
            error: err.message,
            success: false 
        });
    }
}