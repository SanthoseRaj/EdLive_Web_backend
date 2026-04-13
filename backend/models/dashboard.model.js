import pool from "../db/connectDB-pg.js";


const getTodosCount = async (userId, userType) => {
  switch (userType) {
    case 'Student':
      return await pool.query(
        `SELECT COUNT(*) FROM todos t
         LEFT JOIN user_dashboard_views udv 
           ON udv.user_id = $1 AND udv.item_type = 'todo' AND udv.item_id = t.id
         WHERE t.class_id IN (SELECT class_id FROM students WHERE id = $1) 
           AND t.completed = false AND udv.id IS NULL`,
        [userId]
      );
    
    case 'Teacher':
      return await pool.query(
        `SELECT COUNT(*) FROM todos t
         LEFT JOIN user_dashboard_views udv 
           ON udv.user_id = $1 AND udv.item_type = 'todo' AND udv.item_id = t.id
         WHERE t.user_id = $1 AND t.completed = false AND udv.id IS NULL`,
        [userId]
      );
    
    case 'Staff Admin':
      return await pool.query(
        `SELECT COUNT(*) FROM todos t
         LEFT JOIN user_dashboard_views udv 
           ON udv.user_id = $1 AND udv.item_type = 'todo' AND udv.item_id = t.id
         WHERE t.completed = false AND udv.id IS NULL`,
        [userId]
      );
    
    default:
      return { rows: [{ count: '0' }] };
  }
};

const getPaymentsCount = async (userId, userType) => {
  switch (userType) {
    case 'Student':
      return await pool.query(
        `SELECT COUNT(*) FROM fee_assignments fe
         LEFT JOIN user_dashboard_views udv 
           ON udv.user_id = $1 AND udv.item_type = 'payments' AND udv.item_id = fe.id
         WHERE fe.class_id  IN (SELECT class_id FROM students WHERE id = $1)   AND udv.id IS NULL`,
        [userId]
      );
    
    case 'Teacher':
      return await pool.query(
        `SELECT COUNT(*) FROM fee_assignments fe
         LEFT JOIN user_dashboard_views udv 
           ON udv.user_id = $1 AND udv.item_type = 'payments' AND udv.item_id = fe.id
         WHERE fe.class_id  IN (SELECT class_id FROM staff WHERE user_id = $1)   AND udv.id IS NULL`,
        [userId]
      );
    
    case 'Staff':
      return await pool.query(
        `SELECT COUNT(*) FROM payments p
         LEFT JOIN user_dashboard_views udv 
           ON udv.user_id = $1 AND udv.item_type = 'payments' AND udv.item_id = p.id
         WHERE p.status = 'pending' AND udv.id IS NULL`,
        [userId]
      );
    
    case 'Staff Admin':
      return await pool.query(
        `SELECT COUNT(*) FROM fee_assignments fe
         LEFT JOIN user_dashboard_views udv 
           ON udv.user_id = $1 AND udv.item_type = 'payments' AND udv.item_id = fe.id
         WHERE  udv.id IS NULL`,
        [userId]
      );
    
    default:
      return { rows: [{ count: '0' }] };
  }
};

const getMessagesCount = async (userId,userType) => {
   switch (userType) {
    case 'Student':
      return await pool.query(
        `SELECT COUNT(*) FROM parent_communications pc
     LEFT JOIN user_dashboard_views udv 
       ON udv.user_id = $1 AND udv.item_type = 'messages' AND udv.item_id = pc.id
     WHERE pc.student_id = $1  AND udv.id IS NULL`,
        [userId]
      );
      case 'Teacher':
      return await pool.query(
        `SELECT COUNT(*) FROM parent_communications pc
     LEFT JOIN user_dashboard_views udv 
       ON udv.user_id = $1 AND udv.item_type = 'messages' AND udv.item_id = pc.id
     WHERE pc.sender_id = $1  AND udv.id IS NULL`,
        [userId]
      );
      case 'Staff Admin':
      return await pool.query(
        `SELECT COUNT(*) FROM parent_communications pc
     LEFT JOIN user_dashboard_views udv 
       ON udv.user_id = $1 AND udv.item_type = 'messages' AND udv.item_id = pc.id
     WHERE pc.sender_id = $1  AND udv.id IS NULL`,
        [userId]
      );
   default:
      return { rows: [{ count: '0' }] };
  }
};

