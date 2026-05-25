import { Link, Outlet, useLocation } from "react-router-dom";
import {
  FaBook,
  FaPlusCircle,
  FaUserTie,
  FaCog,
} from "react-icons/fa";

export default function TutorLayout() {
  const location = useLocation();

  const menu = [
    {
      name: "Tutor Profile",
      path: "/tutor/profile",
      icon: <FaUserTie />,
    },
    {
      name: "My Courses",
      path: "/tutor/courses",
      icon: <FaBook />,
    },
    {
      name: "Add Course",
      path: "/tutor/add-course",
      icon: <FaPlusCircle />,
    },
    {
      name: "Settings",
      path: "/tutor/settings",
      icon: <FaCog />,
    },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
        
      <div
        style={{
          width: "250px",
          backgroundColor: "#1e293b",
          color: "white",
          padding: "20px",
          position: "fixed",
          height: "100%",
          left: 0,
          top: 0,
        }}
      >
        <h2
          style={{
            color: "white",
            textAlign: "center",
            marginBottom: "30px",
            fontSize: "32px",
            fontWeight: "bold",
          }}
        >
          Flow Tutor Hub
        </h2>

        {menu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "15px",
              marginTop: "10px",
              textDecoration: "none",
              color: "white",
              borderRadius: "8px",
              fontSize: "18px",
              background:
                location.pathname === item.path
                  ? "#334155"
                  : "transparent",
            }}
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
      </div>

      <div
        style={{
          marginLeft: "250px",
          
          width: "100%",
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}