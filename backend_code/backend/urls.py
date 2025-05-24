from django.contrib import admin
from django.urls import path, include  # ✅ include is required
import users

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/users/", include("users.urls")),  # ✅ users app URLs
]
