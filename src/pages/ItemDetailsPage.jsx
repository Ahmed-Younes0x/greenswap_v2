"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { itemsAPI, ordersAPI } from "../services/api.js";

const ItemDetailsPage = () => {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showContactModal, setShowContactModal] = useState(false)
  const [orderMessage, setOrderMessage] = useState("")
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [isOrdering, setIsOrdering] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true)
        const response = await itemsAPI.getItem(id)
        setItem(response.data)
        console.log(response.data.user);
        
      } catch (err) {
        console.error("Failed to fetch item:", err)
        setError("فشل تحميل بيانات المنتج. يرجى المحاولة مرة أخرى.")
      } finally {
        setLoading(false)
      }
    }

    fetchItem()
  }, [id])

  const getCategoryLabel = (category) => {
    const categories = {
      furniture: "أثاث",
      electronics: "إلكترونيات",
      metals: "معادن",
      plastic: "بلاستيك",
      paper: "ورق وكرتون",
      glass: "زجاج",
      textiles: "منسوجات",
      construction: "مواد بناء",
      other: "أخرى",
    }
    return categories[category] || category
  }

  const getConditionLabel = (condition) => {
    const conditions = {
      excellent: "ممتاز",
      good: "جيد",
      fair: "مقبول",
      poor: "يحتاج إصلاح",
      scrap: "خردة",
    }
    return conditions[condition] || condition
  }

  const getUserTypeLabel = (type) => {
    const types = {
      individual: "فرد",
      workshop: "ورشة تدوير",
      collector: "جامع خردة",
      organization: "جمعية بيئية",
      company: "شركة",
    }
    return types[type] || type
  }

  const handleInterest = async () => {
    if (!currentUser) {
      alert("يجب تسجيل الدخول أولاً")
      navigate("/login")
      return
    }

    try {
      await itemsAPI.markInterested(item.id)
      alert("تم إرسال إشعار الاهتمام بنجاح!")
    } catch (err) {
      console.error("Failed to mark interest:", err)
      alert("فشل إرسال إشعار الاهتمام. يرجى المحاولة مرة أخرى.")
    }
  }

  const handleContact = () => {
    if (!currentUser) {
      alert("يجب تسجيل الدخول أولاً")
      navigate("/login")
      return
    }
    setShowContactModal(true)
  }

  const handleOrderClick = () => {
    if (!currentUser) {
      alert("يجب تسجيل الدخول أولاً")
      navigate("/login")
      return
    }
    setShowOrderModal(true)
  }

  const handleOrderSubmit = async () => {
    if (!orderMessage.trim()) {
      alert("الرجاء إدخال رسالة للطلب")
      return
    }

    try {
      setIsOrdering(true)
      const orderData = {
        item: item.id,
        message: orderMessage,
        price: item.price || 0,
      }

      await ordersAPI.createOrder(orderData)
      alert("تم إرسال الطلب بنجاح!")
      setShowOrderModal(false)
      setOrderMessage("")
    } catch (err) {
      console.error("Failed to create order:", err)
      alert("فشل إرسال الطلب. يرجى المحاولة مرة أخرى.")
    } finally {
      setIsOrdering(false)
    }
  }

  const handleDeleteItem = async () => {
    if (!window.confirm("هل أنت متأكد أنك تريد حذف هذا الإعلان؟")) {
      return
    }

    try {
      setIsDeleting(true)
      await itemsAPI.deleteItem(item.id)
      alert("تم حذف الإعلان بنجاح")
      navigate("/my-items")
    } catch (err) {
      console.error("Failed to delete item:", err)
      alert("فشل حذف الإعلان. يرجى المحاولة مرة أخرى.")
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">جاري التحميل...</span>
          </div>
          <p className="mt-2">جاري تحميل بيانات المنتج...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-5 text-center text-danger">
        <p>{error}</p>
        <button 
          className="btn btn-success"
          onClick={() => window.location.reload()}
        >
          إعادة المحاولة
        </button>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <h4>المنتج غير موجود</h4>
          <Link to="/search" className="btn btn-success">
            العودة للبحث
          </Link>
        </div>
      </div>
    )
  }

  const isOwner = currentUser && currentUser.id === item.user.id

  return (
    <div className="container py-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none">
              الرئيسية
            </Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/search" className="text-decoration-none">
              البحث
            </Link>
          </li>
          <li className="breadcrumb-item active">{item.title}</li>
        </ol>
      </nav>

      <div className="row">
        {/* Images Section */}
        <div className="col-lg-8 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              {/* Main Image */}
              <div className="position-relative">
                <img
                  src={`http://localhost:8000/api/images/item/${item.id}/` || "/placeholder.svg"}
                  alt={item.title}
                  className="w-100"
                  style={{ height: "400px", objectFit: "cover" }}
                />
                <span className="badge bg-success position-absolute top-0 start-0 m-3">
                  {getCategoryLabel(item.category?.name)}
                </span>
                <span className="badge bg-secondary position-absolute top-0 end-0 m-3">
                  {getConditionLabel(item.condition)}
                </span>
              </div>

              {/* Image Thumbnails */}
              {item.images?.length > 1 && (
                <div className="p-3">
                  <div className="row g-2">
                    {item.images.map((image, index) => (
                      <div key={index} className="col-3">
                        <img
                          src={image.image || "/placeholder.svg"}
                          alt={`صورة ${index + 1}`}
                          className={`w-100 rounded cursor-pointer ${
                            index === currentImageIndex ? "border border-success border-3" : ""
                          }`}
                          style={{ height: "80px", objectFit: "cover" }}
                          onClick={() => setCurrentImageIndex(index)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="card border-0 shadow-sm mt-4">
            <div className="card-header">
              <h5 className="mb-0">تفاصيل المنتج</h5>
            </div>
            <div className="card-body">
              <h4 className="mb-3">{item.title}</h4>
              <div className="mb-3">
                <pre className="text-wrap">{item.description}</pre>
              </div>

              {/* Product Details */}
              <div className="row">
                <div className="col-md-6">
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <strong>الفئة:</strong> {getCategoryLabel(item.category?.name)}
                    </li>
                    <li className="mb-2">
                      <strong>الحالة:</strong> {getConditionLabel(item.condition)}
                    </li>
                    <li className="mb-2">
                      <strong>الكمية:</strong> {item.quantity} {item.unit}
                    </li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <strong>الموقع:</strong> {item.location}
                    </li>
                    <li className="mb-2">
                      <strong>تاريخ النشر:</strong> {new Date(item.created_at).toLocaleDateString("ar-EG")}
                    </li>
                    <li className="mb-2">
                      <strong>المشاهدات:</strong> {item.views}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          {/* Price and Actions */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <div className="text-center mb-4">
                <h3 className="text-success mb-0">{item.price || "مجاني"}</h3>
                <small className="text-muted">{item.price_type === "negotiable" && "قابل للتفاوض"}</small>
              </div>

              {isOwner ? (
                <div className="d-grid gap-2">
                  <Link 
                    to={`/item/${item.id}/update`} 
                    className="btn btn-success btn-lg"
                  >
                    <i className="fas fa-edit me-2"></i>
                    تعديل الإعلان
                  </Link>
                  <button 
                    className="btn btn-danger"
                    onClick={handleDeleteItem}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        جاري الحذف...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-trash me-2"></i>
                        حذف الإعلان
                      </>
                    )}
                  </button>
                  <button className="btn btn-outline-primary" onClick={handleInterest}>
                    <i className="fas fa-heart me-2"></i>
                    عدد المهتمين ({item.interested_count || 0})
                  </button>
                </div>
              ) : (
                <div className="d-grid gap-2">
                  <button className="btn btn-success btn-lg" onClick={handleOrderClick}>
                    <i className="fas fa-shopping-cart me-2"></i>
                    تقديم طلب شراء
                  </button>
                  <button className="btn btn-outline-success" onClick={handleContact}>
                    <i className="fas fa-phone me-2"></i>
                    تواصل مع البائع
                  </button>
                  <button className="btn btn-outline-primary" onClick={handleInterest}>
                    <i className="fas fa-heart me-2"></i>
                    أبدي اهتماماً ({item.interested_count || 0})
                  </button>
                  <Link to={`/chat/${item.user.id}/item/${item.id}`} className="btn btn-outline-info">
                    <i className="fas fa-comments me-2"></i>
                    إرسال رسالة
                  </Link>
                </div>
              )}

              <hr />

              <div className="text-center">
                <small className="text-muted">
                  <i className="fas fa-shield-alt me-1"></i>
                  تواصل آمن عبر المنصة
                </small>
              </div>
            </div>
          </div>

          {/* Seller Info */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header">
              <h6 className="mb-0">معلومات {isOwner ? "الحساب" : "البائع"}</h6>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <img
                  src={item.user?.avatar || "/placeholder.svg"}
                  alt={item.user?.name}
                  className="rounded-circle me-3"
                  style={{ width: "50px", height: "50px", objectFit: "cover" }}
                />
                <div>
                  <h6 className="mb-0">{item.user?.username || "غير معروف"}</h6>
                  <small className="text-muted">{getUserTypeLabel(item.user?.user_type)}</small>
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span>التقييم</span>
                  <span>
                    <i className="fas fa-star text-warning me-1"></i>
                    {item.user?.rating || 0} ({item.user?.reviews_count || 0} تقييم)
                  </span>
                </div>
                <div className="progress" style={{ height: "5px" }}>
                  <div 
                    className="progress-bar bg-warning" 
                    style={{ width: `${((item.user?.rating || 0) / 5) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="row text-center">
                <div className="col-6">
                  <div className="border-end">
                    <h6 className="text-success mb-0">{item.user?.items_count || 0}</h6>
                    <small className="text-muted">إعلان</small>
                  </div>
                </div>
                <div className="col-6">
                  <h6 className="text-success mb-0">{item.user?.completed_orders || 0}</h6>
                  <small className="text-muted">صفقة مكتملة</small>
                </div>
              </div>

              <hr />

              <div className="text-center">
                <small className="text-muted">
                  عضو منذ {item.user?.created_at ? new Date(item.user.created_at).toLocaleDateString("ar-EG") : "غير معروف"}
                </small>
              </div>
            </div>
          </div>

          {/* Safety Tips */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-warning text-dark">
              <h6 className="mb-0">
                <i className="fas fa-exclamation-triangle me-2"></i>
                نصائح الأمان
              </h6>
            </div>
            <div className="card-body">
              <ul className="list-unstyled small mb-0">
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  تأكد من حالة المنتج قبل الاستلام
                </li>
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  التقي في مكان عام وآمن
                </li>
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  لا تدفع مقدماً قبل المعاينة
                </li>
                <li className="mb-0">
                  <i className="fas fa-check text-success me-2"></i>
                  أبلغ عن أي سلوك مشبوه
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">معلومات التواصل</h5>
                <button type="button" className="btn-close" onClick={() => setShowContactModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="text-center mb-3">
                  <img
                    src={item.user?.avatar || "/placeholder.svg"}
                    alt={item.user?.name}
                    className="rounded-circle mb-2"
                    style={{ width: "80px", height: "80px", objectFit: "cover" }}
                  />
                  <h5>{item.user?.name || "غير معروف"}</h5>
                </div>

                <div className="d-grid gap-2">
                  {item.user?.phone && (
                    <>
                      <a href={`tel:${item.user.phone}`} className="btn btn-success">
                        <i className="fas fa-phone me-2"></i>
                        اتصال: {item.user.phone}
                      </a>
                      <a
                        href={`https://wa.me/2${item.user.phone.substring(1)}`}
                        className="btn btn-outline-success"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i className="fab fa-whatsapp me-2"></i>
                        واتساب
                      </a>
                    </>
                  )}
                  <Link to={`/chat/${item.user.id}/item/${item.id}`} className="btn btn-outline-primary">
                    <i className="fas fa-comments me-2"></i>
                    محادثة عبر المنصة
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Modal */}
      {showOrderModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">تقديم طلب شراء</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowOrderModal(false)
                    setOrderMessage("")
                  }}
                  disabled={isOrdering}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="orderMessage" className="form-label">
                    رسالة الطلب (اختياري)
                  </label>
                  <textarea
                    id="orderMessage"
                    className="form-control"
                    rows="3"
                    value={orderMessage}
                    onChange={(e) => setOrderMessage(e.target.value)}
                    disabled={isOrdering}
                  ></textarea>
                </div>
                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  سيتم إرسال طلبك إلى البائع للموافقة عليه
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowOrderModal(false)
                    setOrderMessage("")
                  }}
                  disabled={isOrdering}
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleOrderSubmit}
                  disabled={isOrdering}
                >
                  {isOrdering ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      جاري الإرسال...
                    </>
                  ) : (
                    "إرسال الطلب"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ItemDetailsPage