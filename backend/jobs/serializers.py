from rest_framework import serializers

from accounts.serializers import UserSerializer
from companies.serializers import CompanySerializer

from .models import Job, JobApplication, JobCategory, SavedJob


class JobCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = JobCategory
        fields = ("id", "name", "slug", "description")


class JobSerializer(serializers.ModelSerializer):
    company_detail = CompanySerializer(source="company", read_only=True)
    category_detail = JobCategorySerializer(source="category", read_only=True)
    applications_count = serializers.IntegerField(read_only=True)
    is_saved = serializers.SerializerMethodField()
    has_applied = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = (
            "id",
            "title",
            "company",
            "company_detail",
            "category",
            "category_detail",
            "location",
            "job_type",
            "experience_level",
            "description",
            "requirements",
            "benefits",
            "salary_min",
            "salary_max",
            "salary_currency",
            "is_published",
            "views_count",
            "applications_count",
            "is_saved",
            "has_applied",
            "created_by",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "views_count",
            "applications_count",
            "is_saved",
            "has_applied",
            "created_by",
            "created_at",
            "updated_at",
        )

    def get_is_saved(self, obj):
        user = self.context["request"].user
        if not user.is_authenticated:
            return False
        saved_ids = self.context.get("saved_job_ids")
        if saved_ids is not None:
            return obj.id in saved_ids
        return obj.saves.filter(user=user).exists()

    def get_has_applied(self, obj):
        user = self.context["request"].user
        if not user.is_authenticated:
            return False
        applied_ids = self.context.get("applied_job_ids")
        if applied_ids is not None:
            return obj.id in applied_ids
        return obj.applications.filter(seeker=user).exists()

    def validate(self, attrs):
        salary_min = attrs.get("salary_min", getattr(self.instance, "salary_min", None))
        salary_max = attrs.get("salary_max", getattr(self.instance, "salary_max", None))
        if salary_min is not None and salary_max is not None and salary_min > salary_max:
            raise serializers.ValidationError("salary_min cannot be greater than salary_max.")
        return attrs

    def create(self, validated_data):
        request = self.context["request"]
        profile = getattr(request.user, "employer_profile", None)
        company = validated_data.get("company")
        if not company:
            if not profile or not profile.company_id:
                raise serializers.ValidationError(
                    {"company": "Create a company profile before posting a job."}
                )
            validated_data["company"] = profile.company
        elif company.owner_id != request.user.id:
            raise serializers.ValidationError({"company": "You can only post jobs for your own company."})
        return Job.objects.create(created_by=request.user, **validated_data)


class JobListSerializer(JobSerializer):
    class Meta(JobSerializer.Meta):
        fields = (
            "id",
            "title",
            "company",
            "company_detail",
            "category",
            "category_detail",
            "location",
            "job_type",
            "experience_level",
            "salary_min",
            "salary_max",
            "salary_currency",
            "is_published",
            "views_count",
            "applications_count",
            "is_saved",
            "has_applied",
            "created_at",
        )


class JobApplicationSerializer(serializers.ModelSerializer):
    seeker_detail = UserSerializer(source="seeker", read_only=True)
    job_title = serializers.CharField(source="job.title", read_only=True)
    company_name = serializers.CharField(source="job.company.name", read_only=True)
    resume = serializers.FileField(read_only=True)

    class Meta:
        model = JobApplication
        fields = (
            "id",
            "job",
            "job_title",
            "company_name",
            "seeker",
            "seeker_detail",
            "cover_letter",
            "resume",
            "status",
            "employer_note",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "seeker", "resume", "created_at", "updated_at", "job_title", "company_name")

    def validate(self, attrs):
        request = self.context["request"]
        if self.instance is None:
            job = attrs.get("job")
            if not job or not job.is_published:
                raise serializers.ValidationError({"job": "This job is not open for applications."})
            if JobApplication.objects.filter(job=job, seeker=request.user).exists():
                raise serializers.ValidationError("You have already applied to this job.")
            # Require resume in seeker profile before applying
            try:
                profile = request.user.seeker_profile
                if not profile.resume or not profile.resume.name:
                    raise serializers.ValidationError({"resume": "Please upload your resume in your profile before applying."})
            except Exception:
                raise serializers.ValidationError({"resume": "Please upload your resume in your profile before applying."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("status", None)
        validated_data.pop("employer_note", None)
        validated_data.pop("resume", None)
        seeker = self.request_user()
        # Create application first without resume, then attach snapshot
        app = JobApplication.objects.create(seeker=seeker, **validated_data)
        # Snapshot resume from SeekerProfile
        try:
            profile = seeker.seeker_profile
            if profile.resume and profile.resume.name:
                # Copy file to submitted_resumes snapshot (preserve at application time)
                import os
                from django.core.files.base import ContentFile

                # Read existing resume file
                profile.resume.open()
                content = profile.resume.read()
                profile.resume.close()
                filename = os.path.basename(profile.resume.name)
                # Save as submitted_resumes/<app_id>_<filename>
                app.resume.save(f"{app.id}_{filename}", ContentFile(content), save=True)
        except Exception:
            # If copy fails, fall back to reference (still has original path if save failed)
            pass
        return app

    def request_user(self):
        return self.context["request"].user

    def update(self, instance, validated_data):
        request = self.context["request"]
        if request.user.role == request.user.Role.JOB_SEEKER:
            raise serializers.ValidationError("Job seekers cannot change application status.")
        # Employers may only change status and note
        allowed = {k: validated_data[k] for k in ("status", "employer_note") if k in validated_data}
        return super().update(instance, allowed)


class SavedJobSerializer(serializers.ModelSerializer):
    job_detail = JobListSerializer(source="job", read_only=True)

    class Meta:
        model = SavedJob
        fields = ("id", "job", "job_detail", "created_at")
        read_only_fields = ("id", "created_at")

    def create(self, validated_data):
        user = self.context["request"].user
        saved, _ = SavedJob.objects.get_or_create(user=user, job=validated_data["job"])
        return saved
