from django.urls import path
from .views import CartViewSet

urlpatterns = [
    path('', CartViewSet.as_view({
        'get': 'retrieve',}))
    ,
    ]