import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  private baseUrl = 'http://localhost:3002'; // Business service URL

  constructor(private http: HttpClient) {}

  getOrders(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/orders`, { withCredentials: true });
  }

  createBusinessRecord(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/business-records`, data, { withCredentials: true });
  }
}
// Contains AI-generated edits.