const getLibraryCount  = async (userId, userType) => {
  switch (userType) {
    case 'Student':
      return await pool.query(
        `SELECT COUNT(*) FROM checkouts c
     JOIN library_members lm ON c.member_id = lm.id
     LEFT JOIN user_dashboard_views udv 
       ON udv.user_id = $1 AND udv.item_type = 'library' AND udv.item_id = c.id
     WHERE lm.user_id = $1 AND c.return_date IS NULL and lm.user_type='student' 
       AND c.due_date < CURRENT_DATE AND udv.id IS NULL`,
        [userId]
      );
    
    case 'Teacher':
      return await pool.query(
        `SELECT COUNT(*) FROM checkouts c
     JOIN library_members lm ON c.member_id = lm.id
     LEFT JOIN user_dashboard_views udv 
       ON  udv.item_type = 'library' AND udv.item_id = c.id
       JOIN students s ON lm.user_id = s.id
                JOIN staff st ON s.class_id = st.class_id
     WHERE st.user_id = $1 AND c.return_date IS NULL and lm.user_type='student' 
       AND c.due_date < CURRENT_DATE AND udv.id IS NULL`,
        [userId]
      );
    
    case 'Staff':
      return await pool.query(
        `SELECT COUNT(*) FROM payments p
         LEFT JOIN user_dashboard_views udv 
           ON udv.user_id = $1 AND udv.item_type = 'payments' AND udv.item_id = p.id
         WHERE p.status = 'pending' AND udv.id IS NULL`,
        [userId]
      );
    
    case 'Staff Admin':
      return await pool.query(
        `SELECT COUNT(*) FROM checkouts c
     JOIN library_members lm ON c.member_id = lm.id
     LEFT JOIN user_dashboard_views udv 
       ON udv.user_id = $1 and udv.item_type = 'library' AND udv.item_id = c.id
     WHERE  c.return_date IS NULL and lm.user_type='student' 
       AND c.due_date < CURRENT_DATE AND udv.id IS NULL`,
        [userId]
      );
    
    default:
      return { rows: [{ count: '0' }] };
  }
};

const getAchievementsCount   = async (userId, userType) => {
  switch (userType) {
    case 'Student':
      return await pool.query(
        `SELECT COUNT(*) FROM achievements a
         LEFT JOIN user_dashboard_views udv 
           ON udv.user_id = $1 AND udv.item_type = 'achievements' AND udv.item_id = a.id
         WHERE a.visibility = 'private' AND a.student_id = $1
      OR (a.visibility = 'class' AND a.class_id in (select class_id from students where id=$1) 
      OR (a.visibility IN ('school', 'public'))) AND a.approved = false AND udv.id IS NULL`,
        [userId]
      );
    
    case 'Teacher':
      return await pool.query(
        `SELECT COUNT(*) FROM achievements a
         LEFT JOIN user_dashboard_views udv 
           ON udv.item_type = 'achievements' AND udv.item_id = a.id
		   JOIN students s ON a.student_id = s.id
                JOIN staff st ON s.class_id = st.class_id
         WHERE st.user_id = $1 AND a.approved = false AND udv.id IS NULL`,
        [userId]
      );
    
    case 'Staff':
      return await pool.query(
        `SELECT COUNT(*) FROM payments p
         LEFT JOIN user_dashboard_views udv 
           ON udv.user_id = $1 AND udv.item_type = 'payments' AND udv.item_id = p.id
         WHERE p.status = 'pending' AND udv.id IS NULL`,
        [userId]
      );
    
    case 'Staff Admin':
      return await pool.query(
        `SELECT COUNT(*) FROM achievements a
         LEFT JOIN user_dashboard_views udv 
           ON udv.user_id = $1 AND udv.item_type = 'achievements' AND udv.item_id = a.id
         WHERE a.approved = false AND udv.id IS NULL`,
        [userId]
      );
    
    default:
      return { rows: [{ count: '0' }] };
  }
};

