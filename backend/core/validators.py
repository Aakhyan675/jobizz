from django.core.exceptions import ValidationError


def validate_resume_file(file):
    name = (file.name or "").lower()
    if not name.endswith((".pdf", ".doc", ".docx")):
        raise ValidationError("Resume must be a PDF or Word document.")
    if file.size > 5 * 1024 * 1024:
        raise ValidationError("Resume must be 5MB or smaller.")


def validate_image_file(file):
    name = (file.name or "").lower()
    if not name.endswith((".png", ".jpg", ".jpeg", ".webp")):
        raise ValidationError("Image must be PNG, JPG, or WebP.")
    if file.size > 2 * 1024 * 1024:
        raise ValidationError("Image must be 2MB or smaller.")
