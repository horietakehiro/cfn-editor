from django import forms
from . import models

class TemplateForm(forms.Form):
    file = forms.FileField()
    name = forms.CharField(max_length=256)