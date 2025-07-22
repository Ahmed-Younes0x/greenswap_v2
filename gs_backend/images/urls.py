from django.urls import path
from .views import serve_image, serve_image_itemid

urlpatterns = [
    path('items/<str:filename>/', serve_image, name='serve-image'),
    path('item/<int:itemid>/', serve_image_itemid, name='serve-image-itemid'),
]
