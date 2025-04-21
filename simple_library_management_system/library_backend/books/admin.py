from django.contrib import admin
from django.utils import timezone
from datetime import timedelta
from .models import Book, Member, BorrowRecord
from decimal import Decimal
@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'isbn', 'category', 'available_copies', 'cover_image_display')
    search_fields = ('title', 'author', 'isbn')

    def cover_image_display(self, obj):
        if obj.cover_image:
            return f'<img src="{obj.cover_image.url}" width="50" height="50" />'
        return 'No image'
    
    cover_image_display.allow_tags = True  # This ensures that the HTML for the image tag is rendered properly

@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ('user', 'student_id', 'membership_type', 'date_joined', 'due_amount')
    search_fields = ('user__username', 'student_id')
    def due_amount(self,obj):
       return  obj.total_due-obj.fine_paid

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # Update total_due for each member when viewing the admin panel
        for member in qs:
            member.update_total_due()
        return qs

@admin.register(BorrowRecord)
class BorrowRecordAdmin(admin.ModelAdmin):
    list_display = ('member', 'book', 'borrow_date', 'due_date', 'return_date', 'fine_amount_display')
    list_filter = ('borrow_date', 'due_date', 'return_date')
    actions = ['renew_borrow_records', 'return_borrow_records']
    def fine_amount_display(self,obj):
          if obj.return_date==None:
               return obj.fine_amount+Decimal(obj.calculate_new_fine())
          return obj.fine_amount
        
    def get_queryset(self, request):
        qs = super().get_queryset(request)
     
          
           
        # Update fine_amount for each record when viewing the admin panel
        # for record in qs:
        #     if record.return_date is None:  # Only for active borrows
        #         pass
                # record.fine_amount = record.calculate_and_accumulate_fine()
                # record.save(update_fields=['fine_amount'])
        return qs

    def renew_borrow_records(self, request, queryset):
        for record in queryset:
            if record.return_date is None:  # Only renew active borrows
                # Accumulate the current fine before resetting the timer
                record.fine_amount = record.calculate_and_accumulate_fine()
                # Reset the timer
                additional_seconds = 604800  # Default 7 days
                record.due_date = timezone.now() + timedelta(seconds=additional_seconds)
                record.rental_seconds = additional_seconds
                record.renewed_times += 1
                record.save()
                # Update member's total_due
                record.member.update_total_due()
        self.message_user(request, "Selected borrow records have been renewed for 7 days.")
    
    renew_borrow_records.short_description = "Renew selected borrow records"

    def return_borrow_records(self, request, queryset):
        for record in queryset:
            if record.return_date is None:  # Only return active borrows
                record.return_date = timezone.now()
                record.fine_amount = record.calculate_and_accumulate_fine()
                record.book.available_copies += 1
                record.book.save(update_fields=['available_copies'])
                record.save()
                # Update member's total_due
                record.member.update_total_due()
        self.message_user(request, "Selected borrow records have been returned.")
    
    return_borrow_records.short_description = "Return selected borrow records"