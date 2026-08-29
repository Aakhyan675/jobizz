from django.db import models

from accounts.models import User
from core.validators import validate_resume_file


class JobCategory(models.Model):
    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "job categories"

    def __str__(self):
        return self.name


class Job(models.Model):
    class JobType(models.TextChoices):
        FULL_TIME = "full_time", "Full-time"
        PART_TIME = "part_time", "Part-time"
        INTERNSHIP = "internship", "Internship"
        REMOTE = "remote", "Remote"
        CONTRACT = "contract", "Contract"

    class ExperienceLevel(models.TextChoices):
        INTERN = "intern", "Intern"
        ENTRY = "entry", "Entry"
        MID = "mid", "Mid"
        SENIOR = "senior", "Senior"

    title = models.CharField(max_length=200)
    company = models.ForeignKey("companies.Company", on_delete=models.CASCADE, related_name="jobs")
    category = models.ForeignKey(JobCategory, on_delete=models.SET_NULL, null=True, related_name="jobs")
    location = models.CharField(max_length=120)
    job_type = models.CharField(max_length=20, choices=JobType.choices, default=JobType.FULL_TIME)
    experience_level = models.CharField(
        max_length=20, choices=ExperienceLevel.choices, default=ExperienceLevel.ENTRY
    )
    description = models.TextField()
    requirements = models.TextField(blank=True)
    benefits = models.TextField(blank=True)
    salary_min = models.PositiveIntegerField(null=True, blank=True)
    salary_max = models.PositiveIntegerField(null=True, blank=True)
    salary_currency = models.CharField(max_length=8, default="NPR")
    is_published = models.BooleanField(default=True)
    views_count = models.PositiveIntegerField(default=0)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posted_jobs")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["is_published", "-created_at"]),
            models.Index(fields=["job_type"]),
            models.Index(fields=["location"]),
        ]

    def __str__(self):
        return f"{self.title} @ {self.company.name}"


class JobApplication(models.Model):
    class Status(models.TextChoices):
        APPLIED = "applied", "Applied"
        SHORTLISTED = "shortlisted", "Shortlisted"
        REJECTED = "rejected", "Rejected"
        HIRED = "hired", "Hired"

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="applications")
    seeker = models.ForeignKey(User, on_delete=models.CASCADE, related_name="applications")
    cover_letter = models.TextField(blank=True)
    # Snapshot of seeker's resume at application time (copied from SeekerProfile.resume)
    resume = models.FileField(upload_to="submitted_resumes/", blank=True, null=True, validators=[validate_resume_file])
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.APPLIED)
    employer_note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("job", "seeker")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.seeker.email} → {self.job.title} ({self.status})"


class SavedJob(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="saved_jobs")
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="saves")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "job")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email} saved {self.job.title}"
