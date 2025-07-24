from django.db import models
from django.conf import settings
from items.models import Item

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    ]

    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='sent_orders', on_delete=models.CASCADE)
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='received_orders', on_delete=models.CASCADE)
    message = models.TextField()
    price = models.CharField(max_length=50)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, default='unpaid')  # e.g., 'paid', 'unpaid'
    payment_date = models.DateTimeField(blank=True, null=True)  # When the payment was made
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Order #{self.pk} - {self.item.title}"
