from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from services.global_search_service import global_search


class GlobalSearchAPIView(APIView):

    permission_classes = [
        IsAuthenticated,
    ]

    def get(self, request):

        search_query = request.query_params.get(
            "search",
            "",
        ).strip()

        results = global_search(
            search_query
        )

        return Response(
            {
                "search": search_query,
                "results": results,
            },
            status=status.HTTP_200_OK,
        )