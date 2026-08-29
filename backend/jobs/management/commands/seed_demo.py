from django.core.management.base import BaseCommand
from django.utils.text import slugify

from accounts.models import User
from companies.models import Company
from jobs.models import Job, JobCategory


class Command(BaseCommand):
    help = "Create demo users, companies, and 12+ sample jobs (idempotent, portfolio-ready)."

    def handle(self, *args, **options):
        # Ensure categories exist
        from jobs.management.commands.seed_categories import CATEGORIES  # type: ignore

        for name, description in CATEGORIES:
            JobCategory.objects.get_or_create(
                slug=slugify(name),
                defaults={"name": name, "description": description},
            )

        cats = {c.slug: c for c in JobCategory.objects.all()}

        def ensure_user(email, first, last, role, phone):
            user, _ = User.objects.get_or_create(
                email=email,
                defaults={"first_name": first, "last_name": last, "role": role, "phone": phone},
            )
            user.first_name = first
            user.last_name = last
            user.role = role
            user.phone = phone
            user.is_active = True
            user.set_password("Jobizz123!")
            user.save()
            return user

        seeker = ensure_user("seeker@jobizz.dev", "Sita", "Sharma", User.Role.JOB_SEEKER, "9800000001")
        # Ensure seeker profile has some data
        sp = seeker.seeker_profile
        sp.location = "Kathmandu"
        sp.bio = "Frontend developer passionate about React and design systems."
        sp.skills = ["React", "TypeScript", "Tailwind", "Python"]
        sp.education = [{"school": "Tribhuvan University", "degree": "BSc", "field": "CSIT", "year": "2023"}]
        sp.experience = [
            {"company": "Local Startup", "title": "Junior Developer", "start": "2023-01", "end": "2024-06", "description": "Built web apps with React."}
        ]
        sp.save()

        employer = ensure_user("employer@jobizz.dev", "Hari", "Thapa", User.Role.EMPLOYER, "9800000002")
        employer2 = ensure_user("employer2@jobizz.dev", "Ramesh", "Khadka", User.Role.EMPLOYER, "9800000003")

        # Admin
        admin, created = User.objects.get_or_create(
            email="admin@jobizz.dev",
            defaults={"first_name": "Admin", "last_name": "Jobizz", "role": User.Role.ADMIN, "phone": "9800000009"},
        )
        admin.role = User.Role.ADMIN
        admin.is_staff = True
        admin.is_superuser = True
        admin.is_active = True
        admin.set_password("Jobizz123!")
        admin.save()

        # Companies
        companies_data = [
            {
                "name": "Himalayan Tech",
                "owner": employer,
                "slug": "himalayan-tech",
                "website": "https://example.com",
                "industry": "Information Technology",
                "size": Company.Size.SIZE_11_50,
                "location": "Kathmandu",
                "description": "Building software for Nepal and beyond. Cloud, web, and mobile products.",
            },
            {
                "name": "Kathmandu Finance Ltd",
                "owner": employer,
                "slug": "kathmandu-finance-ltd",
                "website": "https://example.com",
                "industry": "Banking & Finance",
                "size": Company.Size.SIZE_51_200,
                "location": "Kathmandu",
                "description": "Leading finance company helping Nepali businesses grow.",
            },
            {
                "name": "Everest Hospitality Group",
                "owner": employer2,
                "slug": "everest-hospitality-group",
                "website": "https://example.com",
                "industry": "Hospitality & Tourism",
                "size": Company.Size.SIZE_201_500,
                "location": "Pokhara",
                "description": "Hotels and resorts across Nepal serving international guests.",
            },
            {
                "name": "Patan Design Studio",
                "owner": employer2,
                "slug": "patan-design-studio",
                "website": "https://example.com",
                "industry": "Design",
                "size": Company.Size.SIZE_1_10,
                "location": "Lalitpur",
                "description": "Boutique design studio crafting brands and product experiences.",
            },
        ]
        companies = {}
        for data in companies_data:
            c, _ = Company.objects.get_or_create(
                slug=data["slug"],
                defaults={k: v for k, v in data.items() if k != "slug"},
            )
            # ensure owner assignment is correct
            if c.owner_id != data["owner"].id:
                c.owner = data["owner"]
                c.save(update_fields=["owner"])
            companies[data["slug"]] = c

        # Hook primary employer profile to Himalayan Tech
        profile = employer.employer_profile
        profile.company = companies["himalayan-tech"]
        profile.job_title = "People Lead"
        profile.save()
        profile2 = employer2.employer_profile
        profile2.company = companies["everest-hospitality-group"]
        profile2.job_title = "Hiring Manager"
        profile2.save()

        # Helper to pick category safely
        def cat(slug):
            return cats.get(slug) or list(cats.values())[0]

        jobs = [
            {
                "title": "Full Stack Engineer",
                "company": companies["himalayan-tech"],
                "category": cat("information-technology"),
                "created_by": employer,
                "location": "Kathmandu",
                "job_type": Job.JobType.FULL_TIME,
                "experience_level": Job.ExperienceLevel.MID,
                "description": "Work across our Django REST API and React + TypeScript frontend. Own features end-to-end, write tests, and ship incrementally.",
                "requirements": "3+ years with Python/Django or Node, 2+ years with React/TypeScript, Git, REST, and basic SQL.",
                "benefits": "Flexible hours, health coverage, learning stipend, festival bonus.",
                "salary_min": 90000,
                "salary_max": 140000,
            },
            {
                "title": "Frontend Developer (React)",
                "company": companies["himalayan-tech"],
                "category": cat("information-technology"),
                "created_by": employer,
                "location": "Kathmandu",
                "job_type": Job.JobType.FULL_TIME,
                "experience_level": Job.ExperienceLevel.MID,
                "description": "Build fast, accessible UIs with React, Vite, and Tailwind. Collaborate closely with designers.",
                "requirements": "Strong React, TypeScript, Tailwind, and testing fundamentals.",
                "benefits": "Remote hybrid, modern tooling, conference budget.",
                "salary_min": 70000,
                "salary_max": 120000,
            },
            {
                "title": "Backend Engineer (Python/Django)",
                "company": companies["himalayan-tech"],
                "category": cat("information-technology"),
                "created_by": employer,
                "location": "Lalitpur",
                "job_type": Job.JobType.FULL_TIME,
                "experience_level": Job.ExperienceLevel.SENIOR,
                "description": "Design scalable Django services, PostgreSQL schemas, and JWT auth flows for a job board.",
                "requirements": "5+ years Python, DRF, PostgreSQL, Docker, and code review discipline.",
                "benefits": "Ownership of core platform, annual bonus.",
                "salary_min": 120000,
                "salary_max": 200000,
            },
            {
                "title": "Product Design Intern",
                "company": companies["patan-design-studio"],
                "category": cat("design"),
                "created_by": employer2,
                "location": "Lalitpur",
                "job_type": Job.JobType.INTERNSHIP,
                "experience_level": Job.ExperienceLevel.INTERN,
                "description": "Support UX research and visual design for Jobizz. Create wireframes, prototypes, and design tokens.",
                "requirements": "Portfolio of web or mobile work, Figma proficiency.",
                "benefits": "Mentorship, paid internship, chance of full-time offer.",
                "salary_min": 15000,
                "salary_max": 25000,
            },
            {
                "title": "UX Designer",
                "company": companies["patan-design-studio"],
                "category": cat("design"),
                "created_by": employer2,
                "location": "Kathmandu",
                "job_type": Job.JobType.FULL_TIME,
                "experience_level": Job.ExperienceLevel.MID,
                "description": "Own the design system for a modern job platform. Research, prototype, and test with real users.",
                "requirements": "3+ years product design, user research, and design systems.",
                "benefits": "Creative freedom, portfolio-worthy projects.",
                "salary_min": 60000,
                "salary_max": 100000,
            },
            {
                "title": "Remote Customer Success Associate",
                "company": companies["himalayan-tech"],
                "category": cat("customer-support"),
                "created_by": employer,
                "location": "Remote, Nepal",
                "job_type": Job.JobType.REMOTE,
                "experience_level": Job.ExperienceLevel.ENTRY,
                "description": "Help employers and seekers get the most out of Jobizz. Onboard users and reduce time-to-hire.",
                "requirements": "Excellent written English and Nepali, empathy, prior support experience.",
                "benefits": "Work from anywhere in Nepal, flexible schedule.",
                "salary_min": 40000,
                "salary_max": 60000,
            },
            {
                "title": "Sales Executive",
                "company": companies["kathmandu-finance-ltd"],
                "category": cat("marketing-sales"),
                "created_by": employer,
                "location": "Kathmandu",
                "job_type": Job.JobType.FULL_TIME,
                "experience_level": Job.ExperienceLevel.ENTRY,
                "description": "Drive B2B sales for financial products. Build relationships with SMEs across the valley.",
                "requirements": "1-2 years sales, strong communication, target-driven.",
                "benefits": "Commission + base, insurance, growth path to lead.",
                "salary_min": 35000,
                "salary_max": 80000,
            },
            {
                "title": "HR Officer",
                "company": companies["kathmandu-finance-ltd"],
                "category": cat("human-resources"),
                "created_by": employer,
                "location": "Kathmandu",
                "job_type": Job.JobType.FULL_TIME,
                "experience_level": Job.ExperienceLevel.MID,
                "description": "Manage recruiting, onboarding, and employee engagement for 100+ staff.",
                "requirements": "3+ years HR, labor law knowledge, and HRIS tooling.",
                "benefits": "Stable finance sector career, training budget.",
                "salary_min": 55000,
                "salary_max": 95000,
            },
            {
                "title": "Civil Engineer – Site",
                "company": companies["kathmandu-finance-ltd"],
                "category": cat("engineering"),
                "created_by": employer,
                "location": "Bhaktapur",
                "job_type": Job.JobType.CONTRACT,
                "experience_level": Job.ExperienceLevel.SENIOR,
                "description": "Supervise construction for commercial projects in the valley. Ensure safety and quality.",
                "requirements": "B.E. Civil, 5+ years site experience, NEC license preferred.",
                "benefits": "Project allowance, site accommodation.",
                "salary_min": 80000,
                "salary_max": 150000,
            },
            {
                "title": "Registered Nurse",
                "company": companies["everest-hospitality-group"],
                "category": cat("healthcare"),
                "created_by": employer2,
                "location": "Pokhara",
                "job_type": Job.JobType.FULL_TIME,
                "experience_level": Job.ExperienceLevel.MID,
                "description": "Provide clinical care for a 4-star resort's medical center and coordinate wellness programs.",
                "requirements": "NNC registered, 2+ years hospital or hospitality health experience.",
                "benefits": "Accommodation, health coverage, mountain location.",
                "salary_min": 45000,
                "salary_max": 75000,
            },
            {
                "title": "Secondary School Teacher (English)",
                "company": companies["everest-hospitality-group"],
                "category": cat("education"),
                "created_by": employer2,
                "location": "Pokhara",
                "job_type": Job.JobType.PART_TIME,
                "experience_level": Job.ExperienceLevel.MID,
                "description": "Teach English to grades 9–10 at a partner school. Prepare students for SEE.",
                "requirements": "B.A./M.A. English, 2+ years teaching, engaging pedagogy.",
                "benefits": "Part-time flexibility, training workshops.",
                "salary_min": 25000,
                "salary_max": 40000,
            },
            {
                "title": "Front Desk Officer",
                "company": companies["everest-hospitality-group"],
                "category": cat("hospitality-tourism"),
                "created_by": employer2,
                "location": "Pokhara",
                "job_type": Job.JobType.FULL_TIME,
                "experience_level": Job.ExperienceLevel.ENTRY,
                "description": "Be the first impression at our lake-side resort. Manage check-ins, concierge, and guest happiness.",
                "requirements": "Hospitality diploma preferred, English + Nepali, PMS knowledge a plus.",
                "benefits": "Meals on duty, tips, staff lodging.",
                "salary_min": 28000,
                "salary_max": 45000,
            },
        ]

        created = 0
        for data in jobs:
            _, was_created = Job.objects.get_or_create(
                title=data["title"],
                company=data["company"],
                defaults={**data, "is_published": True},
            )
            if was_created:
                created += 1

        self.stdout.write(
            self.style.SUCCESS(
                "Demo ready:\n"
                " seeker@jobizz.dev / Jobizz123! (job_seeker)\n"
                " employer@jobizz.dev / Jobizz123! (employer, owns Himalayan Tech)\n"
                " employer2@jobizz.dev / Jobizz123! (employer, owns Everest Hospitality)\n"
                " admin@jobizz.dev / Jobizz123! (admin + Django admin)\n"
                f"Jobs created this run: {created} | Total jobs: {Job.objects.count()}"
            )
        )
