import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  formData = {
    name: '',
    email: '',
    message: ''
  };
  submitted = false;
  loading = false;
  error = '';
  success = '';

  constructor(private http: HttpClient) {}

  onSubmit() {
    if (!this.formData.name || !this.formData.email || !this.formData.message) {
      this.error = 'Please fill in all fields';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.http.post('http://localhost:5000/api/contact', this.formData)
      .subscribe({
        next: () => {
          this.success = 'Message sent successfully!';
          this.formData = { name: '', email: '', message: '' };
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to send message. Please try again.';
          this.loading = false;
        }
      });
  }
}
