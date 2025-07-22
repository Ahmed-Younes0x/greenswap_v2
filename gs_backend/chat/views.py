from rest_framework import generics, permissions, status
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Count
from items.models import Item  # Import your Item model

User = get_user_model()

class ConversationListView(generics.ListAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(participants=self.request.user).order_by('-updated_at')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def post(self, request, *args, **kwargs):
        # Get participant IDs and item ID from request data
        participant_ids = request.data.get('participants', [])
        item_id = request.data.get('item', None)
        
        # Validate required fields
        if not item_id:
            return Response(
                {'error': 'Item ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Ensure the current user is included in participants
        if request.user.id not in participant_ids:
            participant_ids.append(request.user.id)
        
        # Get user objects for all participants
        participants = User.objects.filter(id__in=participant_ids).distinct()
        
        # Check if all requested participants exist
        if len(participants) != len(participant_ids):
            return Response(
                {'error': 'One or more participants not found'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            item = Item.objects.get(id=item_id)
        except Item.DoesNotExist:
            return Response(
                {'error': 'Item not found'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if a conversation with these participants and item already exists
        existing_conversation = self.get_existing_conversation(participants, item)
        if existing_conversation:
            serializer = self.get_serializer(existing_conversation)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        # Create new conversation
        conversation = Conversation.objects.create(item=item)
        conversation.participants.set(participants)
        
        serializer = self.get_serializer(conversation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def get_existing_conversation(self, participants, item):
        """
        Helper method to check if a conversation with these participants and item already exists.
        """
        # Get conversations that include all participants and the item
        conversations = Conversation.objects.filter(
            item=item,
            participants__in=participants
        ).annotate(
            participant_count=Count('participants')
        ).filter(
            participant_count=len(participants)
        ).distinct()
        
        # Return the first matching conversation if any
        return conversations.first() if conversations.exists() else None

# ... rest of your code remains the same ...
class MessageListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, conversation_id):
        conversation = get_object_or_404(Conversation, id=conversation_id, participants=request.user)
        messages = conversation.messages.all().order_by("timestamp")
        return Response(MessageSerializer(messages, many=True).data)

    def post(self, request, conversation_id):
        conversation = get_object_or_404(Conversation, id=conversation_id, participants=request.user)
        print("Creating message in conversation:", request.data)
        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            content=request.data,
            type="text"
        )
        return Response(MessageSerializer(message).data)