import * as dashboardModel from "../models/dashboard.model.js";

/**
 * Get dashboard counts for the authenticated user
 */
export const getDashboardCounts = async (req, res) => {
  try {
    let userId = req.user.id;
    const { studentId } = req.query;
    
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    // Get user type from the authenticated user
    const userType = req.user.usertype || 'Teacher'; // Default to Teacher if not specified

    if (userType === "Student") {
      if (!studentId) {
        return res.status(400).json({ error: "Student ID Required" });
      }
      userId = studentId;
    }
    
    // Validate user type
    const validUserTypes = ['Student', 'Teacher', 'Staff Admin'];
    if (!validUserTypes.includes(userType)) {
      return res.status(400).json({ error: "Invalid user type" });
    }
    
    const counts = await dashboardModel.getDashboardCounts(userId, userType);
    res.json(counts);
  } catch (error) {
    console.error('Dashboard counts fetch error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Mark a dashboard item as viewed by the user
 */
export const markAsViewed = async (req, res) => {
  try {
    const { item_type, item_id } = req.body;
    let userId = req.user.id;    
    const { studentId } = req.query;
    const userType = req.user.usertype || 'Teacher';
    
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (userType === "Student") {
      if (!studentId) {
        return res.status(400).json({ error: "Student ID Required" });
      }
      userId = studentId;
    }
    
    if (!item_type) {
      return res.status(400).json({ error: "Item type is required" });
    }
    
    if (item_id) {
      // Mark specific item as viewed
      await dashboardModel.markItemAsViewed(userId, userType, item_type, item_id);
    } else {
      // Mark all items of this type as viewed (menu level)
      return res.status(400).json({ error: "Item ID is required for specific item viewing" });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Mark as viewed error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get last viewed timestamp for dashboard items
 */
export const getLastViewed = async (req, res) => {
  try {
    const { item_type, item_id } = req.query;
    let userId = req.user.id;
    const { studentId } = req.query;
    const userType = req.user.usertype || 'Teacher';
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (userType === "Student") {
      if (!studentId) {
        return res.status(400).json({ error: "Student ID Required" });
      }
      userId = studentId;
    }
    
    if (!item_type) {
      return res.status(400).json({ error: "Item type is required" });
    }
    
    const lastViewed = await dashboardModel.getLastViewed(userId, item_type, item_id);
    res.json({ data: lastViewed });
  } catch (error) {
    console.error('Get last viewed error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Mark multiple items as viewed (for bulk operations)
 */
export const markMultipleAsViewed = async (req, res) => {
  try {
    const { items } = req.body; // Array of { item_type, item_id }
    const userId = req.user.id;
    const userType = req.user.usertype || 'Teacher';
    
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "Items array is required" });
    }
    
    // Mark each item as viewed
    for (const item of items) {
      if (item.item_type && item.item_id) {
        await dashboardModel.markItemAsViewed(userId, userType, item.item_type, item.item_id);
      }
    }
    
    res.json({ success: true, count: items.length });
  } catch (error) {
    console.error('Mark multiple as viewed error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getDailyNotifications = async (req, res) => {
  try {
    let userId = req.user.id;
    const { studentId, date } = req.query;
    const userType = req.user.usertype || 'Teacher';
    
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    if (userType === "Student") {
      if (!studentId) {
        return res.status(400).json({ error: "Student ID Required" });
      }
      userId = studentId;
    }
    
    const notifications = await dashboardModel.getDailyNotifications(userId, userType, date);
    
    res.json({
      success: true,
      count: notifications.length,
      date: date || new Date().toISOString().split('T')[0],
      notifications
    });
    
  } catch (error) {
    console.error('Get daily notifications error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get replies for a specific message with hierarchy
 */
export const getMessageReplies = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { item_type, studentId } = req.query;
    let userId = req.user.id;
    const userType = req.user.usertype || 'Teacher';
    
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    if (userType === "Student") {
      if (!studentId) {
        return res.status(400).json({ error: "Student ID Required" });
      }
      userId = studentId;
    }
    
    if (!item_type || !itemId) {
      return res.status(400).json({ error: "Item type and item ID are required" });
    }
    
    const replies = await dashboardModel.getMessageReplies(itemId, item_type, userId, userType);
    
    res.json({
      success: true,
      replies
    });
    
  } catch (error) {
    console.error('Get message replies error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Add a reply to a message
 */
export const addMessageReply = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { item_type, message_text, parent_id } = req.body;
    const { studentId } = req.query;
    let userId = req.user.id;
    const userType = req.user.usertype || 'Teacher';
    
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    if (userType === "Student") {
      if (!studentId) {
        return res.status(400).json({ error: "Student ID Required" });
      }
      userId = studentId;
    }
    
    if (!item_type || !message_text) {
      return res.status(400).json({ error: "Item type and message text are required" });
    }
    
    const reply = await dashboardModel.addMessageReply(
      itemId, 
      item_type, 
      userId, 
      userType, 
      message_text, 
      parent_id
    );
    
    res.json({
      success: true,
      reply
    });
    
  } catch (error) {
    console.error('Add message reply error:', error);
    res.status(500).json({ error: error.message });
  }
};