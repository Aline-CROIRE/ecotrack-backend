const PickupRequest = require('../models/PickupRequest');

const checkStaleRequests = async () => {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  // Find pending requests older than 24 hours
  const staleRequests = await PickupRequest.updateMany(
    { 
      status: 'pending', 
      createdAt: { $lt: twentyFourHoursAgo } 
    },
    { $set: { priority: 'high' } } // Auto-escalate priority
  );
  
  console.log(`System: Escalated ${staleRequests.modifiedCount} stale requests.`);
};

module.exports = checkStaleRequests;