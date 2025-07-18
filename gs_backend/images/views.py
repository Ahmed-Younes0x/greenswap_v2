from django.http import FileResponse, Http404
from django.conf import settings
import os

def serve_image(request, filename):
    image_path = settings.MEDIA_ROOT / 'items' / filename
    default_path = settings.MEDIA_ROOT / 'items' / 'default.jpg'

    if image_path.exists():
        return FileResponse(open(image_path, 'rb'), content_type='image/jpeg')
    elif default_path.exists():
        return FileResponse(open(default_path, 'rb'), content_type='image/jpeg')
    else:
        raise Http404("Image and default image not found")
