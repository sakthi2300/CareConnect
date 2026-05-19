import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class ApiService {
  private readonly baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  get<T>(url: string, options?: object): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${url}`, options);
  }

  post<T>(url: string, body: any, options?: object): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${url}`, body, options);
  }

  put<T>(url: string, body: any, options?: object): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${url}`, body, options);
  }

  delete<T>(url: string, options?: object): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${url}`, options);
  }
}

