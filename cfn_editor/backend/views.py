import pandas as pd
from copy import deepcopy
import json
from django.http import HttpResponse, HttpRequest, JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from django.core import serializers

from cfn_flip import to_json
from cfn_docgen import cfn_spec, cfn_def

spec = cfn_spec.CfnSpecification()
def_ = None


from . import models
from . import forms


def template_accessor():
    cache_def = None
    cache_project = None
    cache_template = None

    def load_template(project_name:str, template_name:str) -> cfn_def.CfnTemplate:
        nonlocal cache_def
        nonlocal cache_project
        nonlocal cache_template

        if cache_project is None or cache_template is None:
            cache_project = project_name
            cache_template = template_name
        elif (cache_project == project_name and cache_template == template_name and cache_def is not None):
            return cache_def

        if cache_def is None or cache_project != project_name or cache_template != template_name:
            t = models.Template.objects.filter(name=template_name)
            print(t)
            t = t[0]
            cache_def = cfn_def.CfnTemplate(t.file.path)
            cache_project = project_name
            cache_template = template_name
            return cache_def

    def save_template(project_name:str, template_name:str, body:dict) -> cfn_def.CfnTemplate:
        nonlocal cache_def
        nonlocal cache_project
        nonlocal cache_template

        if cache_project is None or cache_template is None:
            cache_project = project_name
            cache_template = template_name


        t = models.Template.objects.filter(name=template_name)
        t = t[0]
        with t.file.open("w") as fp:
            json.dump(body, fp)
        cache_def = cfn_def.CfnTemplate(t.file.path)
        return cache_def
    
    return load_template, save_template

load_template, save_template = template_accessor()


# Create your views here.
def resource_type(request:HttpRequest, resource_type:str=None):

    if resource_type:
        resource_types = list(spec.spec["ResourceTypes"].keys())
        return JsonResponse(resource_types)

    resource_spec = spec.get_resource_spec(resource_type)
    return JsonResponse(resource_spec)


@csrf_exempt
def project(request:HttpRequest, project_name:str=None):
    if request.method == "POST":
        print(request.body)
        body = json.loads(request.body)
        p = models.Project.objects.create(
            name=body["Name"]
        )
        print(p)

        return JsonResponse({"Name": p.name})

    if request.method == "DELETE":
        print(request.body)
        body = json.loads(request.body)
        p = models.Project.objects.get(
            name=body["Name"]
        )
        p.delete()

        return JsonResponse({"Name": body["Name"]})

    if not project_name:
        projects = models.Project.objects.all()
        projects = [{"Name": p.name} for p in projects]
        return JsonResponse({"Projects": projects})


    project = models.Project.objects.get(name=project_name)
    print(project)

    templates = project.templates.all()
    templates = serializers.serialize("json", templates)

    return HttpResponse(templates)


@csrf_exempt
def template(request:HttpRequest, project_name:str, template_name:str=None):

    if request.method == "POST":
        form = forms.TemplateForm(request.POST, request.FILES)
        if form.is_valid():
            p = models.Project.objects.get(name=project_name)
            t = models.Template.objects.create(
                project=p,
                name=form.cleaned_data["name"],
                file=form.cleaned_data["file"],
            )

            with t.file.open("r") as fp:
                body = to_json(fp.read())
            return JsonResponse({"Name": t.name, "Body": body})


    if request.method == "GET":
        if template_name is None:
            p = models.Project.objects.get(name=project_name)
            templates = p.templates.all()
            
            templates = [{"Name": t.name, "Body": None} for t in templates]
            return JsonResponse({"Templates": templates})


        print(template_name)
        t = models.Template.objects.filter(name=template_name)
        t = t[0]
        with t.file.open("r") as fp:
            body = to_json(fp.read())
        return JsonResponse({"Name": t.name, "Body": body})

    if request.method == "DELETE":
        body = json.loads(request.body)
        t = models.Template.objects.filter(name=body["Name"])
        t[0].delete()

        return JsonResponse({"Name": body["Name"]})
    

