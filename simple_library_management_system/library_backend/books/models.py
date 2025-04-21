from django.db import models
from django.contrib.auth.models import User
from datetime import timedelta
from django.utils import timezone
from django.db.models import Sum
import math

class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    isbn = models.CharField(max_length=13, unique=True)
    category = models.CharField(max_length=100)
    total_copies = models.PositiveIntegerField()
    available_copies = models.PositiveIntegerField()
    published_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to='covers/', null=True, blank=True)
    

    def __str__(self):
        return f"{self.title} by {self.author}"


class Member(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    student_id = models.CharField(max_length=20, unique=True)
    contact = models.CharField(max_length=15)
    address = models.TextField()
    date_joined = models.DateField(auto_now_add=True)
    membership_type = models.CharField(
        max_length=50,
        choices=[
            ('student', 'Student'),
            ('faculty', 'Faculty'),
            ('public', 'Public'),
        ]
    )
    total_due = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    fine_paid=models.DecimalField(max_digits=10,decimal_places=2,default=0.0)
    def __str__(self):
        return self.user.username
    
    def update_total_due(self):
        fine=0
        for book in BorrowRecord.objects.filter(member=self):
                fine+=float(book.fine_amount)
                if book.return_date==None:
                    fine+=book.calculate_new_fine()
        
        self.total_due = fine
        self.save(update_fields=['total_due'])
        return self.total_due


class BorrowRecord(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    borrow_date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField()
    return_date = models.DateTimeField(null=True, blank=True)
    fine_amount = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    renewed_times = models.PositiveIntegerField(default=0)
    rental_seconds = models.PositiveIntegerField(default=604800)  # Default: 7 days in seconds

    def is_overdue(self):
        # Ensure due_date is timezone-aware
        due = self.due_date
        if timezone.is_naive(due):
            due = timezone.make_aware(due)
        return self.return_date is None and timezone.now() > due

    def calculate_new_fine(self):
      
        if self.is_overdue():
            # overdue_days = (timezone.now() - self.due_date).days #0days 23 hr  1 sec
            overdue_days =math.ceil((timezone.now() - self.due_date).seconds/86400)
        
            return round(overdue_days * 10.0, 2)
        return 0.0

    def calculate_and_accumulate_fine(self):
        # Calculate new fine since last renewal/creation and add to existing fine
        new_fine = self.calculate_new_fine()
        return round(float(self.fine_amount) + new_fine, 2)

    # def renew(self, additional_seconds):
    #     """Extend rental time and update due_date"""
    #     # Accumulate the current fine before resetting the timer
    #     self.fine_amount = self.calculate_and_accumulate_fine()
    #     # Reset the timer
    #     self.due_date = timezone.now() + timedelta(seconds=additional_seconds)
    #     self.rental_seconds = additional_seconds
    #     self.renewed_times += 1
    #     self.save()


    def save(self, *args, **kwargs):
  
        #pre save logic haru'
        self.member.update_total_due()

        #save functianlity
        super().save(*args, **kwargs)

        # Update member's total_due after saving
        

    def __str__(self):
        return f"{self.member.user.username} borrowed {self.book.title}"





    # def do_something(self):
    #     print('Another Thing')
    #     super().do_something()
