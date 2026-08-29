from django.contrib.auth.models import AbstractUser
from django.db import models

from core.validators import validate_resume_file

from .managers import UserManager


class User(AbstractUser):
    class Role(models.TextChoices):
        JOB_SEEKER = "job_seeker", "Job seeker"
        EMPLOYER = "employer", "Employer"
        ADMIN = "admin", "Admin"

    username = None
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.JOB_SEEKER)
    phone = models.CharField(max_length=30, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email

    @property
    def display_name(self):
        full = f"{self.first_name} {self.last_name}".strip()
        return full or self.email.split("@")[0]


class SeekerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="seeker_profile")
    location = models.CharField(max_length=120, blank=True)
    headline = models.CharField(max_length=120, blank=True, help_text="e.g. Junior Full-Stack Developer")
    bio = models.TextField(blank=True, help_text="Short professional summary")
    linkedin_url = models.URLField(blank=True, help_text="Optional LinkedIn profile URL")
    portfolio_url = models.URLField(blank=True, help_text="Optional portfolio/GitHub URL")
    skills = models.JSONField(default=list, blank=True, help_text="List of skill strings (optional, stored as tags)")
    # Kept for backwards compatibility but hidden from normal UI (Option A: resume is source of truth)
    education = models.JSONField(
        default=list,
        blank=True,
        help_text='[{"school": "", "degree": "", "field": "", "year": ""}]',
    )
    experience = models.JSONField(
        default=list,
        blank=True,
        help_text='[{"company": "", "title": "", "start": "", "end": "", "description": ""}]',
    )
    resume = models.FileField(upload_to="resumes/", blank=True, null=True, validators=[validate_resume_file])
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"SeekerProfile({self.user.email})"


class EmployerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="employer_profile")
    company = models.ForeignKey(
        "companies.Company",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="employers",
    )
    job_title = models.CharField(max_length=120, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"EmployerProfile({self.user.email})"
