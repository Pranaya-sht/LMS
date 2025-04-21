from django.core.management.base import BaseCommand
from books.models import Book
import requests
import os
from django.core.files.base import ContentFile
from django.utils.text import slugify

class Command(BaseCommand):
    help = 'Import books from a list of dictionaries'

    def handle(self, *args, **kwargs):
        Book.objects.all().delete()
        books_data = [
    {
        "title": "Harry Potter and the Sorcerer's Stone",
        "author": "J.K. Rowling",
        "isbn": "9780590353427",
        "cover_image": "https://covers.openlibrary.org/b/id/8225636-L.jpg",
        "description": "The first book in the magical Harry Potter series, introducing Hogwarts and the wizarding world.",
        "published_date": "1997-06-26",
        "category": "Fantasy"
    },
    {
        "title": "The Hobbit",
        "author": "J.R.R. Tolkien",
        "isbn": "9780547928227",
        "cover_image": "https://covers.openlibrary.org/b/id/17471019-L.jpg",
        "description": "Bilbo Baggins embarks on an unexpected journey with dwarves to reclaim a stolen treasure guarded by a dragon.",
        "published_date": "1937-09-21",
        "category": "Fantasy"
    },
    {
        "title": "1984",
        "author": "George Orwell",
        "isbn": "9780451524935",
        "cover_image": "https://covers.openlibrary.org/b/id/8228379-L.jpg",
        "description": "A chilling dystopian novel about a totalitarian regime and surveillance state that rewrites history.",
        "published_date": "1949-06-08",
        "category": "Dystopian"
    },
    {
        "title": "To Kill a Mockingbird",
        "author": "Harper Lee",
        "isbn": "9780060935467",
        "cover_image": "https://covers.openlibrary.org/b/id/10187156-L.jpg",
        "description": "A story of racial injustice and childhood innocence in the Deep South, seen through the eyes of Scout Finch.",
        "published_date": "1960-07-11",
        "category": "Classic"
    },
    {
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "isbn": "9780743273565",
        "cover_image": "https://covers.openlibrary.org/b/id/10142858-L.jpg",
        "description": "A critique of the American Dream, set in the Jazz Age and centered around the mysterious Jay Gatsby.",
        "published_date": "1925-04-10",
        "category": "Classic"
    },
    {
        "title": "The Catcher in the Rye",
        "author": "J.D. Salinger",
        "isbn": "9780316769488",
        "cover_image": "https://covers.openlibrary.org/b/id/10266726-L.jpg",
        "description": "A coming-of-age tale of Holden Caulfield's experiences in New York City as he questions adulthood and identity.",
        "published_date": "1951-07-16",
        "category": "Classic"
    },
    {
        "title": "Pride and Prejudice",
        "author": "Jane Austen",
        "isbn": "9780141439518",
        "cover_image": "https://covers.openlibrary.org/b/id/10152017-L.jpg",
        "description": "Elizabeth Bennet navigates issues of class, family, and love in Georgian-era England.",
        "published_date": "1813-01-28",
        "category": "Romance"
    },
    {
        "title": "The Alchemist",
        "author": "Paulo Coelho",
        "isbn": "9780061122415",
        "cover_image": "https://covers.openlibrary.org/b/id/10143778-L.jpg",
        "description": "An inspirational journey of a young shepherd named Santiago in search of his personal legend.",
        "published_date": "1988-04-15",
        "category": "Philosophical Fiction"
    },
    {
        "title": "The Book Thief",
        "author": "Markus Zusak",
        "isbn": "9780375842207",
        "cover_image": "https://covers.openlibrary.org/b/id/10142860-L.jpg",
        "description": "Narrated by Death, this WWII story follows a young girl who finds solace in books during Nazi Germany.",
        "published_date": "2005-03-14",
        "category": "Historical Fiction"
    },
    {
        "title": "The Fault in Our Stars",
        "author": "John Green",
        "isbn": "9780525478812",
        "cover_image": "https://covers.openlibrary.org/b/id/10427225-L.jpg",
        "description": "A touching love story between two teens living with cancer as they explore life, death, and literature.",
        "published_date": "2012-01-10",
        "category": "Young Adult"
    },
    ]

        for book_data in books_data:
            image_file = None

            # Download image
            cover_image_url = book_data.get('cover_image')
            if cover_image_url:
                try:
                    response = requests.get(cover_image_url)
                    if response.status_code == 200:
                        image_name = slugify(book_data['title']) + ".jpg"
                        image_file = ContentFile(response.content, name=image_name)
                except Exception as e:
                    self.stderr.write(self.style.ERROR(f"Error downloading image: {e}"))

            # Default fields
            book_data.setdefault('category', 'General')
            book_data.setdefault('total_copies', 1)
            book_data.setdefault('available_copies', 1)
            book_data.setdefault('published_date', '1900-01-01')
            book_data.setdefault('description', '')

            # Create or get
            book, created = Book.objects.get_or_create(
                isbn=book_data['isbn'],
                defaults={
                    'title': book_data['title'],
                    'author': book_data['author'],
                    'category': book_data['category'],
                    'total_copies': book_data['total_copies'],
                    'available_copies': book_data['available_copies'],
                    'published_date': book_data['published_date'],
                    'description': book_data['description'],
                }
            )

            # Save image if newly created and image exists
            if created and image_file:
                book.cover_image.save(image_file.name, image_file)
                book.save()

            if created:
                self.stdout.write(self.style.SUCCESS(f"Book '{book.title}' added."))
            else:
                self.stdout.write(self.style.WARNING(f"Book '{book.title}' already exists."))