from django.core.management.base import BaseCommand
from django.utils.text import slugify

from jobs.models import JobCategory

CATEGORIES = [
    ("Information Technology", "Software, data, and IT roles"),
    ("Banking & Finance", "Banks, insurance, and fintech"),
    ("Marketing & Sales", "Marketing, sales, and business development"),
    ("Human Resources", "People operations and recruiting"),
    ("Engineering", "Civil, electrical, mechanical and related"),
    ("Healthcare", "Clinical and healthcare administration"),
    ("Education", "Teaching, training, and academic roles"),
    ("Hospitality & Tourism", "Hotels, travel, and F&B"),
    ("Customer Support", "Service desks and customer success"),
    ("Design", "Product, graphic, and UX design"),
]


class Command(BaseCommand):
    help = "Seed default job categories."

    def handle(self, *args, **options):
        created = 0
        for name, description in CATEGORIES:
            _, was_created = JobCategory.objects.get_or_create(
                slug=slugify(name),
                defaults={"name": name, "description": description},
            )
            if was_created:
                created += 1
        self.stdout.write(self.style.SUCCESS(f"Seeded categories. {created} new, {len(CATEGORIES)} total."))
