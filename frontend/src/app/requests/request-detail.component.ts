import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../core/services/api.service';

@Component({
  selector: 'app-request-detail',
  template: `
    <div *ngIf="request">
      <h2>{{ request.title }}</h2>
      <p>{{ request.description }}</p>
      <p><strong>Status:</strong> {{ request.status }}</p>
      <p><strong>Hospital:</strong> {{ request.hospitalName }}</p>
      <p>
        Doctors: {{ request.numDoctorsAccepted }}/{{ request.numDoctorsRequired }} |
        Nurses: {{ request.numNursesAccepted }}/{{ request.numNursesRequired }}
      </p>
    </div>
    <p *ngIf="!request && !error">Loading...</p>
    <p *ngIf="error" style="color:red;">{{ error }}</p>
  `
})
export class RequestDetailComponent implements OnInit {
  request: any = null;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private api: ApiService) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.get<any>(`/staff/requests/${id}`).subscribe({
        next: res => this.request = res,
        error: err => this.error = 'Failed to load request details'
      });
      console.log(this.request, "valthukal");
    }
  }
}
