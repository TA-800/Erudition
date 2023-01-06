from rest_framework import serializers
from .models import *
from datetime import datetime

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'

class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = '__all__'

class AssignmentSerializer(serializers.ModelSerializer):
    # Add a field to the serializer that is not in the model
    # This field calculates the number of days left until the assignment is due
    days_left = serializers.SerializerMethodField()
    # time_left = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = '__all__'
    
    def get_days_left(self, obj):
        today = datetime.now(timezone.utc)
        due_date = obj.assignment_due_date
        days_left = (due_date - today).days
        return days_left

    

        
