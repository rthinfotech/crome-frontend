import { FiX, FiGlobe } from "react-icons/fi";

export default function ChromeTab({
  active,
  title,
  favicon,
  onClick,
  onClose,
}) {
  return (
    <div
      className={`chrome-tab ${active ? "active" : ""}`}
      onClick={onClick}
    >
      {active && <div className="chrome-seam" />}

      <div className="chrome-tab-content">
        <div className="chrome-favicon">
          {favicon ? (
            <img
              src={favicon}
              alt=""
              width={16}
              height={16}
              style={{
                width: 16,
                height: 16,
                objectFit: "contain",
              }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <FiGlobe size={13} />
          )}
        </div>

        <span className="chrome-title">{title}</span>

        <div
          className="chrome-close"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          <FiX size={13} />
        </div>
      </div>
    </div>
  );
}