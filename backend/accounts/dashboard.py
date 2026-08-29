from django.db.models import Count
from django.utils import timezone
from datetime import timedelta
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import IsAdminRole

from jobs.models import Job, JobApplication, SavedJob


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == user.Role.JOB_SEEKER:
            apps = JobApplication.objects.filter(seeker=user)
            return Response(
                {
                    "role": user.role,
                    "applications_count": apps.count(),
                    "saved_jobs_count": SavedJob.objects.filter(user=user).count(),
                    "by_status": dict(apps.values("status").annotate(c=Count("id")).values_list("status", "c")),
                }
            )
        if user.role == user.Role.EMPLOYER:
            jobs = Job.objects.filter(created_by=user)
            apps = JobApplication.objects.filter(job__created_by=user)
            return Response(
                {
                    "role": user.role,
                    "jobs_count": jobs.count(),
                    "published_jobs_count": jobs.filter(is_published=True).count(),
                    "total_views": sum(jobs.values_list("views_count", flat=True)),
                    "applications_count": apps.count(),
                    "by_status": dict(apps.values("status").annotate(c=Count("id")).values_list("status", "c")),
                }
            )
        if user.role == user.Role.ADMIN or user.is_staff or user.is_superuser:
            # Fallback for admin hitting /dashboard/, return system stats as well
            from accounts.models import User

            total_users = User.objects.count()
            seekers = User.objects.filter(role=User.Role.JOB_SEEKER).count()
            employers = User.objects.filter(role=User.Role.EMPLOYER).count()
            admins = User.objects.filter(role=User.Role.ADMIN).count()
            total_jobs = Job.objects.count()
            active_jobs = Job.objects.filter(is_published=True).count()
            expired_jobs = total_jobs - active_jobs
            total_apps = JobApplication.objects.count()
            return Response(
                {
                    "role": user.role,
                    "total_users": total_users,
                    "seekers": seekers,
                    "employers": employers,
                    "admins": admins,
                    "total_jobs": total_jobs,
                    "active_jobs": active_jobs,
                    "expired_jobs": expired_jobs,
                    "total_applications": total_apps,
                }
            )
        return Response({"role": user.role})


class AdminStatsView(APIView):
    """Admin-only system stats for /admin/dashboard frontend page."""

    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        from accounts.models import User

        total_users = User.objects.count()
        seekers = User.objects.filter(role=User.Role.JOB_SEEKER).count()
        employers = User.objects.filter(role=User.Role.EMPLOYER).count()
        admins = User.objects.filter(role=User.Role.ADMIN).count() + User.objects.filter(is_staff=True).exclude(role=User.Role.ADMIN).count()
        # Jobs
        total_jobs = Job.objects.count()
        active_jobs = Job.objects.filter(is_published=True).count()
        expired_jobs = total_jobs - active_jobs
        total_applications = JobApplication.objects.count()
        # Recent lists
        recent_jobs = list(
            Job.objects.select_related("company", "created_by")
            .order_by("-created_at")[:5]
            .values("id", "title", "company__name", "is_published", "created_at")
        )
        recent_users = list(
            User.objects.order_by("-date_joined")[:5].values("id", "email", "role", "first_name", "last_name", "date_joined")
        )
        # By status for applications
        by_status = dict(JobApplication.objects.values("status").annotate(c=Count("id")).values_list("status", "c"))
        # Jobs per category (simple)
        jobs_by_category = dict(Job.objects.values("category__name").annotate(c=Count("id")).values_list("category__name", "c"))

        return Response(
            {
                "total_users": total_users,
                "seekers": seekers,
                "employers": employers,
                "admins": admins,
                "total_jobs": total_jobs,
                "active_jobs": active_jobs,
                "expired_jobs": expired_jobs,
                "total_applications": total_applications,
                "recent_jobs": recent_jobs,
                "recent_users": recent_users,
                "by_status": by_status,
                "jobs_by_category": jobs_by_category,
            }
        )
