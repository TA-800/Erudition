from django.contrib import admin
from .models import User, Course, Module, Assignment, University, Discussion, Comment

# Register your models here.
admin.site.register(User)
admin.site.register(University)
admin.site.register(Course)
admin.site.register(Module)
admin.site.register(Assignment)
admin.site.register(Discussion)
admin.site.register(Comment)