from rest_framework import serializers
from items.serializers import ItemImageSerializer
from items.models import Item
from .models import Order
from accounts.serializers import UserProfileSerializer  # assumes you already have a user serializer

class ItemSerializer(serializers.ModelSerializer):

    class Meta:
        model = Item
        fields = ['id', 'title', 'category']

class OrderSerializer(serializers.ModelSerializer):
    item = ItemSerializer()
    # image = ItemImageSerializer()
    buyer = UserProfileSerializer()
    seller = UserProfileSerializer()
    completed_at = serializers.DateTimeField(required=False, allow_null=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'item',
            'buyer',
            'seller',
            'message',
            'price',
            'status',
            'payment_status',
            'payment_date',
            'created_at',
            'completed_at'
        ]
        read_only_fields = ['created_at', 'completed_at']
