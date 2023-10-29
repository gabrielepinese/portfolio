import { Component, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'portfolio';

  // constructor(private elRef: ElementRef, private renderer: Renderer2) {}

  // ngAfterViewInit() {
  // const moveArea = this.elRef.nativeElement.querySelector('.main-div');
  // const eye = this.elRef.nativeElement.querySelector('.eye');

  // moveArea.addEventListener('mousemove', (event: any) => {
  //   const x = eye.offsetLeft + eye.offsetWidth / 2;
  //   const y = eye.offsetTop + eye.offsetHeight / 2;
  //   const rad = Math.atan2(event.pageX - x, event.pageY - y);
  //   const rot = rad * (180 / Math.PI) * -1 + 180;

  //   this.renderer.setStyle(eye, '-webkit-transform', `rotate(${rot}deg)`);
  //   this.renderer.setStyle(eye, '-moz-transform', `rotate(${rot}deg)`);
  //   this.renderer.setStyle(eye, '-ms-transform', `rotate(${rot}deg)`);
  //   this.renderer.setStyle(eye, 'transform', `rotate(${rot}deg)`);
  // });
  // }

  styleEye: any = {};
  tiredness: number = 0;

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    const position = this.getMousePosition(event);
    this.styleEye = this.calculateEyeStyle(position.angle.eye);
  }

  getMousePosition(event: MouseEvent) {
    const eye = this.getElementPosition('eye');
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const angleEye = this.calculateAngle(eye, mouseX, mouseY);

    return {
      angle: {
        eye: angleEye,
      },
    };
  }

  getElementPosition(elementId: string) {
    const element = document.getElementById(elementId);
    const rect = element!.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }

  calculateAngle(
    eyePosition: { x: number; y: number },
    mouseX: number,
    mouseY: number
  ) {
    const x = eyePosition.x;
    const y = eyePosition.y;
    const rad = Math.atan2(mouseX - x, mouseY - y);
    const deg = rad * (180 / Math.PI) + 180;
    return deg;
  }

  calculateEyeStyle(angle: number) {
    const redEye =
      (angle < 30 || (angle < 360 && angle > 330)) &&
      angle > 150 &&
      angle < 210;

    return {
      transform: `rotate(${-angle}deg)`,
      backgroundColor: redEye ? '#f8c6c6' : '#f3efef',
      transition: `all ${this.tiredness}s ease`,
    };
  }
}
