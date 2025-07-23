from django.urls import path
from .views import serve_image, serve_image_itemid #serve_image_avatar

urlpatterns = [
    path('items/<str:filename>/', serve_image, name='serve-image'),
    path('item/<int:itemid>/', serve_image_itemid, name='serve-image-itemid'),
    # path('avatar/<int:itemid>/', serve_image_avatar, name='serve-image-itemid'),
]
