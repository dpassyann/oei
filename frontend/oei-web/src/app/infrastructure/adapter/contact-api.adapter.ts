import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ContactPort } from '../../domain/port/contact.port';
import { ContactMessage } from '../../domain/model/contact/contact-message';
import { RuntimeConfig } from '../config/runtime-config';

@Service()
export class ContactApiAdapter implements ContactPort {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfig = inject(RuntimeConfig);

  submit(message: ContactMessage): Observable<void> {
    return this.http
      .post(`${this.runtimeConfig.apiBaseUrl()}/contact`, message)
      .pipe(map(() => undefined));
  }
}