const getTotalNotificationCount = async (userId, userType) => {
  try {
    let totalCount = 0;
    
    // Get counts from all helper functions
    const todosResult = await getTodosCount(userId, userType);
    totalCount += parseInt(todosResult.rows[0].count);
    
    const paymentsResult = await getPaymentsCount(userId, userType);
    totalCount += parseInt(paymentsResult.rows[0].count);
    
    const messagesResult = await getMessagesCount(userId,userType);
    totalCount += parseInt(messagesResult.rows[0].count);
    
    const libraryResult = await getLibraryCount(userId,userType);
    totalCount += parseInt(libraryResult.rows[0].count);
    
    const achievementsResult = await getAchievementsCount(userId, userType);
    totalCount += parseInt(achievementsResult.rows[0].count);
    
    return totalCount;
  } catch (error) {
    console.error('Error in getTotalNotificationCount:', error);
    throw error;
  }
};

const getLatestMessagesByCategory = async (userId, userType) => {
  try {
    const query = `
      WITH items AS (
        SELECT
          'todo'::text AS module_type,
          t.title::text AS title,
          t.description::text AS content,
          t.date AS timestamp
        FROM todos t
        WHERE (
          ${userType === 'Student' ? 't.class_id IN (SELECT class_id FROM students WHERE id = $1)' :
            userType === 'Teacher' ? 't.user_id = $1' :
            '$1 = $1'}
        ) AND t.completed = false

        UNION ALL

        SELECT
          'payments'::text AS module_type,
          ft.name::text AS title,
          CONCAT(ft.description, ' : ', ft.amount)::text AS content,
          COALESCE(fa.created_at, fa.due_date) AS timestamp
        FROM fee_assignments fa
        JOIN fee_types ft ON fa.fee_type_id = ft.id
        WHERE (
          ${userType === 'Student' ? 'fa.class_id IN (SELECT class_id FROM students WHERE id = $1)' :
            userType === 'Teacher' ? 'fa.class_id IN (SELECT class_id FROM staff WHERE user_id = $1)' :
            '$1 = $1'}
        )

        UNION ALL

        SELECT
          'messages'::text AS module_type,
          pc.Message_type::text AS title,
          pc.message_text::text AS content,
          pc.meeting_date AS timestamp
        FROM parent_communications pc
        WHERE (
          ${userType === 'Student' ? 'pc.student_id = $1' :
            userType === 'Teacher' ? 'pc.sender_id = $1' :
            '$1 = $1'}
        )

        UNION ALL

        SELECT
          'library'::text AS module_type,
          'Overdue'::text AS title,
          CONCAT('Book "', b.title, '" is overdue')::text AS content,
          c.created_at AS timestamp
        FROM checkouts c
        JOIN library_members lm ON c.member_id = lm.id
        JOIN book_copies bc ON c.book_copy_id = bc.id
        JOIN books b ON b.id = bc.book_id
        WHERE (
          ${userType === 'Student' ? 'lm.user_id = $1 AND lm.user_type = \'student\'' :
            userType === 'Teacher' ? 'lm.user_id IN (SELECT id FROM students WHERE class_id IN (SELECT class_id FROM staff WHERE user_id = $1))' :
            '$1 = $1'}
        )
        AND c.return_date IS NULL
        AND c.due_date < CURRENT_DATE

        UNION ALL

        SELECT
          'achievements'::text AS module_type,
          a.title::text AS title,
          a.description::text AS content,
          COALESCE(a.created_at, a.achievement_date) AS timestamp
        FROM achievements a
        WHERE (
          ${userType === 'Student'
            ? '(a.visibility = \'private\' AND a.student_id = $1) OR (a.visibility = \'class\' AND a.class_id IN (SELECT class_id FROM students WHERE id = $1)) OR (a.visibility IN (\'school\', \'public\'))'
            : userType === 'Teacher'
              ? 'a.student_id IN (SELECT id FROM students WHERE class_id IN (SELECT class_id FROM staff WHERE user_id = $1))'
              : '$1 = $1'}
        )
        AND a.approved = false
      ),
      ranked AS (
        SELECT
          module_type,
          title,
          content,
          timestamp,
          ROW_NUMBER() OVER (PARTITION BY module_type ORDER BY timestamp DESC NULLS LAST) AS rn
        FROM items
      )
      SELECT module_type, title, content, timestamp
      FROM ranked
      WHERE rn = 1
    `;

    const { rows } = await pool.query(query, [userId]);
    const latestByCategory = {};

    rows.forEach((row) => {
      latestByCategory[row.module_type] = row.title || row.content || "";
    });

    const overallLatest = rows
      .slice()
      .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))[0];

    latestByCategory.notifications =
      overallLatest?.title || overallLatest?.content || "";

    return latestByCategory;
  } catch (error) {
    console.error('Error in getLatestMessagesByCategory:', error);
    return {};
  }
};

