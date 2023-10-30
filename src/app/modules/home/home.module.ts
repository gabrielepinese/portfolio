import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { WorkExperienceComponent } from './section/work-experience/work-experience.component';

@NgModule({
  declarations: [HomeComponent, WorkExperienceComponent],
  imports: [CommonModule, HomeRoutingModule],
})
export class HomeModule {}
