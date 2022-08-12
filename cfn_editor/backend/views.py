import json
from django.http import HttpResponse, HttpRequest, JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from django.core import serializers

from cfn_flip import to_json
from cfn_docgen import cfn_spec, cfn_def
spec = cfn_spec.CfnSpecification()



from . import models
from . import forms


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
    
