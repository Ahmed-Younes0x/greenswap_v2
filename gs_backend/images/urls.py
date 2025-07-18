from django.urls import path
from .views import serve_image

urlpatterns = [
    path('items/<str:filename>/', serve_image, name='serve-image'),
]
