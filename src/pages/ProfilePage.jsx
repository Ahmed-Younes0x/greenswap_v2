"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { authAPI, itemsAPI, ordersAPI } from "../services/api";

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    myItems: 0,
    activeOrders: 0,
    completedDeals: 0,
    messages: 0,
  });
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    location: "",
    organization: "",
    bio: "",
    user_type: "individual",
  });
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);

        // Fetch data in parallel like in Dashboard
        const [itemsRes, ordersRes, userRes] = await Promise.all([
          itemsAPI.getMyItems(),
          ordersAPI.getMyOrders(),
          authAPI.getCurrentUser(),
        ]);

        // Calculate stats using the same logic as Dashboard
        const myItems = itemsRes.data.length;
        const activeOrders =
          ordersRes.data.received.length + ordersRes.data.sent.length;
        const completedDeals = ordersRes.data.completed.length;

        setStats({
          myItems,
          activeOrders,
          completedDeals,
          messages: 0, // Same as Dashboard
        });

        const user = userRes.data;
        setProfileData({
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          email: user.email || "",
          phone: user.phone || "",
          location: user.location || "",
          organization: user.organization || "",
          bio: user.bio || "",
          user_type: user.user_type || "individual",
        });
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Profile data to update:", profileData);

      const response = await authAPI.updateProfile(profileData);
      alert("تم تحديث البيانات بنجاح!");
    } catch (error) {
      console.error("Update failed:", error);
      alert(
        "حدث خطأ أثناء تحديث البيانات: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      alert("كلمات المرور الجديدة غير متطابقة");
      return;
    }

    setLoading(true);

    try {
      await authAPI.updateProfile({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });

      alert("تم تغيير كلمة المرور بنجاح!");
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      console.error("Password change failed:", error);
      alert(
        "حدث خطأ أثناء تغيير كلمة المرور: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const getUserTypeLabel = (type) => {
    const types = {
      individual: "فرد",
      workshop: "ورشة تدوير",
      collector: "جامع خردة",
      organization: "جمعية بيئية",
      company: "شركة",
    };
    return types[type] || "غير محدد";
  };

  const getJoinDate = () => {
    if (!currentUser?.created_at) return "تاريخ غير معروف";
    const date = new Date(currentUser.created_at);
    return `عضو منذ ${date.toLocaleDateString("ar-EG", {
      month: "long",
      year: "numeric",
    })}`;
  };

  return (
    <div className="container py-4">
      {/* Profile Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-2 text-center">
                  <img
                    src={
                      currentUser?.avatar ||
                      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Windows_10_Default_Profile_Picture.svg/768px-Windows_10_Default_Profile_Picture.svg.png?20221210150350"
                    }
                    alt="الصورة الشخصية"
                    className="rounded-circle border border-white border-3"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <div className="col-md-6">
                  <h2 className="mb-2">
                    {currentUser?.name || currentUser?.username}
                  </h2>
                  <p className="mb-1">
                    <i className="fas fa-user-tag me-2"></i>
                    {getUserTypeLabel(currentUser?.user_type)}
                  </p>
                  <p className="mb-1">
                    <i className="fas fa-map-marker-alt me-2"></i>
                    {currentUser?.location || "غير محدد"}
                  </p>
                  <p className="mb-0">
                    <i className="fas fa-calendar me-2"></i>
                    {getJoinDate()}
                  </p>
                </div>
                <div className="col-md-4">
                  <div className="row text-center">
                    <div className="col-6">
                      <h4 className="mb-0">{stats.completedDeals}</h4>
                      <small>صفقات مكتملة</small>
                    </div>
                    <div className="col-6">
                      <h4 className="mb-0">{stats.myItems}</h4>
                      <small>إعلاناتي</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Updated to match Dashboard */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <i className="fas fa-box text-success fs-1 mb-3"></i>
              <h3 className="text-success">{stats.myItems}</h3>
              <p className="text-muted mb-0">إعلاناتي</p>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <i className="fas fa-shopping-cart text-warning fs-1 mb-3"></i>
              <h3 className="text-warning">{stats.activeOrders}</h3>
              <p className="text-muted mb-0">طلبات نشطة</p>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <i className="fas fa-handshake text-info fs-1 mb-3"></i>
              <h3 className="text-info">{stats.completedDeals}</h3>
              <p className="text-muted mb-0">صفقات مكتملة</p>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <i className="fas fa-envelope text-primary fs-1 mb-3"></i>
              <h3 className="text-primary">{stats.messages}</h3>
              <p className="text-muted mb-0">رسائل جديدة</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="row">
        <div className="col-12">
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "profile" ? "active" : ""
                }`}
                onClick={() => setActiveTab("profile")}
              >
                <i className="fas fa-user me-2"></i>
                الملف الشخصي
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "security" ? "active" : ""
                }`}
                onClick={() => setActiveTab("security")}
              >
                <i className="fas fa-lock me-2"></i>
                الأمان
              </button>
            </li>
          </ul>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="card border-0 shadow-sm">
              <div className="card-header">
                <h5 className="mb-0">تحديث الملف الشخصي</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleProfileSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="name" className="form-label">
                        الاسم الاول
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="first_name"
                        value={profileData.first_name}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="name" className="form-label">
                        الاسم الاخير
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="last_name"
                        value={profileData.last_name}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="email" className="form-label">
                        البريد الإلكتروني
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="phone" className="form-label">
                        رقم الهاتف
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        id="phone"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="location" className="form-label">
                        المحافظة
                      </label>
                      <select
                        className="form-select"
                        id="location"
                        name="location"
                        value={profileData.location}
                        onChange={handleProfileChange}
                        required
                      >
                        <option value="">اختر المحافظة</option>
                        <option value="القاهرة">القاهرة</option>
                        <option value="الجيزة">الجيزة</option>
                        <option value="الإسكندرية">الإسكندرية</option>
                        <option value="الدقهلية">الدقهلية</option>
                        <option value="الشرقية">الشرقية</option>
                        <option value="القليوبية">القليوبية</option>
                        <option value="كفر الشيخ">كفر الشيخ</option>
                        <option value="الغربية">الغربية</option>
                        <option value="المنوفية">المنوفية</option>
                        <option value="البحيرة">البحيرة</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="user_type" className="form-label">
                        نوع المستخدم
                      </label>
                      <select
                        className="form-select"
                        id="user_type"
                        name="user_type"
                        value={profileData.user_type}
                        onChange={handleProfileChange}
                        required
                      >
                        <option value="individual">فرد</option>
                        <option value="workshop">ورشة تدوير</option>
                        <option value="collector">جامع خردة</option>
                        <option value="organization">جمعية بيئية</option>
                        <option value="company">شركة</option>
                      </select>
                    </div>
                    {profileData.user_type !== "individual" && (
                      <div className="col-md-6 mb-3">
                        <label htmlFor="organization" className="form-label">
                          اسم المؤسسة
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="organization"
                          name="organization"
                          value={profileData.organization}
                          onChange={handleProfileChange}
                        />
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="bio" className="form-label">
                      نبذة تعريفية
                    </label>
                    <textarea
                      className="form-control"
                      id="bio"
                      name="bio"
                      rows="3"
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      placeholder="اكتب نبذة مختصرة عنك..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        حفظ التغييرات
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="card border-0 shadow-sm">
              <div className="card-header">
                <h5 className="mb-0">تغيير كلمة المرور</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handlePasswordSubmit}>
                  <div className="mb-3">
                    <label htmlFor="current_password" className="form-label">
                      كلمة المرور الحالية
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="current_password"
                      name="current_password"
                      value={passwordData.current_password}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="new_password" className="form-label">
                      كلمة المرور الجديدة
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="new_password"
                      name="new_password"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirm_password" className="form-label">
                      تأكيد كلمة المرور الجديدة
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirm_password"
                      name="confirm_password"
                      value={passwordData.confirm_password}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-warning"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        جاري التحديث...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-key me-2"></i>
                        تغيير كلمة المرور
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
