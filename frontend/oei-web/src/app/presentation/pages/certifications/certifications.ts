import { Component } from '@angular/core';

@Component({
  selector: 'oei-certifications',
  templateUrl: './certifications.html',
  styleUrl: './certifications.scss',
})
export class Certifications {
  protected readonly levels: readonly string[] = [
    'Praticien',
    'Ingénieur',
    'Architecte',
    'Expert',
    'Expert senior',
    'Fellow',
  ];
}