@csrf_exempt
def parameter(request:HttpRequest, project_name:str, template_name:str, parameter_name:str=None):
    target_template = load_template(project_name, template_name)

    if request.method == "POST":
        if parameter_name is None:
            # update template with new parameters
            parameters = json.loads(request.body)["Parameters"]
            print(json.dumps(parameters, indent=2))
            new_body = deepcopy(target_template.body)
            print(json.dumps(new_body, indent=2))
            new_body["Parameters"] = parameters
            print(json.dumps(new_body, indent=2))

            target_template = save_template(project_name, template_name, new_body)
            df = target_template.to_df(target_template.parameters, "Parameters")
            parameters = df.to_dict(orient="records")
            print(parameters)
            return JsonResponse({"Parameters": parameters})




    if request.method == "GET":
        if parameter_name is not None:
            if parameter_name == "__FIELDS__":
                fileds = cfn_spec.CfnParameter().get_definition()
                return JsonResponse({"Fields": fileds})

            if parameter_name == "__TYPES__":
                types = cfn_spec.CfnParameter().list_allowed_types()
                print(types)
                return JsonResponse({"Types": types})

            if parameter_name == "__URL__":
                url = cfn_spec.CfnParameter().get_document_url()
                return JsonResponse({"Url": url})


        if parameter_name is None:
            df = target_template.to_df(target_template.parameters, "Parameters")
            parameters = df.to_dict(orient="records")
            print(parameters)
            return JsonResponse({"Parameters": parameters})
        
        p = filter(lambda p: p.id == parameter_name, target_template.parameters)
        df = target_template.to_df(list(p), "Parameters")
        return JsonResponse({"Parameters": df.to_dict(orient="records")})

        
@csrf_exempt
def resource(request:HttpRequest, project_name:str, template_name:str, resource_name:str=None):
    target_template = load_template(project_name, template_name)

    if request.method == "GET":
        if resource_name is None:

            df = target_template.to_df(target_template.resources, "Resources_Property_Detail")
            df = target_template.summarise_resources(df)
            resources = df.to_dict(orient="records")
            print(json.dumps(resources, indent=2))
            return JsonResponse({"Resources": resources})


        if resource_name == "__TYPES__":
            resource_types = sorted(spec.spec["ResourceTypes"].keys())
            return JsonResponse({"Types": resource_types})


        if resource_name == "Tag":
            prop_spec = spec.get_property_spec(None, resource_name)
            print(json.dumps(prop_spec, indent=2))
            return JsonResponse({"Property": prop_spec})

        if "::" in resource_name:
            if "." in resource_name:
                prop_spec = spec.get_property_spec(None, resource_name)
                print(json.dumps(prop_spec, indent=2))
                return JsonResponse({"Property": prop_spec})

            resource_spec = spec.get_resource_spec(resource_name)
            return JsonResponse({"Resource": resource_spec})


        if "::" not in  resource_name:
            df = target_template.to_df(target_template.resources, "Resources_Property_Detail")
            df = df[df["ResourceId"] == resource_name]
            
            resource = sorted(df.to_dict(orient="records"), key=lambda r: r["Property"])
            return JsonResponse({"Resource": resource})

    if request.method == "POST":
        body = json.loads(request.body)
        print(body)
        if "Resources" not in body:
            new_def = cfn_def.CfnResource(
                resource_id=body["ResourceId"], resource_def={
                    "Type": body["ResourceType"]
                }
            )
            resources = new_def.to_df("Resource_Property_Detail").to_dict(orient="record")
        else:
            resources = body["Resources"]

        df = pd.DataFrame.from_dict(resources)

        print(df.info())
        df_by_id = df.groupby(["ResourceId"])
        unflatten = lambda d: cfn_def.CfnResource.from_json_def(d.to_dict(orient="record"))
        dicts = df_by_id.apply(unflatten).values
        print(dicts)
        new_body = deepcopy(target_template.body)
        new_resources:dict = deepcopy(new_body["Resources"])
        # new_resources.pop(prev_resource_id)
        for d in dicts:
            new_resources.update(d)
        new_body["Resources"] = new_resources

        target_template = save_template(project_name, template_name, body=new_body)

        df = target_template.to_df(target_template.resources, "Resources_Property_Detail")
        df = target_template.summarise_resources(df)
        resources = df.to_dict(orient="records")
        print(json.dumps(resources, indent=2))
        return JsonResponse({"Resources": resources})

    if request.method == "DELETE":
        new_body = deepcopy(target_template.body)
        new_resources:dict = deepcopy(new_body["Resources"])
        new_resources.pop(resource_name)
        new_body["Resources"] = new_resources
        target_template = save_template(project_name, template_name, body=new_body)

        df = target_template.to_df(target_template.resources, "Resources_Property_Detail")
        df = target_template.summarise_resources(df)
        resources = df.to_dict(orient="records")
        print(json.dumps(resources, indent=2))
        return JsonResponse({"Resources": resources})
