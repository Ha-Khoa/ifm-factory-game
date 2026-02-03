import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputService } from '../../services/input.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tutorial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.css']
})
export class TutorialComponent implements OnInit, OnDestroy {
  @Output() closeRequest = new EventEmitter<void>();


  slides: string[] = [
    '/images/tutorial/Screen1.png',
    '/images/tutorial/Screen2.png',
    '/images/tutorial/Screen3.png',
    '/images/tutorial/screen4.png',
    '/images/tutorial/screen5.png',
    '/images/tutorial/screen6.png',
    '/images/tutorial/screen7.png',
  ];

  currentSlide = 0;

  private subscriptions: Subscription[] = [];
  private lastInputTime = 0;
  private timeOpened = 0;

  constructor(private inputService: InputService) {}

  ngOnInit(): void {
    this.timeOpened = Date.now();
    this.inputService.setInputState('tutorial');
    this.subscriptions.push(
      this.inputService.tutorialNext$.subscribe(() => this.handleNavigation('next')),
      this.inputService.tutorialPrev$.subscribe(() => this.handleNavigation('prev')),
      this.inputService.tutorialClose$.subscribe(() => this.handleNavigation('close'))
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private handleNavigation(action: 'next' | 'prev' | 'close'): void {
    const now = Date.now();
    if (now - this.lastInputTime < 200) return; // 200ms debounce
    this.lastInputTime = now;

    if (action === 'close' && now - this.timeOpened < 250) {
      return;
    }

    switch (action) {
      case 'next':
        this.nextSlide();
        break;
      case 'prev':
        this.prevSlide();
        break;
      case 'close':
        this.closeRequest.emit();
        break;
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
