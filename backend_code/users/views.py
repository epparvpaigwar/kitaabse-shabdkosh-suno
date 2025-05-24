from django.shortcuts import render

# Create your views here.
import random
from django.core.mail import send_mail
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import User
from .serializers import UserSignupSerializer, UserLoginSerializer, VerifyOtpSerializer
from rest_framework_simplejwt.tokens import RefreshToken

def generate_otp():
    return str(random.randint(100000, 999999))


class SignupView(APIView):
    def post(self, request):
        serializer = UserSignupSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user, created = User.objects.get_or_create(email=email)
            if not created:
                return Response({"detail": "User already exists. Please login."}, status=status.HTTP_400_BAD_REQUEST)

            user.name = serializer.validated_data['name']
            user.is_verified = False
            user.otp = generate_otp()
            user.save()

            # Send OTP Email
            send_mail(
                'Your KitaabSe Signup OTP',
                f'Your OTP code is {user.otp}',
                None,  # from email will use DEFAULT_FROM_EMAIL
                [user.email],
                fail_silently=False,
            )

            return Response({"detail": "OTP sent to your email."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyOtpView(APIView):
    def post(self, request):
        serializer = VerifyOtpSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = User.objects.get(email=serializer.validated_data['email'])
            except User.DoesNotExist:
                return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

            if user.is_verified:
                return Response({"detail": "User already verified."}, status=status.HTTP_400_BAD_REQUEST)

            if user.otp == serializer.validated_data['otp']:
                user.is_verified = True
                user.otp = ""
                user.save()

                # Generate JWT tokens on verification success
                refresh = RefreshToken.for_user(user)
                return Response({
                    "detail": "User verified successfully.",
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                })
            else:
                return Response({"detail": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp = serializer.validated_data.get('otp')

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({"detail": "User not found. Please signup."}, status=status.HTTP_404_NOT_FOUND)

            if not user.is_verified:
                return Response({"detail": "User not verified. Please verify OTP first."}, status=status.HTTP_401_UNAUTHORIZED)

            if not otp:
                return Response({"detail": "Please provide OTP sent to your email."}, status=status.HTTP_400_BAD_REQUEST)

            if otp != user.otp:
                return Response({"detail": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)

            # Clear OTP after successful login
            user.otp = ""
            user.save()

            # Generate JWT token
            refresh = RefreshToken.for_user(user)
            return Response({
                "detail": "Login successful.",
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "is_verified": user.is_verified
                }
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
