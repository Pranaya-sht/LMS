from rest_framework import serializers
from .models import Book, BorrowRecord

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = '__all__'


class BorrowedBookSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_author = serializers.CharField(source='book.author', read_only=True)
    cover_image = serializers.ImageField(source='book.cover_image', read_only=True)
    fine = serializers.SerializerMethodField()

    class Meta:
        model = BorrowRecord
        fields = [
            'id', 'book_title', 'book_author', 'cover_image',
            'borrow_date', 'due_date', 'return_date', 'fine_amount', 'fine'
        ]

    def get_fine(self, obj):
        return obj.calculate_and_accumulate_fine()


# For creating a borrow
class BorrowBookSerializer(serializers.ModelSerializer):
    book_id = serializers.IntegerField(write_only=True)
    rental_seconds = serializers.IntegerField(write_only=True)

    class Meta:
        model = BorrowRecord
        fields = ['id', 'book_id', 'rental_seconds']