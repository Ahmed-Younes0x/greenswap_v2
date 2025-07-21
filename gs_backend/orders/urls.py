from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_orders, name='list_orders'),
    path('create/', views.create_order, name='create-order'),
    path('<int:order_id>/', views.get_order_details, name='order-details'),
    path('<int:order_id>/status/', views.update_order_status, name='update_order_status'),
    path('<int:order_id>/cancel/', views.cancel_order, name='cancel-order'),
]
