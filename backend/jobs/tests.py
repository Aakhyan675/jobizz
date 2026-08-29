from rest_framework.test import APITestCase

from accounts.models import User
from companies.models import Company
from jobs.models import Job, JobCategory


class JobFlowTests(APITestCase):
    def setUp(self):
        self.category = JobCategory.objects.create(name="IT", slug="it")
        self.employer = User.objects.create_user(
            email="hr@acme.com", password="StrongPass123", role=User.Role.EMPLOYER, first_name="Hari"
        )
        self.seeker = User.objects.create_user(
            email="seeker@mail.com", password="StrongPass123", role=User.Role.JOB_SEEKER, first_name="Sita"
        )
        self.company = Company.objects.create(name="Acme Pvt Ltd", owner=self.employer, location="Kathmandu")
        self.employer.employer_profile.company = self.company
        self.employer.employer_profile.save()

    def auth(self, user):
        res = self.client.post("/api/auth/login/", {"email": user.email, "password": "StrongPass123"}, format="json")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {res.data['access']}")

    def test_employer_posts_job_and_seeker_applies(self):
        self.auth(self.employer)
        created = self.client.post(
            "/api/jobs/",
            {
                "title": "Backend Engineer",
                "company": self.company.id,
                "category": self.category.id,
                "location": "Kathmandu",
                "job_type": "full_time",
                "experience_level": "mid",
                "description": "Build APIs.",
                "requirements": "Django",
                "benefits": "PF",
                "salary_min": 80000,
                "salary_max": 120000,
            },
            format="json",
        )
        self.assertEqual(created.status_code, 201, created.data)
        job_id = created.data["id"]

        self.auth(self.seeker)
        listing = self.client.get("/api/jobs/")
        self.assertEqual(listing.status_code, 200)
        self.assertGreaterEqual(listing.data["count"], 1)

        apply_res = self.client.post(
            "/api/applications/",
            {"job": job_id, "cover_letter": "I would like to join."},
            format="json",
        )
        self.assertEqual(apply_res.status_code, 201, apply_res.data)

        save_res = self.client.post("/api/saved-jobs/", {"job": job_id}, format="json")
        self.assertEqual(save_res.status_code, 201)

        self.auth(self.employer)
        apps = self.client.get(f"/api/applications/?job={job_id}")
        self.assertEqual(apps.data["count"], 1)
        app_id = apps.data["results"][0]["id"]
        patch = self.client.patch(f"/api/applications/{app_id}/", {"status": "shortlisted"}, format="json")
        self.assertEqual(patch.status_code, 200)
        self.assertEqual(patch.data["status"], "shortlisted")
