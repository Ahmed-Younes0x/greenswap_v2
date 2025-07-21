from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Order
from .serializers import OrderSerializer
from django.utils.timezone import now
from items.models import Item
from accounts.models import User

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_orders(request):
    user = request.user
    received = Order.objects.filter(seller=user).order_by('-created_at')
    sent = Order.objects.filter(buyer=user).order_by('-created_at')
    completed = Order.objects.filter(status='completed', buyer=user) | Order.objects.filter(status='completed', seller=user)
    print(f"Received orders: {received.count()}, Sent orders: {sent.count()}, Completed orders: {completed.count()}")
    data = {
        'received': OrderSerializer(received, many=True).data,
        'sent': OrderSerializer(sent, many=True).data,
        'completed': OrderSerializer(completed.distinct(), many=True).data
    }
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    # Get required data from request
    item_id = request.data.get('item')
    message = request.data.get('message', '')
    price = request.data.get('price', 0)

    # Validate required fields
    if not item_id:
        return Response({'error': 'Item ID is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Get the item and seller
        item = Item.objects.get(id=item_id)
        seller = item.user
        
        # Check if user is trying to order their own item
        if seller == request.user:
            return Response({'error': 'Cannot create order for your own item'}, 
                          status=status.HTTP_400_BAD_REQUEST)

        # Create the order
        order = Order.objects.create(
            item=item,
            buyer=request.user,
            seller=seller,
            message=message,
            price=price,
            status='pending'
        )
        
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

    except Item.DoesNotExist:
        return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_order_status(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    # Only seller can update order status
    if order.seller != request.user:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    status_value = request.data.get('status')
    if status_value not in ['accepted', 'rejected', 'completed']:
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

    order.status = status_value
    if status_value == 'completed':
        order.completed_at = now()
    order.save()
    
    return Response(OrderSerializer(order).data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def cancel_order(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    # Only buyer can cancel their own order
    if order.buyer != request.user:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    # Only pending orders can be canceled by buyer
    if order.status != 'pending':
        return Response({'error': 'Only pending orders can be canceled'}, 
                       status=status.HTTP_400_BAD_REQUEST)

    order.delete()
    return Response({'message': 'Order canceled successfully'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_order_details(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    # Only buyer or seller can view order details
    if order.buyer != request.user and order.seller != request.user:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    return Response(OrderSerializer(order).data)