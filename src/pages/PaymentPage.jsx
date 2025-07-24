import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { paymentAPI, ordersAPI } from "../services/api.js";
import { useAuth } from "../context/AuthContext";

const PaymentPage = () => {
  const { orderId } = useParams(); // Get orderId from URL params
  const { currentUser } = useAuth();

  const [senderPhone, setSenderPhone] = useState("");
  const [amount, setAmount] = useState(0);
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState({
    received: [],
    sent: [],
    completed: [],
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null); // Store the specific order

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await ordersAPI.getMyOrders();

        // Process the orders data from backend
        const processedOrders = response.data;
        setOrders(processedOrders);
        
        // Find the specific order
        const foundOrder = processedOrders.sent?.find(
          (order) => order.id === parseInt(orderId)
        );
        
        setOrder(foundOrder);

        if (foundOrder) {
          const price = foundOrder.total || foundOrder.price;
          
          if (price !== undefined && price !== null && !isNaN(price)) {
            setAmount(price);
          } else {
            console.error("Invalid price for order:", orderId);
            setAmount(0);
          }
        } else {
          setError("Order not found");
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError("فشل تحميل الطلبات. يرجى المحاولة مرة أخرى.");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && orderId) {
      fetchOrders();
    }
  }, [currentUser, orderId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!order) {
      setError("Invalid order");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      await paymentAPI.createPayment({
        order: order.id,
        sender_phone: senderPhone,
        amount: amount,
        reference_number: reference,
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to submit payment. Check data or try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!orderId) {
    return <div className="text-red-600 p-4">Order ID is missing</div>;
  }

  if (loading && !order) {
    return <div className="p-4">Loading order details...</div>;
  }

  if (error && !order) {
    return <div className="text-red-600 p-4">{error}</div>;
  }

  if (submitted) {
    return (
      <div className="p-4 text-green-600 text-center">
        <h3 className="text-xl font-semibold mb-2">تم تقديم الدفع بنجاح</h3>
        <p>في انتظار التحقق من الدفع</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">دفع فودافون كاش</h2>
      
      {error && <p className="text-red-600 mb-4 p-2 bg-red-100 rounded">{error}</p>}
      
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <h3 className="font-medium">تفاصيل الطلب</h3>
        {order && (
          <>
            <p>رقم الطلب: {order.id}</p>
            <p>المبلغ: {amount} جنيه</p>
          </>
        )}
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-medium">رقم الهاتف المرسل:</label>
        <input
          type="tel"
          className="border rounded p-2 w-full"
          value={senderPhone}
          onChange={(e) => setSenderPhone(e.target.value)}
          required
          placeholder="01XXXXXXXX"
        />
      </div>
      
      <div className="mb-4">
        <label className="block mb-2 font-medium">رقم المرجع:</label>
        <input
          type="text"
          className="border rounded p-2 w-full"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          required
          placeholder="أدخل رقم المرجع"
        />
      </div>
      
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 disabled:bg-blue-400"
        disabled={loading || !order}
      >
        {loading ? "جاري التقديم..." : "تأكيد الدفع"}
      </button>
    </form>
  );
};

export default PaymentPage;