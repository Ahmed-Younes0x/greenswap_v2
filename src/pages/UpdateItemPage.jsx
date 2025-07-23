"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { itemsAPI } from "../services/api"

const UpdateItemPage = () => {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    condition: "",
    quantity: "",
    unit: "",
    price: "",
    priceType: "free",
    location: "",
    contactMethod: "both",
    images: [],
    existingImages: []
  })
  const [error, setError] = useState(null)

  const categories = [
    { value: "furniture", label: "أثاث", id: 1 },
    { value: "electronics", label: "إلكترونيات", id: 2 },
    { value: "metals", label: "معادن", id: 3 },
    { value: "plastic", label: "بلاستيك", id: 4 },
    { value: "paper", label: "ورق وكرتون", id: 5 },
    { value: "glass", label: "زجاج", id: 6 },
    { value: "textiles", label: "منسوجات", id: 7 },
    { value: "construction", label: "مواد بناء", id: 8 },
    { value: "other", label: "أخرى", id: 9 },
  ]

  const conditions = [
    { value: "excellent", label: "ممتاز" },
    { value: "good", label: "جيد" },
    { value: "fair", label: "مقبول" },
    { value: "poor", label: "يحتاج إصلاح" },
    { value: "scrap", label: "خردة" },
  ]

  const units = [
    { value: "piece", label: "قطعة" },
    { value: "kg", label: "كيلوجرام" },
    { value: "ton", label: "طن" },
    { value: "meter", label: "متر" },
    { value: "box", label: "صندوق" },
    { value: "bag", label: "كيس" },
  ]

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true)
        const response = await itemsAPI.getItem(id)
        const item = response.data
        
        // Check if current user is the owner
        if (currentUser?.id !== item.user.id) {
          navigate("/")
          return
        }

        setFormData({
          title: item.title,
          description: item.description,
          category: item.category?.id || "",
          condition: item.condition,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price || "",
          priceType: item.price_type || "free",
          location: item.location,
          contactMethod: item.contact_method || "both",
          images: [],
          existingImages: item.images || []
        })
      } catch (err) {
        console.error("Failed to fetch item:", err)
        setError("فشل تحميل بيانات المنتج. يرجى المحاولة مرة أخرى.")
      } finally {
        setLoading(false)
      }
    }

    fetchItem()
  }, [id, currentUser, navigate])

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target
    
    if (type === "file") {
      setFormData(prev => ({
        ...prev,
        images: Array.from(files)
      }))
    } else if (type === "checkbox") {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else if (type === "radio") {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      existingImages: prev.existingImages.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.title || !formData.category || !formData.description) {
      setError("الرجاء إدخال العنوان، الفئة والوصف")
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Prepare form data
      const formDataToSend = new FormData()
      formDataToSend.append("title", formData.title)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("category", formData.category)
      formDataToSend.append("condition", formData.condition)
      formDataToSend.append("quantity", formData.quantity)
      formDataToSend.append("unit", formData.unit)
      formDataToSend.append("price_type", formData.priceType)
      
      if (formData.priceType !== "free") {
        formDataToSend.append("price", formData.price || 0)
      }
      
      formDataToSend.append("location", formData.location)
      formDataToSend.append("contact_method", formData.contactMethod)
      
      // Add new images
      formData.images.forEach(image => {
        formDataToSend.append("images", image)
      })
      
      // Add existing images that weren't removed
      formData.existingImages.forEach(image => {
        formDataToSend.append("existing_images", image.id)
      })

      // Call the API
      const response = await itemsAPI.updateItem(id, formDataToSend)
      
      // Success - redirect to item page
      navigate(`/item/${response.data.id}`)
      
    } catch (err) {
      console.error("Error updating item:", err)
      setError(
        err.response?.data?.message || 
        err.message || 
        "حدث خطأ أثناء تحديث العنصر. الرجاء المحاولة مرة أخرى"
      )
    } finally {
      setLoading(false)
    }
  }

  if (loading && !formData.title) {
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

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-success text-white">
              <h4 className="mb-0">
                <i className="fas fa-edit me-2"></i>
                تعديل الإعلان
              </h4>
            </div>
            <div className="card-body p-4">
              {error && (
                <div className="alert alert-danger">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Basic Information */}
                <div className="mb-4">
                  <h5 className="text-success mb-3">المعلومات الأساسية</h5>

                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                      عنوان الإعلان *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="مثال: أثاث مكتبي مستعمل"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      الوصف *
                    </label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      rows="4"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      placeholder="اكتب وصفاً مفصلاً للمخلف..."
                    ></textarea>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="category" className="form-label">
                        الفئة *
                      </label>
                      <select
                        className="form-select"
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                      >
                        <option value="">اختر الفئة</option>
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.id}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="condition" className="form-label">
                        الحالة *
                      </label>
                      <select
                        className="form-select"
                        id="condition"
                        name="condition"
                        value={formData.condition}
                        onChange={handleChange}
                        required
                      >
                        <option value="">اختر الحالة</option>
                        {conditions.map((cond) => (
                          <option key={cond.value} value={cond.value}>
                            {cond.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Quantity and Price */}
                <div className="mb-4">
                  <h5 className="text-success mb-3">الكمية والسعر</h5>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="quantity" className="form-label">
                        الكمية *
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="quantity"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        required
                        min="1"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="unit" className="form-label">
                        الوحدة *
                      </label>
                      <select
                        className="form-select"
                        id="unit"
                        name="unit"
                        value={formData.unit}
                        onChange={handleChange}
                        required
                      >
                        <option value="">اختر الوحدة</option>
                        {units.map((unit) => (
                          <option key={unit.value} value={unit.value}>
                            {unit.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">نوع السعر *</label>
                    <div className="row">
                      <div className="col-md-4">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="priceType"
                            id="free"
                            value="free"
                            checked={formData.priceType === "free"}
                            onChange={handleChange}
                          />
                          <label className="form-check-label" htmlFor="free">
                            مجاني
                          </label>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="priceType"
                            id="fixed"
                            value="fixed"
                            checked={formData.priceType === "fixed"}
                            onChange={handleChange}
                          />
                          <label className="form-check-label" htmlFor="fixed">
                            سعر ثابت
                          </label>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="priceType"
                            id="negotiable"
                            value="negotiable"
                            checked={formData.priceType === "negotiable"}
                            onChange={handleChange}
                          />
                          <label className="form-check-label" htmlFor="negotiable">
                            قابل للتفاوض
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {formData.priceType !== "free" && (
                    <div className="mb-3">
                      <label htmlFor="price" className="form-label">
                        السعر (جنيه مصري)
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        min="0"
                        placeholder="أدخل السعر"
                      />
                    </div>
                  )}
                </div>

                {/* Location and Contact */}
                <div className="mb-4">
                  <h5 className="text-success mb-3">الموقع والتواصل</h5>

                  <div className="mb-3">
                    <label htmlFor="location" className="form-label">
                      المحافظة *
                    </label>
                    <select
                      className="form-select"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
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

                  <div className="mb-3">
                    <label className="form-label">طريقة التواصل المفضلة</label>
                    <div className="row">
                      <div className="col-md-4">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="contactMethod"
                            id="phone"
                            value="phone"
                            checked={formData.contactMethod === "phone"}
                            onChange={handleChange}
                          />
                          <label className="form-check-label" htmlFor="phone">
                            هاتف فقط
                          </label>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="contactMethod"
                            id="chat"
                            value="chat"
                            checked={formData.contactMethod === "chat"}
                            onChange={handleChange}
                          />
                          <label className="form-check-label" htmlFor="chat">
                            محادثة فقط
                          </label>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="contactMethod"
                            id="both"
                            value="both"
                            checked={formData.contactMethod === "both"}
                            onChange={handleChange}
                          />
                          <label className="form-check-label" htmlFor="both">
                            كلاهما
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Images */}
                <div className="mb-4">
                  <h5 className="text-success mb-3">الصور</h5>

                  {/* Existing Images */}
                  {formData.existingImages.length > 0 && (
                    <>
                      <h6 className="mb-2">الصور الحالية</h6>
                      <div className="row mb-3">
                        {formData.existingImages.map((image, index) => (
                          <div key={image.id} className="col-md-3 mb-2">
                            <div className="card position-relative">
                              <img
                                src={image.image}
                                alt={`صورة ${index + 1}`}
                                className="card-img-top"
                                style={{ height: "100px", objectFit: "cover" }}
                              />
                              <button
                                type="button"
                                className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                                onClick={() => handleRemoveImage(index)}
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* New Images */}
                  <div className="mb-3">
                    <label htmlFor="images" className="form-label">
                      إضافة صور جديدة (حتى 5 صور)
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      id="images"
                      name="images"
                      multiple
                      accept="image/*"
                      onChange={handleChange}
                    />
                    <div className="form-text">الصور الواضحة تزيد من فرص نجاح الإعلان</div>
                  </div>

                  {formData.images.length > 0 && (
                    <div className="row">
                      {Array.from(formData.images)
                        .slice(0, 5)
                        .map((file, index) => (
                          <div key={index} className="col-md-3 mb-2">
                            <div className="card">
                              <div className="card-body p-2 text-center">
                                <i className="fas fa-image text-muted fs-4"></i>
                                <p className="small mb-0 mt-1">{file.name}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="d-flex gap-3">
                  <button type="submit" className="btn btn-success btn-lg flex-grow-1" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        جاري التحديث...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        حفظ التغييرات
                      </>
                    )}
                  </button>
                  <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UpdateItemPage