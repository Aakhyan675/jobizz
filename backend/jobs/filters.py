import django_filters

from .models import Job, JobApplication


class JobFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name="category__slug")
    category_id = django_filters.NumberFilter(field_name="category_id")
    location = django_filters.CharFilter(field_name="location", lookup_expr="icontains")
    job_type = django_filters.CharFilter(field_name="job_type")
    experience_level = django_filters.CharFilter(field_name="experience_level")
    is_published = django_filters.BooleanFilter(field_name="is_published")
    company = django_filters.NumberFilter(field_name="company_id")
    mine = django_filters.BooleanFilter(method="filter_mine")

    class Meta:
        model = Job
        fields = ("category", "category_id", "location", "job_type", "experience_level", "is_published", "company")

    def filter_mine(self, queryset, name, value):
        user = getattr(self.request, "user", None)
        if value and user and user.is_authenticated:
            return queryset.filter(created_by=user)
        return queryset


class ApplicationFilter(django_filters.FilterSet):
    status = django_filters.CharFilter(field_name="status")
    job = django_filters.NumberFilter(field_name="job_id")

    class Meta:
        model = JobApplication
        fields = ("status", "job")
