from django.urls import path
from . import views


from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('login/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('register/', views.register, name='register'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('', views.apiOverview, name='api-overview'),

    path('userProfile/<int:id>', views.userProfile, name='user-profile'),

    path('university/', views.university, name='university'),
    path('alluniversities/', views.allUniversities, name='all-universities'),

    path('courses/<int:course_id>', views.courseList, name='course-list'),
    path('modules/<int:course_id>', views.moduleList, name='module-list'),
    path('assignments/<int:course_id>', views.assignmentList, name='assignment-list'),
    path('contact/<int:course_id>', views.contactList, name='contact-list'),

    path('discussions/<int:id>', views.discussions, name='discussions'),
    path('comments/<int:id>', views.comments, name='comments'),
]