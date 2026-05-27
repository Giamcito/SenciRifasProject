import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-rifas-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rifas-preview.component.html',
  styleUrl: './rifas-preview.component.css'
})
export class RifasPreviewComponent implements OnInit {
  user: any;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.user = user;
    });
  }
}