// Get dashboard counts
const getDashboardCounts = async (userId, userType) => {
  try {
    let counts = {
      notifications: 0,
      todo: 0,
      payments: 0,
      messages: 0,
      library: 0,
      achievements: 0,
    };
    
    // Get total notification count
    counts.notifications = await getTotalNotificationCount(userId, userType);
    
    // Get individual counts using helper functions
    const todosResult = await getTodosCount(userId, userType);
    counts.todo = parseInt(todosResult.rows[0].count);
    
    const paymentsResult = await getPaymentsCount(userId, userType);
    counts.payments = parseInt(paymentsResult.rows[0].count);
    
    const messagesResult = await getMessagesCount(userId,userType);
    counts.messages = parseInt(messagesResult.rows[0].count);
    
    const libraryResult = await getLibraryCount(userId,userType);
    counts.library = parseInt(libraryResult.rows[0].count);
    
    const achievementsResult = await getAchievementsCount(userId, userType);
    counts.achievements = parseInt(achievementsResult.rows[0].count);
    counts.latest_messages = await getLatestMessagesByCategory(userId, userType);
    
    return counts;
  } catch (error) {
    console.error('Error in getDashboardCounts:', error);
    throw error;
  }
};

// Mark dashboard item as viewed
const markItemAsViewed = async (userId, userType, itemType, itemId) => {
  try {
    await pool.query(
      `INSERT INTO user_dashboard_views (user_id, user_type, item_type, item_id, last_viewed)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, item_type, item_id) 
       DO UPDATE SET last_viewed = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP`,
      [userId, userType, itemType, itemId]
    );
    return true;
  } catch (error) {
    console.error('Error in markItemAsViewed:', error);
    throw error;
  }
};

// Get last viewed timestamp for an item
const getLastViewed = async (userId, itemType, itemId = null) => {
  try {
    if (itemId) {
      const result = await pool.query(
        `SELECT item_id,last_viewed FROM user_dashboard_views 
         WHERE user_id = $1 AND item_type = $2 AND item_id = $3`,
        [userId, itemType, itemId]
      );
      return result.rows[0];
    } else {
      const result = await pool.query(
        `SELECT item_id,last_viewed FROM user_dashboard_views 
         WHERE user_id = $1 AND item_type = $2`,
        [userId, itemType]
      );
      return result.rows;
    }
  } catch (error) {
    console.error('Error in getLastViewed:', error);
    throw error;
  }
};

