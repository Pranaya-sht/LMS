from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    BookViewSet,
    MyBorrowedBooksView,
    AddToBookListView,
    RenewBookView,
    RemoveBookView,
    ProfileView
)

router = DefaultRouter()
router.register(r'books', BookViewSet)

urlpatterns = [
    path('my-books/', MyBorrowedBooksView.as_view(), name='my-borrowed-books'),
    path('rent-book/', AddToBookListView.as_view(), name='rent-book'),
    path('renew-book/<int:pk>/', RenewBookView.as_view(), name='renew-book'),
    path('remove-book/<int:pk>/', RemoveBookView.as_view(), name='remove-book'),
    path('api/profile/', ProfileView.as_view(), name='profile'),
]

urlpatterns += router.urls