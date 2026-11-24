const ActivityLog = require("../ScheemaModals/Administrations/activityLogModal");
const TeamMember = require("../ScheemaModals/Administrations/userModal");

const logActivity = async ({
  req,
  userId = null,
  userName = null,
  action,
  module,
  recordId = null,
  recordModel = null,
  recordSnapshot = null,
  description = "",
}) => {
  try {
    let actorName = userName;

    if (!actorName && userId) {
      const user = await TeamMember.findById(userId)
        .select("name username")
        .lean();

      actorName = user?.name || user?.username || "Unknown User";
    }

    const ipAddress = (req.ip || req.socket?.remoteAddress || "")
      .replace(/^::ffff:/, "")
      .replace(/^::1$/, "127.0.0.1");

    await ActivityLog.create({
      user: userId,
      userName: actorName || "Unknown User",
      action,
      module,
      recordId,
      recordModel,
      recordSnapshot,
      description,
      ipAddress,
    });
  } catch (error) {
    console.error("Activity log error:", error.message);
  }
};

module.exports = logActivity;