const getDailyNotifications = async (userId, userType, targetDate = null) => {
  try {
    let targetDateUTC;
    if (targetDate) {
      targetDateUTC = new Date(Date.UTC(
        parseInt(targetDate.split('-')[0]),
        parseInt(targetDate.split('-')[1]) - 1, // Month is 0-indexed
        parseInt(targetDate.split('-')[2])
      ));
    } else {
      targetDateUTC = new Date();
      targetDateUTC = new Date(Date.UTC(
        targetDateUTC.getFullYear(),
        targetDateUTC.getMonth(),
        targetDateUTC.getDate()
      ));
    }
    
    console.log('UTC targetDate:', targetDateUTC.toISOString());
    
    // Calculate start date (6 days before)
    const startDateUTC = new Date(targetDateUTC);
    startDateUTC.setUTCDate(targetDateUTC.getUTCDate() - 6);
    
    const startDateStr = startDateUTC.toISOString().split('T')[0];
    const endDateStr = targetDateUTC.toISOString().split('T')[0];
    
    console.log('UTC Date range:', startDateStr, 'to', endDateStr);
    
    // Get notifications from all modules
    const notifications = [];
    
    // 1. Todo notifications
    const todosQuery = `
      SELECT 
        t.id,
        'todo' as module_type,
        t.title as title,
        t.description as content,
        t.date as timestamp,
        'Pending todo item' as type,        
        EXISTS (
          SELECT 1 FROM communication_replies cr 
          WHERE cr.item_id = t.id AND cr.item_type = 'todo'
        ) as has_replies,
        (
          SELECT COUNT(*) FROM communication_replies cr
          WHERE cr.item_id = t.id AND cr.item_type = 'todo'
        ) as reply_count,
        DATE(t.date) as notification_date
      FROM todos t
      WHERE 
        (${userType === 'Student' ? 't.class_id IN (SELECT class_id FROM students WHERE id = $1)' : 
          userType === 'Teacher' ? 't.user_id = $1' : 
          '$1=$1'})
        AND DATE(t.date) BETWEEN $2 AND $3
        AND t.completed = false
    `;
    const todosResult = await pool.query(todosQuery, [userId, startDateStr, endDateStr]);
    notifications.push(...todosResult.rows);
    
    // 2. Payment notifications
    const paymentsQuery = `
      SELECT 
        fa.id,
        'payments' as module_type,
        ft.name as title,
        CONCAT(ft.description,' : ', ft.amount) as content,
        fa.due_date as timestamp,
        'Fee assignment' as type,
        EXISTS (
          SELECT 1 FROM communication_replies cr 
          WHERE cr.item_id = fa.id AND cr.item_type = 'payments'
        ) as has_replies,
        (
          SELECT COUNT(*) FROM communication_replies cr
          WHERE cr.item_id = fa.id AND cr.item_type = 'payments'
        ) as reply_count,
        DATE(fa.created_at) as notification_date
      FROM fee_assignments fa,fee_types ft where fa.fee_type_id=ft.id
      and
        (${userType === 'Student' ? 'fa.class_id IN (SELECT class_id FROM students WHERE id = $1)' : 
          userType === 'Teacher' ? 'fa.class_id IN (SELECT class_id FROM staff WHERE user_id = $1)' : 
          '$1=$1'})
        AND DATE(fa.created_at) BETWEEN $2 AND $3
    `;
    const paymentsResult = await pool.query(paymentsQuery, [userId, startDateStr, endDateStr]);
    notifications.push(...paymentsResult.rows);
    
    // 3. Message notifications
    const messagesQuery = `
      SELECT 
        pc.id,
        'messages' as module_type,
        pc.Message_type as title,
        pc.message_text as content,
        pc.meeting_date as timestamp,
        pc.Message_type as type,
        EXISTS (
          SELECT 1 FROM communication_replies cr 
          WHERE cr.item_id = pc.id AND cr.item_type = 'messages'
        ) as has_replies,
        (
          SELECT COUNT(*) FROM communication_replies cr
          WHERE cr.item_id = pc.id AND cr.item_type = 'messages'
        ) as reply_count,
        DATE(pc.meeting_date) as notification_date
      FROM parent_communications pc
      WHERE 
        (${userType === 'Student' ? 'pc.student_id = $1' : 
          userType === 'Teacher' ? 'pc.sender_id = $1 ' : 
          '$1=$1'})
        AND DATE(pc.meeting_date) BETWEEN $2 AND $3
    `;
    const messagesResult = await pool.query(messagesQuery, [userId, startDateStr, endDateStr]);
    notifications.push(...messagesResult.rows);
    
    // 4. Library notifications (overdue books)
    const libraryQuery = `
      SELECT 
        c.id,
        'library' as module_type,
        'Overdue' as title,
        CONCAT('Book "', b.title,' - ',b.author,' - ',b.publisher,' - ',b.publication_year, '" is overdue') as content,
        c.due_date as timestamp,
        'Overdue' as type,
        EXISTS (
          SELECT 1 FROM communication_replies cr 
          WHERE cr.item_id = c.id AND cr.item_type = 'library'
        ) as has_replies,
        (
          SELECT COUNT(*) FROM communication_replies cr
          WHERE cr.item_id = c.id AND cr.item_type = 'library'
        ) as reply_count,
        DATE(c.created_at) as notification_date
      FROM checkouts c
      JOIN library_members lm ON c.member_id = lm.id
      JOIN book_copies bc ON c.book_copy_id = bc.id
	  join books b on b.id=bc.book_id
      WHERE 
        (${userType === 'Student' ? 'lm.user_id = $1 AND lm.user_type = \'student\'' : 
          userType === 'Teacher' ? 'lm.user_id IN (SELECT id FROM students WHERE class_id IN (SELECT class_id FROM staff WHERE user_id = $1))' : 
          '$1=$1'})
        AND c.return_date IS NULL 
        AND c.due_date < CURRENT_DATE
        AND DATE(c.created_at) BETWEEN $2 AND $3
    `;
    const libraryResult = await pool.query(libraryQuery, [userId, startDateStr, endDateStr]);
    notifications.push(...libraryResult.rows);
    
    // 5. Achievement notifications
    const achievementsQuery = `
      SELECT 
        a.id,
        'achievements' as module_type,
        a.title as title,
        a.description as content,
        a.achievement_date as timestamp,
        a.category as type,
        EXISTS (
          SELECT 1 FROM communication_replies cr 
          WHERE cr.item_id = a.id AND cr.item_type = 'achievements'
        ) as has_replies,
        (
          SELECT COUNT(*) FROM communication_replies cr
          WHERE cr.item_id = a.id AND cr.item_type = 'achievements'
        ) as reply_count,
        DATE(a.created_at) as notification_date
      FROM achievements a
      WHERE 
        (${userType === 'Student' ? 'a.visibility = \'private\' AND a.student_id = $1 OR (a.visibility = \'class\' AND a.class_id in (select class_id from students where id=$1)  OR (a.visibility IN (\'school\', \'public\'))) AND a.approved = false' : 
          userType === 'Teacher' ? 'a.student_id IN (SELECT id FROM students WHERE class_id IN (SELECT class_id FROM staff WHERE user_id = $1))' : 
          '$1=$1'})
        AND DATE(a.created_at) BETWEEN $2 AND $3
        AND a.approved = false
    `;
    const achievementsResult = await pool.query(achievementsQuery, [userId, startDateStr, endDateStr]);
    notifications.push(...achievementsResult.rows);
    
    // Sort by timestamp (newest first)
    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Group notifications by date
    const notificationsByDate = {};
    
    // Initialize all 7 days with empty arrays
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDateUTC);
      currentDate.setDate(startDateUTC.getDate() + i);
      const dateKey = currentDate.toISOString().split('T')[0];
      notificationsByDate[dateKey] = [];
    }
    
    // Populate with actual notifications
    notifications.forEach(notification => {
      const notification_date = new Date(notification.notification_date);
      notification_date.setDate(notification.notification_date.getDate())
      const dateKey = notification_date.toISOString().split('T')[0];
      if (notificationsByDate[dateKey]) {
        notificationsByDate[dateKey].push(notification);
      }
    });
    
    return {
      period_start: startDateStr,
      period_end: endDateStr,
      days: 7,
      notifications: notificationsByDate,
      total_notifications: notifications.length
    };
    
  } catch (error) {
    console.error('Error in getWeeklyNotifications:', error);
    throw error;
  }
};

