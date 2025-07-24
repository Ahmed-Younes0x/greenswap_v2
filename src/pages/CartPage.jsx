import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartAPI
} from '../services/api';
import { Button, Table, Container, Alert, Badge } from 'react-bootstrap';
import { FaTrash, FaPlus, FaMinus, FaShoppingCart } from 'react-icons/fa';

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const cartData = await CartAPI.getCart();
      setCart(cartData);
      console.log("Cart data fetched:", cartData);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await CartAPI.removeItem(itemId);
      await fetchCart(); // Refresh cart
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClearCart = async () => {
    try {
      await CartAPI.clearCart();
      setCart(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    try {
      await CartAPI.updateQuantity(itemId, newQuantity);
      await fetchCart(); // Refresh cart
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) return (
    <Container className="py-5 text-center">
      <div className="spinner-border text-success" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-2">Loading your cart...</p>
    </Container>
  );

  if (error) return (
    <Container className="py-5">
      <Alert variant="danger">
        Error loading cart: {error}
      </Alert>
    </Container>
  );

  if (!cart || cart.data.items.length === 0) return (
    <Container className="py-5 text-center">
      <FaShoppingCart size={48} className="text-muted mb-3" />
      <h4>Your cart is empty</h4>
      <Button 
        variant="success" 
        onClick={() => navigate('/search')}
        className="mt-3"
      >
        Browse Items
      </Button>
    </Container>
  );

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          Your Cart <Badge bg="secondary">{cart.total_items}</Badge>
        </h2>
        <div>
          <Button 
            variant="outline-danger" 
            onClick={handleClearCart}
            className="me-2"
          >
            Clear Cart
          </Button>
          <Button 
            variant="success" 
            onClick={handleCheckout}
          >
            Proceed to Checkout
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Item</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {cart.items.map((cartItem) => (
            <tr key={cartItem.id}>
              <td>
                <div className="d-flex align-items-center">
                  <img 
                    src={cartItem.item.images?.[0]?.image || '/placeholder.svg'} 
                    alt={cartItem.item.title}
                    style={{ width: '60px', height: '60px', objectFit: 'cover', marginRight: '15px' }}
                  />
                  <div>
                    <h6 className="mb-1">{cartItem.item.title}</h6>
                    <small className="text-muted">{cartItem.item.category?.name}</small>
                  </div>
                </div>
              </td>
              <td>${cartItem.item.price?.toFixed(2) || 'Free'}</td>
              <td>
                <div className="d-flex align-items-center">
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => handleQuantityChange(cartItem.id, cartItem.quantity - 1)}
                    disabled={cartItem.quantity <= 1}
                  >
                    <FaMinus />
                  </Button>
                  <span className="mx-2">{cartItem.quantity}</span>
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => handleQuantityChange(cartItem.id, cartItem.quantity + 1)}
                  >
                    <FaPlus />
                  </Button>
                </div>
              </td>
              <td>${(cartItem.quantity * (cartItem.item.price || 0)).toFixed(2)}</td>
              <td>
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => handleRemoveItem(cartItem.id)}
                >
                  <FaTrash />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="3" className="text-end fw-bold">Grand Total:</td>
            <td colSpan="2" className="fw-bold">
              ${cart.grand_total?.toFixed(2) || '0.00'}
            </td>
          </tr>
        </tfoot>
      </Table>
    </Container>
  );
};

export default CartPage;