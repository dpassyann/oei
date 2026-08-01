import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteHeader } from './presentation/components/site-header/site-header';
import { SiteFooter } from './presentation/components/site-footer/site-footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SiteHeader, SiteFooter],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
