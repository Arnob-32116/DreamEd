import "./Sidebar.css";

const navItems = [
  { label: "Profile", icon: "👤" },
  { label: "University", icon: "🎓" },
  { label: "Scholarship", icon: "🏅" },
  { label: "Locker", icon: "🗃️" },
  { label: "Calendar", icon: "📅" },
  { label: "Applications", icon: "📋", badge: 3 },
  { label: "Blogs", icon: "📖", active: true },
  { label: "Notifications", icon: "🔔", badge: 5 },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">D</div>
        <span className="logo-text">DREAMED</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <div key={item.label} className={`nav-item ${item.active ? "active" : ""}`}>
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.badge && <span className="nav-badge">{item.badge}</span>}
          </div>
        ))}
      </nav>
    </aside>
  );
}
