import { Component, ElementRef } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'portfolio';

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit() {
    const container = this.elementRef.nativeElement.querySelector('.main-div');
    const eye = this.elementRef.nativeElement.querySelector('.eye');

    container.addEventListener('mousemove', (event: any) => {
      const x = eye.offsetLeft + eye.offsetWidth / 2;
      const y = eye.offsetTop + eye.offsetHeight / 2;
      const rad = Math.atan2(event.pageX - x, event.pageY - y);
      const rot = rad * (180 / Math.PI) * -1 + 180;

      eye.style.transform = `rotate(${rot}deg)`;
    });
  }
}
