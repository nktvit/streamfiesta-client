import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class VercelApiService {
  private apiUrl = '/api'; // This will be the base URL for your Vercel serverless functions

  constructor(private http: HttpClient) {}

  // Example GET request
  getData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/example`);
  }

  // Example POST request
  postData(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/example`, data);
  }
}
