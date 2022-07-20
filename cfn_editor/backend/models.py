from django.db import models

# Create your models here.
class CfnSpecification(models.Model):
    region_name = models.CharField("RegionName", primary_key=True, max_length=100)

class CfnResourceType(models.Model):
    spec = models.ForeignKey(CfnSpecification, on_delete=models.CASCADE, related_name="resource_types")
    resource_type = models.TextField("ResourceType")

class CfnResourceAttribute(models.Model):
    attribute_type = models.TextField("AttributeType")
    attribute_name = models.TextField("AttributeName")
    resource_type = models.ForeignKey(CfnResourceType, on_delete=models.CASCADE, related_name="resource_attributes")
    
