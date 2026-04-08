import { useState } from "react";
import { createPortal } from "react-dom";
const AchievementCard = ({ achievement, onDelete, onApprove, userRole }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    setIsDeleting(true);
    await onDelete(achievement.id);
    setIsDeleting(false);
  };

  const handleApprove = async (e) => {
    e.stopPropagation();
    setIsApproving(true);
    await onApprove(achievement.id);
    setIsApproving(false);
  };

  const handleImageError = (e) => {
    e.target.src = "./profile-picture.jpg";
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      {/* ===== Achievement Card ===== */}
      <div
        className="card bg-base-100 shadow-xl hover:shadow-2xl transition cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        <figure className="px-4 pt-4">
          <img
            src={achievement.evidence_url || "/placeholder-achievement.jpg"}
            alt={achievement.title}
            className="rounded-xl h-48 w-full object-cover"
            onError={handleImageError}
          />
        </figure>

        <div className="card-body relative">
          <h2 className="card-title">{achievement.title}</h2>
          <p className="text-gray-600 line-clamp-2">
            {achievement.description}
          </p>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-2">
            <div className="badge badge-info  p-2">{achievement.category}</div>
            <div className="badge badge-outline  p-2">{achievement.visibility}</div>
            <div
              className={`badge ${
                achievement.approved ? "badge-success" : "badge-warning"
              }  p-2`}
            >
              {achievement.approved ? "Approved" : "Pending"}
            </div>
          </div>

          {/* Created At - Bottom Left */}
          <div className="absolute bottom-4 left-4 text-xs text-gray-500">
            Created: {formatDate(achievement.created_at)}
          </div>

          {/* Actions */}
          <div className="card-actions justify-end mt-4">
            {userRole === "admin" && !achievement.approved && (
              <button
                onClick={handleApprove}
                className={`btn btn-sm btn-success ${
                  isApproving ? "loading" : ""
                }`}
                disabled={isApproving}
              >
                Approve
              </button>
            )}

            {(userRole === "admin" ||
              achievement.userId === "current-user-id") && (
              <button
                onClick={handleDelete}
                className={`btn btn-sm btn-error ${
                  isDeleting ? "loading" : ""
                }`}
                disabled={isDeleting}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===== Modal ===== */}
      {showModal &&
  createPortal(
    <div className="fixed inset-0 z-[9999] flex justify-center items-start bg-black/40">
      <div className="mt-8 w-full max-w-3xl bg-base-100 rounded-xl shadow-2xl p-6">
        <h3 className="font-bold text-xl mb-2">
          {achievement.title}
        </h3>

        <img
          src={achievement.evidence_url || "/placeholder-achievement.jpg"}
          alt={achievement.title}
          className="rounded-lg mb-4 w-full h-64 object-cover"
          onError={handleImageError}
        />

        <div className="space-y-2 text-sm">
          <p><b>Student:</b> {achievement.full_name}</p>
          <p><b>Description:</b> {achievement.description}</p>
          <p><b>Category:</b> {achievement.category}</p>
          <p><b>Awarded By:</b> {achievement.awarded_by}</p>
          <p><b>Achievement Date:</b> {formatDate(achievement.achievement_date)}</p>
          <p><b>Academic Year:</b> {achievement.academic_year || "-"}</p>
          <p><b>Visibility:</b> {achievement.visibility}</p>
          <p>
            <b>Status:</b>{" "}
            {achievement.approved ? "Approved" : "Pending"}
          </p>
          <p><b>Created At:</b> {formatDate(achievement.created_at)}</p>
        </div>

        <div className="mt-6 text-right">
          <button
            className="btn btn-outline"
            onClick={() => setShowModal(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

    </>
  );
};

export default AchievementCard;
