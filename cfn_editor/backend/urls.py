from django.urls import path

from . import views

urlpatterns = [
    path("resourceType", views.resource_type, name="resourceType"),
    path("resourceType/<str:resource_type>", views.resource_type, name="GetResourceSpec"),
    path("project", views.project, name="Project"),
    path("project/<str:project_name>", views.project, name="Project"),
    path("project/<str:project_name>/template", views.template, name="Template"),
    path("project/<str:project_name>/template/<str:template_name>", views.template, name="Template"),
    path("project/<str:project_name>/template/<str:template_name>/parameter", views.parameter, name="Parameter"),
    path("project/<str:project_name>/template/<str:template_name>/parameter/<str:parameter_name>", views.parameter, name="Parameter"),

]