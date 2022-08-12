from django.db import models

# Create your models here.
# class CfnSpecification(models.Model):
#     region_name = models.CharField("RegionName", primary_key=True, max_length=100)

# class CfnResourceType(models.Model):
#     spec = models.ForeignKey(CfnSpecification, on_delete=models.CASCADE, related_name="resource_types")
#     resource_type = models.TextField("ResourceType")

# class CfnResourceAttribute(models.Model):
#     attribute_type = models.TextField("AttributeType")
#     attribute_name = models.TextField("AttributeName")
#     resource_type = models.ForeignKey(CfnResourceType, on_delete=models.CASCADE, related_name="resource_attributes")

from django.contrib import admin


class Project(models.Model):

    name = models.CharField("Name", primary_key=True, max_length=256)

class Template(models.Model):
    def upload_location(instance, filename):
        return f"uploads/{instance.project.name}/{filename}"

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="templates")
    name = models.CharField("Name", max_length=256)
    file = models.FileField("File", blank=True, upload_to=upload_location)


admin.site.register([Project, Template])

