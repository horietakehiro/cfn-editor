from cfn_docgen import cfn_spec
from .models import CfnResourceType, CfnSpecification, CfnResourceAttribute
import tqdm

def import_specs():
    spec = cfn_spec.CfnSpecification()
    try:
        resource_types = list(CfnResourceType.objects.all())
        if not len(resource_types):
            resource_types = []
            spec_obj = CfnSpecification.objects.create(region_name=spec.region_name)
            for k, v in tqdm.tqdm(spec.spec["ResourceTypes"].items()):
                resource_types.append(CfnResourceType.objects.create(
                    resource_type=k,
                    spec=spec_obj,
                ))
            
        attribute_types = CfnResourceAttribute.objects.all()
        print(resource_types)
        if not len(attribute_types):
            for resource_type in resource_types:
                rt = resource_type.resource_type
                for k, v in spec.spec["ResourceTypes"][rt].get("Attributes", {}).items():
                    CfnResourceAttribute.objects.create(
                        attribute_name=k,
                        attribute_type=list(v.values())[0],
                        resource_type=resource_type,
                        
                    )
    except Exception as ex:
        print(ex)
        pass

# if __name__ == "__main__":
#     import_specs()