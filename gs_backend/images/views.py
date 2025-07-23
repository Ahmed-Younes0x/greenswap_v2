from django.http import FileResponse, Http404
from django.conf import settings
from accounts.models import User
from items.models import Item, ItemImage
import os

def serve_image(request, filename):
    # Use os.path.join for cross-platform compatibility
    image_path = os.path.join(settings.MEDIA_ROOT, 'items', filename)
    default_path = os.path.join(settings.MEDIA_ROOT, 'items', 'default.jpg')

    try:
        if os.path.exists(image_path):
            return FileResponse(open(image_path, 'rb'), content_type='image/jpeg')
        elif os.path.exists(default_path):
            return FileResponse(open(default_path, 'rb'), content_type='image/jpeg')
        raise Http404("Image not found")
    except Exception as e:
        raise Http404(f"Error accessing image: {str(e)}")

def serve_image_itemid(request, itemid):
    try:
        item = Item.objects.filter(id=itemid).first()
        if not item:
            raise Http404("Item not found")
            
        image = ItemImage.objects.filter(item=item).first()
        if image and image.image:  # Assuming image field is named 'image'
            # Get just the filename from the ImageField
            filename = os.path.basename(image.image.name)
            return serve_image(request, filename)
        
        # Fall back to default image
        return serve_image(request, 'default.jpg')
        
    except Exception as e:
        raise Http404(f"Error retrieving image: {str(e)}")
    
# def serve_image_avatar(request, itemid):
    # try:
    #     user = User.objects.filter(id=itemid).first()
    #     if not user:
    #         raise Http404("Item not found")
    # # Use os.path.join for cross-platform compatibility
    # image_path = os.path.join(settings.MEDIA_ROOT, 'avatar', User.avatar.toString())
    # default_path = os.path.join(settings.MEDIA_ROOT, 'avatar', 'default.jpg')

    # try:
    #     if os.path.exists(image_path):
    #         return FileResponse(open(image_path, 'rb'), content_type='image/jpeg')
    #     elif os.path.exists(default_path):
    #         return FileResponse(open(default_path, 'rb'), content_type='image/jpeg')
    #     raise Http404("Image not found")
    # except Exception as e:
    #     raise Http404(f"Error accessing image: {str(e)}")