"use client";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaShoppingCart } from 'react-icons/fa';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          <i className="fas fa-recycle me-2"></i>
          GreenSwap Egypt
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                الرئيسية
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/search">
                البحث
              </Link>
            </li>
            {currentUser && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">
                    لوحة التحكم
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/add-item">
                    إضافة مخلف
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/orders">
                    الطلبات
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/chat">
                    المحادثات
                  </Link>
                </li>
                {/* <li className="nav-item">
                  <div className="nav-link position-relative">
                    <Link to="/cart" className="text-decoration-none text-dark">
                      <FaShoppingCart size={20} />
                      
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                          {localStorage.getItem('itemCount') || 0}
                        </span>
                      
                    </Link>
                  </div>
                </li> */}
                {currentUser.user_type === "admin" && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/admin">
                      الإدارة
                    </Link>
                  </li>
                )}
              </>
            )}
          </ul>

          <ul className="navbar-nav">
            {currentUser ? (
              <>
                <li className="nav-item">{/* <NotificationSystem /> */}</li>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                  >
                    <i className="fas fa-user me-1"></i>
                    {currentUser.username || currentUser.email}{" "}
                    {/* Display username or email */}
                  </a>
                  <ul className="dropdown-menu">
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        الملف الشخصي
                      </Link>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}>
                        تسجيل الخروج
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    تسجيل الدخول
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link btn btn-outline-light ms-2"
                    to="/register"
                  >
                    إنشاء حساب
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
