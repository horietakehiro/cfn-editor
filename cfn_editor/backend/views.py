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
            json.dump(body, fp, indent=2)
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
            if len(df):
                df = target_template.summarise_resources(df)
                resources = df.to_dict(orient="records")
            else:
                resources = {}
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
            res = {"Resource": resource}
            print(json.dumps(res, indent=2))
            return JsonResponse(res)

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



@csrf_exempt
def output(request:HttpRequest, project_name:str, template_name:str, output_name:str=None):
    target_template = load_template(project_name, template_name)

    if request.method == "POST":
        if output_name is None:
            # update template with new output
            outputs = json.loads(request.body)["Outputs"]
            print(json.dumps(outputs, indent=2))
            new_body = deepcopy(target_template.body)
            print(json.dumps(new_body, indent=2))
            new_body["Outputs"] = outputs
            print(json.dumps(new_body, indent=2))

            target_template = save_template(project_name, template_name, new_body)
            df = target_template.to_df(target_template.outputs, "Outputs")
            outputs = df.to_dict(orient="records")
            print(outputs)
            return JsonResponse({"Outputs": outputs})


    if request.method == "GET":
        if output_name is not None:
            if output_name == "__FIELDS__":
                fileds = cfn_spec.CfnOutput().get_definition()
                return JsonResponse({"Fields": fileds})
            if output_name == "__URL__":
                url = cfn_spec.CfnOutput().get_document_url()
                return JsonResponse({"Url": url})

        if output_name is None:
            df = target_template.to_df(target_template.outputs, "Outputs")
            outputs = df.to_dict(orient="records")
            print(outputs)
            return JsonResponse({"Outputs": outputs})
        
        o = filter(lambda o: o.id == output_name, target_template.outputs)
        df = target_template.to_df(list(o), "Outputs")
        return JsonResponse({"Outputs": df.to_dict(orient="records")})


@csrf_exempt
def attributes(request:HttpRequest, project_name:str, template_name:str, resource_name:str, attribute_name:str=None):
    target_template = load_template(project_name, template_name)

    if request.method == "GET":
        if attribute_name == "__ATTRIBUTE__":
            attributes = spec.get_attribute_spec(resource_name)
            return JsonResponse({"Attributes": {resource_name : list(attributes.keys())}})


@csrf_exempt
def description(request:HttpRequest, project_name:str, template_name:str):
    target_template = load_template(project_name, template_name)


    print("hoge")
    if request.method == "GET":
        desc = target_template.description
        return JsonResponse({"Description": desc if desc is not None else ""})
    
    if request.method == "POST":
        desc = json.loads(request.body)["Description"]
        new_body = deepcopy(target_template.body)
        new_body["Description"] = desc

        target_template = save_template(project_name, template_name, new_body)
        return JsonResponse({"Description": desc})


@csrf_exempt
def mapping(request:HttpRequest, project_name:str, template_name:str):
    target_template = load_template(project_name, template_name)

    if request.method == "GET":
        df = target_template.to_df(target_template.mappings, "Mappings")
        df = df.drop(["Filename"], axis=1)
        mappings = df.to_dict(orient="records")

        return JsonResponse({"Mappings": mappings})
    
    if request.method == "POST":
        mappings = json.loads(request.body)["Mappings"]
        df = pd.DataFrame(mappings)
        mappings = {}
        for gb_name in df.groupby(["Name"]):
            mappings[gb_name[0]] = {}
            for gb_item in gb_name[1].groupby(["Item"]):
                mappings[gb_name[0]][gb_item[0]] = {}
                for gb_key in gb_item[1].groupby(["Key"]):
                    mappings[gb_name[0]][gb_item[0]][gb_key[0]] = {}
                    for gb_value in gb_key[1].groupby(["Value"]):
                        mappings[gb_name[0]][gb_item[0]][gb_key[0]] = gb_value[0]
        print(mappings)
        new_body = deepcopy(target_template.body)
        new_body["Mappings"] = mappings

        target_template = save_template(project_name, template_name, new_body)
        df = target_template.to_df(target_template.mappings, "Mappings")
        df = df.drop(["Filename"], axis=1)

        mappings = df.to_dict(orient="records")

        return JsonResponse({"Mappings": mappings})