/**
 * Get replies for a specific message item with hierarchy
 */
const getMessageReplies = async (itemId, itemType, userId, userType) => {
  try {
    // First check if user has access to this message
    let accessCheckQuery = '';
    let accessCheckParams = [itemId];
    
    switch (itemType) {
      case 'messages':
        accessCheckQuery = `
          SELECT id FROM parent_communications 
          WHERE id = $1 AND (
            ${userType === 'Student' ? 'student_id = $2' : 
             userType === 'Teacher' ? 'sender_id = $2 OR student_id IN (SELECT id FROM students WHERE class_id IN (SELECT class_id FROM staff WHERE user_id = $2))' : 
             '$2=$2'}
          )
        `;
        accessCheckParams.push(userId);
        break;
      case 'todo':
        accessCheckQuery = `
          SELECT id FROM todos  t
          WHERE id = $1 AND (${userType === 'Student' ? 't.class_id IN (SELECT class_id FROM students WHERE id = $2)' : 
          userType === 'Teacher' ? 't.user_id = $2' : 
          '$2=$2'})
        `;
        accessCheckParams.push(userId);
        break;
      case 'payments':
        accessCheckQuery = `
          SELECT fa.id FROM fee_assignments fa,fee_types ft where fa.fee_type_id=ft.id
          and fa.id = $1 AND (${userType === 'Student' ? 'fa.class_id IN (SELECT class_id FROM students WHERE id = $2)' : 
          userType === 'Teacher' ? 'fa.class_id IN (SELECT class_id FROM staff WHERE user_id = $2)' : 
          '$2=$2'})
        `;
        accessCheckParams.push(userId);
        break;
      case 'library':
        accessCheckQuery = `
          SELECT c.id FROM checkouts c
      JOIN library_members lm ON c.member_id = lm.id
      JOIN book_copies bc ON c.book_copy_id = bc.id
	  join books b on b.id=bc.book_id
          WHERE c.id = $1 AND (${userType === 'Student' ? 'lm.user_id = $2 AND lm.user_type = \'student\'' : 
          userType === 'Teacher' ? 'lm.user_id IN (SELECT id FROM students WHERE class_id IN (SELECT class_id FROM staff WHERE user_id = $2))' : 
          '$2=$2'})
        `;
        accessCheckParams.push(userId);
        break;
      case 'achievements':
        accessCheckQuery = `
          SELECT a.id FROM achievements a
          WHERE a.id = $1 AND (${userType === 'Student' ? ' a.visibility = \'private\' AND a.student_id = $2 OR (a.visibility = \'class\' AND a.class_id in (select class_id from students where id=$2)  OR (a.visibility IN (\'school\', \'public\'))) AND a.approved = false' : 
          userType === 'Teacher' ? ' a.student_id IN (SELECT id FROM students WHERE class_id IN (SELECT class_id FROM staff WHERE user_id = $2))' : 
          '$2=$2'})
        `;
        
        accessCheckParams.push(userId);
        break;
      default:
        throw new Error('Unsupported item type for replies');
    }
    
    const accessResult = await pool.query(accessCheckQuery, accessCheckParams);
    
    if (accessResult.rows.length === 0) {
      throw new Error('Access denied or item not found');
    }
    
    // Get all replies with hierarchy
    const repliesResult = await pool.query(
      `WITH RECURSIVE reply_tree AS (
        SELECT 
          cr.id,
          cr.item_id,
          cr.item_type,
          cr.sender_id,
          cr.sender_type,
          cr.message_text,
          cr.parent_id,
          cr.created_at,
          CASE
            WHEN cr.sender_type = 'Student' THEN s.full_name
            ELSE u.fullname
          END as sender_name,
          1 as depth,
          ARRAY[cr.id] as path
        FROM communication_replies cr
        LEFT JOIN users u ON cr.sender_id = u.id
        LEFT JOIN students s ON cr.sender_id = s.id
        WHERE cr.item_id = $1 AND cr.item_type = $2 AND (cr.parent_id IS NULL or cr.parent_id=0)
        
        UNION ALL
        
        SELECT 
          cr.id,
          cr.item_id,
          cr.item_type,
          cr.sender_id,
          cr.sender_type,
          cr.message_text,
          cr.parent_id,
          cr.created_at,
          CASE
            WHEN cr.sender_type = 'Student' THEN s.full_name
            ELSE u.fullname
          END as sender_name,
          rt.depth + 1 as depth,
          rt.path || cr.id as path
        FROM communication_replies cr
        LEFT JOIN users u ON cr.sender_id = u.id
        LEFT JOIN students s ON cr.sender_id = s.id
        INNER JOIN reply_tree rt ON cr.parent_id = rt.id
        WHERE cr.item_id = $1 AND cr.item_type = $2
      )
      SELECT 
        id,
        item_id,
        item_type,
        sender_id,
        sender_type,
        message_text,
        parent_id,
        created_at,
        sender_name,
        depth,
        path
      FROM reply_tree
      ORDER BY path, created_at ASC`,
      [itemId, itemType]
    );
    
    // Convert flat list to hierarchical structure
    const buildHierarchy = (replies) => {
      const map = {};
      const roots = [];
      
      // Create a map of all replies
      replies.forEach(reply => {
        map[reply.id] = { ...reply, replies: [] };
      });
      
      // Build the hierarchy
      replies.forEach(reply => {
        if (reply.parent_id) {
          if (map[reply.parent_id]) {
            map[reply.parent_id].replies.push(map[reply.id]);
          }
        } else {
          roots.push(map[reply.id]);
        }
      });
      
      return roots;
    };
    
    const hierarchicalReplies = buildHierarchy(repliesResult.rows);
    
    return hierarchicalReplies;
    
  } catch (error) {
    console.error('Error in getMessageReplies:', error);
    throw error;
  }
};

