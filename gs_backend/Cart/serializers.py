from rest_framework import serializers
from items.models import Item
from accounts.models import User
from .models import Cart, CartItem
from items.serializers import ItemListSerializer  # Import your Item serializer

class CartItemReadSerializer(serializers.ModelSerializer):
    item = ItemListSerializer()  # Nested serializer for read operations
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'item', 'added_at', 'total_price']
        read_only_fields = ['added_at']

    def get_total_price(self, obj):
        return obj.quantity * (obj.item.price or 0)

class CartItemWriteSerializer(serializers.ModelSerializer):
    item = serializers.PrimaryKeyRelatedField(queryset=Item.objects.all())

    class Meta:
        model = CartItem
        fields = ['id', 'item', 'quantity']
        extra_kwargs = {
            'quantity': {'min_value': 1}
        }

    def validate(self, data):
        item = data['item']
        if item.user == self.context['request'].user:
            raise serializers.ValidationError("You cannot add your own items to cart")
        return data

class CartSerializer(serializers.ModelSerializer):
    items = CartItemReadSerializer(many=True, read_only=True)
    total_items = serializers.SerializerMethodField()
    grand_total = serializers.SerializerMethodField()
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'user', 'created_at', 'updated_at', 
                 'items', 'total_items', 'grand_total']
        read_only_fields = ['user', 'created_at', 'updated_at']

    def get_total_items(self, obj):
        return obj.items.count()

    def get_grand_total(self, obj):
        return sum(item.quantity * (item.item.price or 0) for item in obj.items.all())