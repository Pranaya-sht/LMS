from rest_framework import viewsets, generics, permissions, status, filters
from rest_framework.response import Response
from .models import Book, BorrowRecord, Member
from .serializers import BookSerializer, BorrowedBookSerializer, BorrowBookSerializer
from datetime import timedelta
from django.utils import timezone
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Member

# Book View
class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'author']


# List user's borrowed books
class MyBorrowedBooksView(generics.ListAPIView):
    serializer_class = BorrowedBookSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        records = BorrowRecord.objects.filter(member__user=self.request.user, return_date__isnull=True)

        now = timezone.now()
        # for record in records:
        #     if record.due_date and record.due_date < now:
        #         record.fine_amount = record.calculate_and_accumulate_fine()
        #         record.save(update_fields=['fine_amount'])

        return records


# Rent a book
class AddToBookListView(generics.CreateAPIView):
    serializer_class = BorrowBookSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        member, created = Member.objects.get_or_create(
    user=request.user,
    defaults={'student_id': request.user.username}  # or any unique value like f"{request.user.username}_{request.user.id}"
)

        book_id = request.data.get('book_id')
        rental_seconds = int(request.data.get('rental_seconds', 604800))  # default 7 days

        try:
            book = Book.objects.get(id=book_id)
        except Book.DoesNotExist:
            return Response({'error': 'Book not found'}, status=status.HTTP_404_NOT_FOUND)

        if book.available_copies < 1:
            return Response({'error': 'No copies available'}, status=status.HTTP_400_BAD_REQUEST)

        # Decrease stock
        book.available_copies -= 1
        book.save()

        borrow = BorrowRecord.objects.create(
            member=member,
            book=book,
            rental_seconds=rental_seconds,
            due_date=timezone.now() + timedelta(seconds=rental_seconds)
        )

        return Response(BorrowedBookSerializer(borrow).data, status=status.HTTP_201_CREATED)


# Renew rental
class RenewBookView(generics.UpdateAPIView):
    serializer_class = BorrowedBookSerializer
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            borrow = BorrowRecord.objects.get(pk=pk, member__user=request.user)
        except BorrowRecord.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        # Accumulate the current fine before resetting the timer
        borrow.fine_amount = borrow.calculate_and_accumulate_fine()

        # Reset the timer to now + new duration
        new_seconds = int(request.data.get('rental_seconds', 0))
        borrow.rental_seconds = new_seconds
        borrow.due_date = timezone.now() + timedelta(seconds=new_seconds)
        borrow.renewed_times += 1

        borrow.save(update_fields=['fine_amount', 'rental_seconds', 'due_date', 'renewed_times'])

        return Response(BorrowedBookSerializer(borrow).data)


# Return/remove book
class RemoveBookView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        try:
            record = BorrowRecord.objects.get(pk=pk, member__user=request.user, return_date__isnull=True)
        except BorrowRecord.DoesNotExist:
            return Response({'error': 'Not found or already returned'}, status=status.HTTP_404_NOT_FOUND)

        # Calculate and accumulate fine before returning
        record.fine_amount = record.calculate_and_accumulate_fine()

        # Return book
        record.return_date = timezone.now()
        record.save(update_fields=['fine_amount', 'return_date'])

        # Increase book stock
        record.book.available_copies += 1
        record.book.save(update_fields=['available_copies'])

        return Response({'message': 'Book returned', 'fine': record.fine_amount}, status=status.HTTP_200_OK)

class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            member = Member.objects.get(user=request.user)
            #record jhiknuparyo
            

           
            data = {
                'name': request.user.username,
                'email': request.user.email,
                'memberSince': member.date_joined.strftime('%Y-%m-%d'),
                'totalDue': member.total_due-member.fine_paid,
                'contact': member.contact,
                'address': member.address,
            }
            return Response(data)
        except Member.DoesNotExist:
            return Response({'detail': 'Member not found'}, status=404)
    
    def put(self, request):
        try:
            member = Member.objects.get(user=request.user)
            user = request.user

            user.first_name = request.data.get('name', user.first_name)
            user.email = request.data.get('email', user.email)
            user.save()

            member.contact = request.data.get('contact', member.contact)
            member.address = request.data.get('address', member.address)
            member.save()

            data = {
                'name': user.get_full_name(),
                'email': user.email,
                'memberSince': member.date_joined.strftime('%Y-%m-%d'),
                'totalDue': member.total_due,
                'contact': member.contact,
                'address': member.address,
            }
            return Response(data)
        except Member.DoesNotExist:
            return Response({'detail': 'Member not found'}, status=404)