/**
 * Add a reply to a message item
 */
const addMessageReply = async (itemId, itemType, userId, userType, messageText, parentId = null) => {
  try {
    // First check if user has access to this message
    let accessCheckQuery = '';
    let accessCheckParams = [itemId];
    
    switch (itemType) {
      case 'messages':
        accessCheckQuery = `
          SELECT id FROM parent_communications 
          WHERE id = $1 AND (
            ${userType === 'Student' ? 'student_id = $2' : 
             userType === 'Teacher' ? 'sender_id = $2 OR student_id IN (SELECT id FROM students WHERE class_id IN (SELECT class_id FROM staff WHERE user_id = $2))' : 
             '$2=$2'}
          )
        `;
        accessCheckParams.push(userId);
        break;
      case 'todo':
        accessCheckQuery = `
          SELECT id FROM todos t
          WHERE id = $1 AND (${userType === 'Student' ? 't.class_id IN (SELECT class_id FROM students WHERE id = $2)' : 
          userType === 'Teacher' ? 't.user_id = $2' : 
          '$2=$2'})
        `;
        accessCheckParams.push(userId);
        break;
      case 'payments':
        accessCheckQuery = `
          SELECT fa.id FROM fee_assignments fa,fee_types ft where fa.fee_type_id=ft.id
          and fa.id = $1 AND (${userType === 'Student' ? 'fa.class_id IN (SELECT class_id FROM students WHERE id = $2)' : 
          userType === 'Teacher' ? 'fa.class_id IN (SELECT class_id FROM staff WHERE user_id = $2)' : 
          '$2=$2'})
        `;
        accessCheckParams.push(userId);
        break;
      case 'library':
        accessCheckQuery = `
          SELECT c.id FROM checkouts c
      JOIN library_members lm ON c.member_id = lm.id
      JOIN book_copies bc ON c.book_copy_id = bc.id
	  join books b on b.id=bc.book_id
          WHERE c.id = $1 AND (${userType === 'Student' ? 'lm.user_id = $2 AND lm.user_type = \'student\'' : 
          userType === 'Teacher' ? 'lm.user_id IN (SELECT id FROM students WHERE class_id IN (SELECT class_id FROM staff WHERE user_id = $2))' : 
          '$2=$2'})
        `;
        accessCheckParams.push(userId);
        break;
      case 'achievements':
        accessCheckQuery = `
          SELECT a.id FROM achievements a
          WHERE a.id = $1 AND (${userType === 'Student' ? ' a.visibility = \'private\' AND a.student_id = $2 OR (a.visibility = \'class\' AND a.class_id in (select class_id from students where id=$2)  OR (a.visibility IN (\'school\', \'public\'))) AND a.approved = false' : 
          userType === 'Teacher' ? 'a.student_id IN (SELECT id FROM students WHERE class_id IN (SELECT class_id FROM staff WHERE user_id = $2))' : 
          '$2=$2'})
        `;
        accessCheckParams.push(userId);
        break;
      default:
        throw new Error('Unsupported item type for replies');
    }
    
    const accessResult = await pool.query(accessCheckQuery, accessCheckParams);
    
    if (accessResult.rows.length === 0) {
      throw new Error('Access denied or item not found');
    }
    
    // Insert reply
    const replyResult = await pool.query(
      `INSERT INTO communication_replies 
        (item_id, item_type, sender_id, sender_type, message_text, parent_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [itemId, itemType, userId, userType, messageText, parentId]
    );
    
    // Get sender info for response
    const senderResult = await pool.query(
      userType === 'Student'
        ? `SELECT full_name AS sender_name FROM students WHERE id = $1`
        : `SELECT fullname AS sender_name FROM users WHERE id = $1`,
      [userId]
    );
    
    const reply = replyResult.rows[0];
    if (senderResult.rows.length > 0) {
      reply.sender_name = senderResult.rows[0].sender_name;
    }
    reply.replies = []; // Empty array for hierarchical structure
    
    return reply;
    
  } catch (error) {
    console.error('Error in addMessageReply:', error);
    throw error;
  }
};

export {
  getDashboardCounts,
  markItemAsViewed,
  getLastViewed,
  getDailyNotifications,
  getMessageReplies,
  addMessageReply
};
