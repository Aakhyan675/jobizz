from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsJobSeeker(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.role == user.Role.JOB_SEEKER)


class IsEmployer(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.role == user.Role.EMPLOYER)


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and (user.is_staff or user.role == user.Role.ADMIN))


class IsOwnerOrReadOnly(BasePermission):
    """Object-level: write only if `owner` / `created_by` / `user` matches request.user."""

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        owner = getattr(obj, "owner", None) or getattr(obj, "created_by", None) or getattr(obj, "user", None)
        return owner == request.user
