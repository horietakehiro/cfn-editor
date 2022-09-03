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
    path("project/<str:project_name>/template/<str:template_name>/resource", views.resource, name="Resource"),
    path("project/<str:project_name>/template/<str:template_name>/resource/<str:resource_name>", views.resource, name="Resource"),
    path("project/<str:project_name>/template/<str:template_name>/resource/<str:resource_name>/<str:attribute_name>", views.attributes, name="Attributes"),

    path("project/<str:project_name>/template/<str:template_name>/output", views.output, name="Output"),
    path("project/<str:project_name>/template/<str:template_name>/output/<str:output_name>", views.output, name="Output"),
 
]