"""cfn_editor URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path

from django.contrib.auth.models import User
# from rest_framework import routers, serializers, viewsets

# class UserSerializer(serializers.HyperlinkedModelSerializer):
#     class Meta:
#         model = User
#         fields = ["url", "username", "email", "is_staff"]

# class UserViewSet(viewsets.ModelViewSet):
#     queryset = User.objects.all()
#     serializer_class = UserSerializer

# from backend.models import CfnResourceType, CfnResourceAttribute, CfnSpecification

# class CfnResourceAttributeSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = CfnResourceAttribute
#         fields = ["attribute_type", "attribute_name"]
# class CfnResourceAttributeViewSet(viewsets.ModelViewSet):
#     queryset = CfnResourceAttribute.objects.all()
#     serializer_class = CfnResourceAttributeSerializer


# class CfnResourceTypeSerializer(serializers.ModelSerializer):
#     resource_attributes = CfnResourceAttributeSerializer(many=True, read_only=True)
#     class Meta:
#         model = CfnResourceType
#         fields = ["resource_type", "resource_attributes"]
# class CfnResourceTypeViewSet(viewsets.ModelViewSet):
#     queryset = CfnResourceType.objects.all()
#     serializer_class = CfnResourceTypeSerializer


# class CfnSpecificationSerializer(serializers.ModelSerializer):
#     resource_types = CfnResourceTypeSerializer(many=True, read_only=True)
#     class Meta:
#         model = CfnSpecification
#         fields = ["region_name", "resource_types"]
# class CfnSpecificationViewSet(viewsets.ModelViewSet):
#     queryset = CfnSpecification.objects.all()
#     serializer_class = CfnSpecificationSerializer


# router = routers.DefaultRouter()
# router.register(r"users", UserViewSet)
# router.register(r"cfn_specfications", CfnSpecificationViewSet)
# # router.register(r"cfn_resource_type", CfnResourceTypeViewSet)
# # router.register(r"cfn_attribute", CfnResourceAttributeViewSet)


from django.conf import settings
from django.conf.urls.static import static

# import backend
urlpatterns = [
    # path("", include(router.urls)),
    path('admin/', admin.site.urls),
    path('api/', include('backend.urls')),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)