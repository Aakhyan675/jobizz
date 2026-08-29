from rest_framework.test import APITestCase

from accounts.models import User


class AuthTests(APITestCase):
    def test_register_seeker_and_login(self):
        res = self.client.post(
            "/api/auth/register/",
            {
                "email": "seeker@example.com",
                "password": "StrongPass123",
                "password_confirm": "StrongPass123",
                "first_name": "Asha",
                "last_name": "Karki",
                "role": "job_seeker",
            },
            format="json",
        )
        self.assertEqual(res.status_code, 201)
        self.assertIn("access", res.data)
        self.assertEqual(res.data["user"]["role"], "job_seeker")

        login = self.client.post(
            "/api/auth/login/",
            {"email": "seeker@example.com", "password": "StrongPass123"},
            format="json",
        )
        self.assertEqual(login.status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
        me = self.client.get("/api/auth/me/")
        self.assertEqual(me.status_code, 200)
        self.assertEqual(me.data["email"], "seeker@example.com")

    def test_register_rejects_mismatched_passwords(self):
        res = self.client.post(
            "/api/auth/register/",
            {
                "email": "x@example.com",
                "password": "StrongPass123",
                "password_confirm": "other",
                "role": "job_seeker",
            },
            format="json",
        )
        self.assertEqual(res.status_code, 400)
