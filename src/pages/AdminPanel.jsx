"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { 
  authAPI,
  itemsAPI,
  notificationsAPI
} from "../services/api"

const AdminPanel = () => {
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalItems: 0,
    activeItems: 0,
    completedDeals: 0,
    pendingReports: 0,
    monthlyGrowth: 0,
  })
  const [users, setUsers] = useState([])
  const [items, setItems] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    
    const fetchAdminData = async () => {
      
      try {
        setLoading(true)
        
        // Fetch dashboard stats
        const statsResponse = await authAPI.getCurrentUser()
        console.log("Current user data:", statsResponse.data);
        
        setStats({
          totalUsers: statsResponse.data.total_users || 0,
          totalItems: statsResponse.data.total_items || 0,
          activeItems: statsResponse.data.active_items || 0,
          completedDeals: statsResponse.data.completed_deals || 0,
          pendingReports: statsResponse.data.pending_reports || 0,
          monthlyGrowth: statsResponse.data.monthly_growth || 0,
        })
        
        // Fetch users data
        const usersResponse = await authAPI.getAllusers()
        setUsers(usersResponse.data)
        console.log("Fetched users:", usersResponse.data);
        

        // Fetch items data
        const itemsResponse = await itemsAPI.getItems({ admin: true })
        setItems(itemsResponse.data)

        // Fetch reports data
        // const reportsResponse = await itemsAPI.get('/admin/reports/')
        // setReports(reportsResponse.data)

      } catch (err) {
        setError(err.response?.data?.message || "فشل تحميل البيانات")
        console.error("Admin data fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    if (currentUser?.user_type === "admin") {
      fetchAdminData()
    }
  }, [currentUser])

  const handleUserAction = async (userId, action) => {
    try {
      await authAPI.patch(`/admin/users/${userId}/`, { status: action })
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status: action } : user
      ))
      alert(`تم ${action === "active" ? "تفعيل" : "تعليق"} المستخدم بنجاح`)
    } catch (err) {
      alert(err.response?.data?.message || "فشل تنفيذ الإجراء")
    }
  }

  const handleItemAction = async (itemId, action) => {
    try {
      await itemsAPI.patch(`/admin/items/${itemId}/`, { status: action })
      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, status: action } : item
      ))
      alert(`تم ${action === "active" ? "الموافقة على" : "رفض"} المنتج`)
    } catch (err) {
      alert(err.response?.data?.message || "فشل تنفيذ الإجراء")
    }
  }

  const handleReportAction = async (reportId, action) => {
    try {
      await itemsAPI.patch(`/admin/reports/${reportId}/`, { status: action })
      setReports(prev => prev.map(report => 
        report.id === reportId ? { ...report, status: action } : report
      ))
      alert(`تم ${action === "resolved" ? "حل" : "رفض"} البلاغ`)
    } catch (err) {
      alert(err.response?.data?.message || "فشل تنفيذ الإجراء")
    }
  }

  // التحقق من صلاحيات الإدارة
  if (currentUser?.user_type !== "admin") {
    return (
      <div className="container py-5">
        <div className="text-center">
          <i className="fas fa-lock fs-1 text-danger mb-3"></i>
          <h4>غير مصرح لك بالوصول</h4>
          <p className="text-muted">هذه الصفحة مخصصة للمديرين فقط</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">جاري التحميل...</span>
          </div>
          <p className="mt-3">جاري تحميل بيانات الإدارة...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger text-center">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      {/* Header and Stats Cards remain the same as before */}
      {/* ... */}

      {/* Tabs Content with real data */}
      {activeTab === "users" && (
        <div className="card border-0 shadow-sm">
          <div className="card-header">
            <h5 className="mb-0">إدارة المستخدمين</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>المستخدم</th>
                    <th>النوع</th>
                    <th>تاريخ الانضمام</th>
                    <th>المنتجات</th>
                    <th>الصفقات</th>
                    <th>الحالة</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div>
                          <strong>{user.name}</strong>
                          <br />
                          <small className="text-muted">{user.email}</small>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-secondary">
                          {user.user_type === "individual"
                            ? "فرد"
                            : user.user_type === "workshop"
                              ? "ورشة"
                              : user.user_type === "company"
                                ? "شركة"
                                : user.user_type}
                        </span>
                      </td>
                      <td>{new Date(user.date_joined).toLocaleDateString("ar-EG")}</td>
                      <td>{user.items_count || 0}</td>
                      <td>{user.deals_count || 0}</td>
                      <td>
                        <span className={`badge ${user.status === "active" ? "bg-success" : "bg-danger"}`}>
                          {user.status === "active" ? "نشط" : "معلق"}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          {user.status === "active" ? (
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleUserAction(user.id, "suspended")}
                            >
                              تعليق
                            </button>
                          ) : (
                            <button
                              className="btn btn-outline-success"
                              onClick={() => handleUserAction(user.id, "active")}
                            >
                              تفعيل
                            </button>
                          )}
                          <button className="btn btn-outline-primary">عرض</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Similar updates for items and reports tabs */}
      {/* ... */}
    </div>
  )
}

export default AdminPanel