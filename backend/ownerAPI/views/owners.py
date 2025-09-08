import json
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ..models import OwnerProfile
from ..serializers import OwnerProfileSerializer
from ..utils.helper import get_owner_profile

class RegisterOwnerView(generics.CreateAPIView):
    serializer_class = OwnerProfileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = ['multipart/form-data', 'application/json']

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        user = request.user

        if not user.is_customer or user.is_owner:
            return Response(
                {"detail": "You are not allowed to register as an owner."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if OwnerProfile.objects.filter(user=user).exists():
            return Response(
                {"detail": "Owner profile already exists for this user."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if 'data' in request.data:
            try:
                data = json.loads(request.data['data'])
            except json.JSONDecodeError:
                return Response(
                    {"detail": "Invalid JSON in 'data' field."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

        return super().create(request, *args, **kwargs)
