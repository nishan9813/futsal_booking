import openrouteservice
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from ..models import Ground
from ..utils.sorting import Price_sorting

ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjFmY2EwZTY4ZWYwZjQ0MjI4ODkwZjg3MWYzNWQxMDljIiwiaCI6Im11cm11cjY0In0='
class GroundDistanceView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        user_lat = request.data.get('latitude')
        user_lng = request.data.get('longitude')
        ground_id = request.data.get('ground_id')  # optional, can fetch one specific ground

        # Basic validation
        if user_lat is None or user_lng is None:
            return Response({"error": "latitude and longitude are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_lat = float(user_lat)
            user_lng = float(user_lng)
        except ValueError:
            return Response({"error": "latitude and longitude must be numbers"}, status=status.HTTP_400_BAD_REQUEST)

        client = openrouteservice.Client(key=ORS_API_KEY)

        # Filter grounds if a specific one is requested
        if ground_id:
            grounds = Ground.objects.select_related("owner").filter(id=ground_id)
        else:
            grounds = Ground.objects.select_related("owner").all()

        ground_list = []

        for ground in grounds:
            if not ground.owner.location:
                continue

            try:
                owner_lat, owner_lng = map(float, ground.owner.location.split(','))
                routes = client.directions(
                    coordinates=[[user_lng, user_lat], [owner_lng, owner_lat]],
                    profile='driving-car',
                    format='json'
                )
                distance_meters = routes['routes'][0]['summary']['distance']
            except Exception:
                distance_meters = None

            ground_list.append({
                'id': ground.id,
                'name': ground.name,
                'futsal_name': ground.owner.futsal_name,
                'location': ground.owner.location,
                'distance_meters': distance_meters
            })

        # Sort by distance if distances exist
        ground_list = sorted(
            [g for g in ground_list if g['distance_meters'] is not None],
            key=lambda x: x['distance_meters']
        )

        return Response(ground_list, status=status.HTTP_200_OK)
    


class GroundPriceSortAPIView(APIView):
    def get(self, request):
        order = request.query_params.get('order', 'asc')
        ascending = True if order.lower() == 'asc' else False

        grounds = list(Ground.objects.all())
        sorted_grounds = Price_sorting(grounds, ascending=ascending)

        data = []
        for g in sorted_grounds:
            data.append({
                "id": g.id,
                "name": g.name,
                "futsal": g.owner.futsal_name if g.owner else None,
                "price": g.price,
                "ground_type": g.ground_type
            })

        return Response(data)
