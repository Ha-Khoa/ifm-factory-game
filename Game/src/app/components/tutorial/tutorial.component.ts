import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tutorial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.css']
})
export class TutorialComponent {
  @Output() closeRequest = new EventEmitter<void>();


  slides: string[] = [
    '/images/tutorial/Screen1.png', 
    '/images/tutorial/Screen2.png',
    '/images/tutorial/Screen3.png',
    '/images/tutorial/Screen4.png',
  ];
  
  currentSlide = 0;

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    const key = event.key.toLowerCase();

    if (key === 'd' || key === 'arrowright') {
      this.nextSlide();
    } 
    else if (key === 'a' || key === 'arrowleft') {
      this.prevSlide();
    } 
    else if (key === 'e' || key === 'enter' || key === 'escape') {
      this.closeRequest.emit();
    }
  }

  nextSlide() {
    if (this.currentSlide < this.slides.length - 1) {
      this.currentSlide++;
    } else {
      this.currentSlide = 0;
    }
  }

  prevSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
    } else {
      this.currentSlide = this.slides.length - 1;
    }
  }
}